import { Component } from 'react'
import { View } from '@tarojs/components'
import { chooseImage, navigateTo, navigateToMiniProgram } from '@tarojs/taro'
import { AtNoticebar } from 'taro-ui'
import './index.scss'

type State = {
}

export default class Index extends Component {
  state: State = {
  }

  render() {
    return (
      <View className='container'>
        <View className='header'>
          <View className='title'>三河疫保通</View>
          <AtNoticebar className='noticebar' icon='volume-plus' marquee single>
            这是 NoticeBar 通告栏，这是 NoticeBar 通告栏，这是 NoticeBar 通告栏
          </AtNoticebar>
        </View>
        <View className='user'></View>
        <View className='options'>
          <View className='button'></View>
          <View className='button'></View>
          <View className='button'></View>
          <View className='button'></View>
          <View className='button'></View>
          <View className='button'></View>
          <View className='button'></View>
        </View>
      </View>
    )
  }
}
