import { Component } from 'react'
import { View } from '@tarojs/components'
import { getCurrentInstance, navigateTo, getImageInfo, setNavigationBarColor } from '@tarojs/taro'
import CanvasDrag from '../../../components/canvas-drag/canvas-drag';
import { GET_PASTER_JSON } from '../../../service/api';
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

const pasterListDefault = {
  "paster": [{
    "pasters": [
    ],
    "name": "🎄圣诞🎄",
    "code": "christmas"
  }]
}

export default class Index extends Component {
  state: State = {
    graph: {},
    pasterList: pasterListDefault['paster'],
    checkedPasterList: pasterListDefault['paster'][0]
  }

  componentWillMount() {
    setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#fdfdfd',
    });
    this.getPasterList();
    const img = getCurrentInstance().router?.params.img;
    setTimeout(() => {
      CanvasDrag.changeBgImage(img);
    }, 10)
  }

  /** 获取贴纸配置信息 */
  public getPasterList = async () => {
    const res = await GET_PASTER_JSON();
    if (res && res.statusCode === 200) {
      this.setState({
        pasterList: res.data['paster'],
        checkedPasterList: res.data['paster'][0]
      })
    }
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
