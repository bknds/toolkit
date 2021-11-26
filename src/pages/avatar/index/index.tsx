import { Component } from 'react'
import { View } from '@tarojs/components'
import { chooseImage, navigateTo,navigateToMiniProgram } from '@tarojs/taro'
import BreakdownIcon from '../../../components/breakdown/icon';
import BreakdownText from '../../../components/breakdown/text';
import Cropper from '../../../components/cropper';
import './index.scss'

type State = {
  originImgUrl: string,
}

export default class Index extends Component {
  state: State = {
    originImgUrl: '',
  }

  private _imgCropperElem: any;

  // 跳转饿了么外卖小程序
  toElemeMiniProgram = () => {
    navigateToMiniProgram({
      appId: 'wxece3a9a4c82f58c9',
      path: '/pages/sharePid/web/index?scene=https://s.click.ele.me/0GxBCfu'
    })
  }

  /** 上传用户头像 */
  public onUploadPhoto = () => {
    chooseImage({
      count: 1,
      sizeType: ['original'],
      success: res => {
        console.log(res)
        this.setState({
          originImgUrl: '',
        });
        this.setState({
          originImgUrl: res.tempFilePaths[0],
        });
      }
    })
  }

  /** 编辑头像贴图 */
  public editAvatarPaster = () => {
    if (!this._imgCropperElem) return;
    this._imgCropperElem.fnCrop({
      success: (res) => {
        navigateTo({
          url: `/pages/avatar/edit/index?img=${res.tempFilePath}`
        })
      },
      fail: (err: any) => {
        console.log(err);
      },
    });
  }

  render() {
    const { originImgUrl } = this.state;
    return (
      <View className='upload-origin-images'>
        {originImgUrl && <Cropper aspectRatio={1} imgSrc={originImgUrl} ref={(ele) => this._imgCropperElem = ele} />}
        <View className='options-wrap'>
          <View onClick={this.onUploadPhoto} className='options-btn upload-btn'>
            <BreakdownIcon icon='camera' />
            <BreakdownText text='上传头像' />
          </View>
          <View className='options-btn upload-btn' onClick={this.toElemeMiniProgram}>免费领券</View>
          <View onClick={this.editAvatarPaster} className='options-btn next-btn'>下一步<View className='iconfont-right'></View></View>
        </View>
      </View>
    )
  }
}
