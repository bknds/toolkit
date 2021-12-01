import { Component } from 'react'
import { View } from '@tarojs/components'
import { getCurrentInstance, navigateTo, getImageInfo } from '@tarojs/taro'
import CanvasDrag from '../../../components/canvas-drag/canvas-drag';
import './index.scss'

// eslint-disable-next-line import/no-commonjs
const pasterList = require('https://cdn.jsdelivr.net/gh/bknds/toolkit/src/static/paster.config.ts') ;

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

  public choosePasterItem = (item) => {
    this.setState({
      checkedPasterList: item
    })
  };

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
                  return <View className={item.code === pasterObj.code ? 'checked-paster-tab' : 'paster-tab'} key={item.code} onClick={this.choosePasterItem.bind(this, item)}>{item.name}</View>
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
