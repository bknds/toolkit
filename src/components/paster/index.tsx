import React from "react";
import { View, Canvas } from "@tarojs/components";
import { createCanvasContext, createSelectorQuery, getImageInfo } from '@tarojs/taro';
import './index.scss';

type TypePoint = {
  x: number,
  y: number,
}

type TypePaster = {
  originPoint: TypePoint; // 起始点
  size: {
    w: number,
    h: number,
  };
  src: string;
  rotate?: number;
  overturn?: boolean;
  selected?: boolean;
  operate?: string;
};

interface IEditorProps {
  width?: number;
  height?: number;
}

interface IEditorState {
  canvasWidth: number;
  canvasHeight: number;
  baseImage: string;
  pasters: Array<TypePaster>;
}

class PasterEditor extends React.Component<IEditorProps, IEditorState> {
  constructor(props: IEditorProps) {
    super(props);
    this.setState({
      canvasWidth: props.width || 300,
      canvasHeight: props.height || 300,
    });
  }

  state: IEditorState = {
    canvasWidth: 300,
    canvasHeight: 300,
    baseImage: '',
    pasters: [],
  }

  public componentDidMount() {
    // 初始化canvas画布
    createSelectorQuery().select('.paster-editor-wrap').fields({
      node: true,
      size: true,
    }).exec(this.init.bind(this))
  }

  private ctx: any;

  private buttonSize = 24

  private touchStartPoint: TypePoint = {
    x: 0,
    y: 0,
  }

  public init = (res) => {
    this.ctx = res && res.context || createCanvasContext('paster-editor-canvas');
  }

  // 重新绘制画布全部元素
  public draw = () => {
    // 绘制底部背景图
    this.ctx.drawImage(this.state.baseImage, 0, 0, this.state.canvasWidth, this.state.canvasHeight)
    // 根据位置绘制所有贴纸
    this.state.pasters.forEach((paster: TypePaster) => {
      // if (paster.overturn) {
      //   this.ctx.translate(80, 0);
      //   this.ctx.scale(-1, 1);
      // }

      if (paster.rotate) {
        const centerX = paster.originPoint.x + paster.size.w / 2
        const centerY = paster.originPoint.y + paster.size.h / 2
        this.ctx.translate(centerX, centerY)
        this.ctx.rotate((paster.rotate * Math.PI) / 180)
        this.ctx.translate(-centerX, -centerY)
      }

      this.ctx.drawImage(paster.src, paster.originPoint.x, paster.originPoint.y, paster.size.w, paster.size.h)

      if (paster.selected) {
        // 被选中的贴纸
        this.ctx.setLineWidth(1.5)
        this.ctx.setStrokeStyle('white')
        this.ctx.strokeRect(paster.originPoint.x, paster.originPoint.y, paster.size.w, paster.size.h)

        this.ctx.setLineWidth(1.5)
        this.ctx.setFillStyle('red')

        // 绘制删除按钮
        const closePoint: TypePoint = {
          x: paster.originPoint.x - this.buttonSize / 2,
          y: paster.originPoint.y - this.buttonSize / 2,
        }
        this.ctx.drawImage(require('./images/close.png'), closePoint.x, closePoint.y, this.buttonSize, this.buttonSize)
        // 绘制缩放旋转按钮
        const scalePoint: TypePoint = {
          x: paster.originPoint.x + paster.size.w - this.buttonSize / 2,
          y: paster.originPoint.y + paster.size.h - this.buttonSize / 2,
        }
        this.ctx.drawImage(require('./images/scale.png'), scalePoint.x, scalePoint.y, this.buttonSize, this.buttonSize)
        // 绘制镜像翻转按钮
        const overturnPoint: TypePoint = {
          x: paster.originPoint.x + paster.size.w - this.buttonSize / 2,
          y: paster.originPoint.y - this.buttonSize / 2,
        }
        this.ctx.drawImage(require('./images/overturn.png'), overturnPoint.x, overturnPoint.y, this.buttonSize, this.buttonSize)
      }
    })
    this.ctx.draw()
  }

  /**
   * 计算旋转后的新坐标（相对于画布）
   */
  private rotatePoint = (x, y, center: TypePoint, rotate): TypePoint => {
    const newX =
      (x - center.x) * Math.cos((rotate * Math.PI) / 180) -
      (y - center.y) * Math.sin((rotate * Math.PI) / 180) +
      center.x
    const newY =
      (x - center.x) * Math.sin((rotate * Math.PI) / 180) +
      (y - center.y) * Math.cos((rotate * Math.PI) / 180) +
      center.y
    return {
      x: newX,
      y: newY
    }
  }

