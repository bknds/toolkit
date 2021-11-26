import { Component } from 'react';
import { View } from '@tarojs/components';
import './index.scss';

export interface Props {
  icon: string;
}

export default class BreakdownIcon extends Component {
  props: Props = {
    icon: ''
  }

  render() {
    return (
      <View className='breakdown-style-title'>
        <View className={`iconfont-${this.props.icon} icon-b`}></View>
        <View className={`iconfont-${this.props.icon} icon`}></View>
        <View className={`iconfont-${this.props.icon} icon-r`}></View>
      </View>
    )
  }
}
