import React from "react";
import { View, Canvas } from "@tarojs/components";
import { createCanvasContext, createSelectorQuery } from '@tarojs/taro';
import './index.scss';

type TPaster = {
  width: number;
  height: number;
  src: string;
};

interface IEditorProps {
  width?: number;
  height?: number;
}

interface IEditorState {
  canvasWidth: number;
  canvasHeight: number;
  baseImage: string;
  pasters: Array<TPaster>;
}

class PasterEditor extends React.Component<IEditorProps, IEditorState> {
  constructor(props: IEditorProps) {
    super(props);
    this.setState({
      canvasWidth: props.width || 200,
      canvasHeight: props.height || 200,
    });
  }

  state: IEditorState = {
    canvasWidth: 200,
    canvasHeight: 200,
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

  public init = (res) => {
    this.ctx = res && res.context || createCanvasContext('paster-editor-canvas');
    console.log(this.ctx)
  }

  // 重新绘制画布全部元素
  public draw = () => {
    // 绘制底部背景图
    this.ctx.drawImage(this.state.baseImage, 0, 0, this.state.canvasWidth, this.state.canvasHeight)
    // 根据位置绘制所有贴纸
    this.state.pasters.forEach((paster: TPaster) => {
      this.ctx.drawImage(paster.src, 50, 50, paster.width, paster.height)
    })
    this.ctx.draw()
  }

  // 设置底部背景图片地址
  public setBaseImage = (src: string) => {
    this.setState({
      baseImage: src,
    })
    this.draw()
  }

  // 添加一个新的贴纸
  public insertPaster = (paster: TPaster) => {
    this.state.pasters.push(paster)
    this.draw()
  }

  public render = () => {
    const width = this.state.canvasWidth;
    const height = this.state.canvasHeight;
    return (
      <View className='paster-editor-wrap'>
        <Canvas canvasId='paster-editor-canvas' style={`width:${width}px;height:${height}px;`}></Canvas>
      </View>
    )
  }
}

export default PasterEditor;
