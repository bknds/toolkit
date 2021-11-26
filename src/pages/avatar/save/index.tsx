import { Component } from 'react'
import { View, Image, Button, Text } from '@tarojs/components'
import { getCurrentInstance, authorize, getSetting, getImageInfo, saveImageToPhotosAlbum, showModal } from '@tarojs/taro';
import './index.scss'

type State = {
  img: string,
}

export default class Index extends Component {
  state: State = {
    img: '',
  }

  componentWillMount() {
    const img = getCurrentInstance().router?.params.img;
    this.setState({ img })
  }

  onShareAppMessage() {
    return {
      title: '快来看看我制作的炫酷头像！',
      path: `/pages/avatar/index/index`,
      imageUrl: this.state.img
    }
  }

  public saveAvatarToFile = async () => {
    const imgUrl = this.state.img
    getSetting({ complete() { } }).then(auth => {
      if (auth.authSetting['scope.writePhotosAlbum']) {
        getImageInfo({
          src: imgUrl,
          success: result => {
            if (result.path) {
              saveImageToPhotosAlbum({
                filePath: result.path
              }).then(getImageInfoResult => {
                if (getImageInfoResult.errMsg === 'saveImageToPhotosAlbum:ok') {
                  showModal({
                    title: '头像保存成功！',
                    content: '快去分享给朋友炫耀一下吧！',
                    showCancel: false,
                  })
                } else {
                  showModal({
                    title: '头像保存失败！',
                    showCancel: false,
                  })
                }
              });
            }
          }
        });
      } else {
        authorize({
          scope: 'scope.writePhotosAlbum',
        }).then(() => {
          getImageInfo({
            src: imgUrl,
            success: result => {
              if (result.path) {
                saveImageToPhotosAlbum({
                  filePath: result.path
                }).then(getImageInfoResult => {
                  if (getImageInfoResult.errMsg === 'saveImageToPhotosAlbum:ok') {
                    showModal({
                      title: '头像保存成功！',
                      content: '快去分享给朋友炫耀一下吧！',
                      showCancel: false,
                    })
                  } else {
                    showModal({
                      title: '头像保存失败！',
                      showCancel: false,
                    })
                  }
                });
              }
            }
          });
        });
      }
    }).catch((err) => {
      console.log(err)
    });
  }

  render() {
    return (
      <View className='main-container'>
        <Image src={this.state.img}></Image>
        <Button open-type='share' hoverClass='bottom-btn-active' className='buttom-btn'>
          <View className='iconfont-share'></View>
          <Text>分享给好友</Text>
        </Button>
        <Button onClick={this.saveAvatarToFile}>baocun</Button>
      </View>
    )
  }
}
