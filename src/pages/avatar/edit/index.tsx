import { Component } from 'react'
import { View } from '@tarojs/components'
import { getCurrentInstance, navigateTo, getImageInfo } from '@tarojs/taro'
import CanvasDrag from '../../../components/canvas-drag/canvas-drag';
import './index.scss'

type Paster = {
  pasters: string[],
  name: string,
  code: string,
}

type State = {
  graph: Object,
  pasterList: Array<Paster>,
  checkedPasterList: Paster
}

const pasterList = [{
  "pasters": [
    'https://img.alicdn.com/imgextra/i2/904289346/O1CN01ZSSdDt2IuWLovmdic_!!904289346.png',
    'https://img.alicdn.com/imgextra/i1/904289346/O1CN01qfda9p2IuWLuqGpS3_!!904289346.png',
    'https://img.alicdn.com/imgextra/i3/904289346/O1CN01F8gooJ2IuWLyT1Nik_!!904289346.png',
    'https://img.alicdn.com/imgextra/i1/904289346/O1CN01yZxscs2IuWLzQuzTV_!!904289346.png',
    'https://img.alicdn.com/imgextra/i1/904289346/O1CN01gWtVkL2IuWLzzGIJ0_!!904289346.png',
    'https://img.alicdn.com/imgextra/i4/904289346/O1CN01AE1nkp2IuWM3d63Z3_!!904289346.png',
    'https://img.alicdn.com/imgextra/i4/904289346/O1CN01kGF8Bn2IuWM1tu59F_!!904289346.png',
    'https://img.alicdn.com/imgextra/i2/904289346/O1CN01O1P7Qx2IuWLvyZO7E_!!904289346.png',
    'https://img.alicdn.com/imgextra/i1/904289346/O1CN01BTohoE2IuWLvH5fXh_!!904289346.png',
    'https://img.alicdn.com/imgextra/i1/904289346/O1CN01BBVZwE2IuWLyT1eMo_!!904289346.png',
    'https://img.alicdn.com/imgextra/i3/904289346/O1CN01BF5Y3M2IuWM19g2ka_!!904289346.png',
    'https://img.alicdn.com/imgextra/i2/904289346/O1CN01Xblu5S2IuWLvyYv3Y_!!904289346.png',
    'https://img.alicdn.com/imgextra/i3/904289346/O1CN010DUTCN2IuWLxH5RYW_!!904289346.png',
  ],
  "name": '🎄圣诞🎄',
  "code": 'christmas',
}];

export default class Index extends Component {
  state: State = {
    graph: {},
    pasterList: pasterList,
    checkedPasterList: pasterList[0]
  }

  componentWillMount() {
    const img = getCurrentInstance().router?.params.img;
    setTimeout(() => {
      CanvasDrag.changeBgImage(img);
    }, 10)
  }

  /** 添加贴纸 */
  public onAddPaster = (url) => {
    getImageInfo({
      src: url,
      success: result => {
        if (result.path) {
          this.setState({
            graph: {
              w: 120,
              h: 120,
              type: 'image',
              url: result.path,
            }
          });
        }
      }
    });

  }

  /** 撤销操作 */
  public onUndo = () => {
    CanvasDrag.undo();
  }

  public save = () => {
    CanvasDrag.export().then((filePath) => {
      navigateTo({
        url: `/pages/avatar/save/index?img=${filePath}`
      })
    }).catch((e) => {
      console.error(e);
    })
  }

  render() {
    const pasterObj = this.state.checkedPasterList;

    return (
      <View className='avatar-edit-images'>
        <View className='drag-wrap'>
          <canvasdrag id='canvas-drag' graph={this.state.graph} width='600' height='600' />
        </View>

        <View className='paster-main-content'>
          <View className='paster-tab-title'>
            <View className='paster-tabs'>
              {
                this.state.pasterList.map(item => {
                  return <View className={item.code === pasterObj.code ? 'checked-paster-tab' : 'paster-tab'} key={item.code}>{item.name}</View>
                })
              }
            </View>
            <View className='next-save-btn' onClick={this.save}>完成</View>
          </View>
          <View className='paster-wrap'>
            {pasterObj['pasters'].map((paster, index) =>
              <View key={index} className='paster-btn' style={`background-image:url(${paster})`} onClick={this.onAddPaster.bind(this, paster)}></View>
            )}
          </View>
        </View>
      </View>
    )
  }
}
