import { Component } from 'react';
import { View, Text } from '@tarojs/components';
import './index.scss';


export interface Props {
  text: string;
}

export default class BreakdownText extends Component {
  props: Props = {
    text: ''
  }

  render() {
    return (
      <View className='breakdown-style-title'>
        <Text className='span-b'>{this.props.text}</Text>
        <Text className='span'>{this.props.text}</Text>
        <Text className='span-r'>{this.props.text}</Text>
      </View>
    )
  }
}