  /**
   * 计算旋转后矩形四个顶点的坐标
   */
  private rotateSquare = (paster) => {
    const x = paster.originPoint.x
    const y = paster.originPoint.y
    const w = paster.size.w
    const h = paster.size.h
    const center = {
      x: x + w / 2,
      y: y + h / 2,
    }
    const square = [
      this.rotatePoint(x, y, center, paster.rotate),
      this.rotatePoint(x + w, y, center, paster.rotate),
      this.rotatePoint(x + w, y + h, center, paster.rotate),
      this.rotatePoint(x, y + h, center, paster.rotate),
    ]

    // this.ctx.setStrokeStyle('red')
    // this.ctx.beginPath();
    // this.ctx.moveTo(square[0].x,square[0].y)
    // this.ctx.lineTo(square[1].x,square[1].y)
    // this.ctx.lineTo(square[2].x,square[2].y)
    // this.ctx.lineTo(square[3].x,square[3].y)
    // this.ctx.stroke();
    // this.ctx.draw()

    return square
  }

  /**
   *  判断一个点是否在多边形内部
   *  @param points 多边形坐标集合
   *  @param testPoint 测试点坐标
   *  返回true为真，false为假
   *  */
  public insidePolygon = (points: Array<TypePoint>, targetPoint: TypePoint) => {
    let x = targetPoint.x
    let y = targetPoint.y
    let inside = false
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      let xi = points[i].x
      let yi = points[i].y
      let xj = points[j].x
      let yj = points[j].y

      let intersect =
        yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
      if (intersect) inside = !inside
    }


    return inside
  }

  private getButtonAquare = (comparePoint: TypePoint): Array<TypePoint> => {
    const aquare: Array<TypePoint> = [{
      x: comparePoint.x - this.buttonSize / 2,
      y: comparePoint.y - this.buttonSize / 2,
    }, {
      x: comparePoint.x + this.buttonSize / 2,
      y: comparePoint.y - this.buttonSize / 2,
    }, {
      x: comparePoint.x + this.buttonSize / 2,
      y: comparePoint.y + this.buttonSize / 2,
    }, {
      x: comparePoint.x - this.buttonSize / 2,
      y: comparePoint.y + this.buttonSize / 2,
    }]
    return aquare
  }

  // 点击按下事件
  public touchStart(e) {
    e.stopPropagation();
    const touch = e.touches[0];
    this.touchStartPoint = {
      x: touch.pageX,
      y: touch.pageY,
    }
    for (const paster of this.state.pasters) {
      const square = this.rotateSquare(paster)
      if (paster['selected']) {
        // 存在已经选中的贴纸
        paster['operate'] = ''
        const closePoint: Array<TypePoint> = this.getButtonAquare(square[0])
        if (this.insidePolygon(closePoint, { x: this.touchStartPoint.x, y: this.touchStartPoint.y })) {
          paster['operate'] = 'close'
        }
        const overturnPoint: Array<TypePoint> = this.getButtonAquare(square[1])
        if (this.insidePolygon(overturnPoint, { x: this.touchStartPoint.x, y: this.touchStartPoint.y })) {
          paster['operate'] = 'overturn'
        }
        const scalePoint: Array<TypePoint> = this.getButtonAquare(square[2])
        if (this.insidePolygon(scalePoint, { x: this.touchStartPoint.x, y: this.touchStartPoint.y })) {
          paster['operate'] = 'scale'
        }
      }
      paster['selected'] = paster['operate'] !== '' || this.insidePolygon(square, { x: this.touchStartPoint.x, y: this.touchStartPoint.y })
      this.draw()
    }
  }

  public touchMove(e) {
    e.stopPropagation();
    const touch = e.touches[0];
    const pageX = touch.pageX;
    const pageY = touch.pageY;
    const distanceX = pageX - this.touchStartPoint.x
    const distanceY = pageY - this.touchStartPoint.y
    this.touchStartPoint = {
      x: pageX,
      y: pageY,
    }
    for (const paster of this.state.pasters) {
      if (paster['selected'] && !paster['operate']) {
        // 选中贴纸但未选中任何操作按钮
        paster.originPoint.x = paster.originPoint.x + distanceX
        paster.originPoint.y = paster.originPoint.y + distanceY
        break;
      }
    }
    this.draw()
  }

  // 设置底部背景图片地址
  public setBaseImage = (src: string) => {
    this.setState({
      baseImage: src,
    })
    this.draw()
  }

  // 添加一个新的贴纸
  public insertPaster = (paster: TypePaster) => {
    this.state.pasters.forEach((p: TypePaster) => {
      p['selected'] = false;
    })
    paster['selected'] = true;
    this.state.pasters.push(paster)
    this.draw()
  }

  public render = () => {
    const width = this.state.canvasWidth;
    const height = this.state.canvasHeight;
    return (
      <View className='paster-editor-wrap' onTouchStart={(e) => this.touchStart(e)} onTouchMove={(e) => this.touchMove(e)}>
        <Canvas canvasId='paster-editor-canvas' style={`width:${width}px;height:${height}px;`}></Canvas>
      </View>
    )
  }
}

export default PasterEditor;
