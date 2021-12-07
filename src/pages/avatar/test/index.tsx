import { getImageInfo } from '@tarojs/taro';
import { Component } from 'react'
import { Button, View } from '@tarojs/components'
import PasterEditor from '../../../components/paster';
import './index.scss'

type State = {
  originImgUrl: string,
}

export default class Index extends Component {
  state: State = {
    originImgUrl: 'https://img.alicdn.com/imgextra/i3/904289346/O1CN01tcWYTF2IuWM62PG07_!!904289346.jpg',
  }

  private _pasterEditorElem: any;

  componentWillMount() {
    setTimeout(() => {
      getImageInfo({
        src: this.state.originImgUrl,
        success: result => {
          console.log(result)
          if (result.path) {
            this._pasterEditorElem.setBaseImage(result.path);
          }
        }
      });
    }, 10)
  }

   insertPaster = ()=> {
    getImageInfo({
      src: this.state.originImgUrl,
      success: result => {
        if (result.path) {
          this._pasterEditorElem.insertPaster({
            originPoint: {
              x: 0,
              y:0,
            },
            size: {
              w: 120,
              h:120,
            },
            rotate: 20,
            overturn: true,
            src:result.path
          });
        }
      }
    });
  }

  render() {
    return (
      <View className='container'>
        <PasterEditor ref={(ele) => this._pasterEditorElem = ele} />
        <Button onClick={this.insertPaster}>sasa</Button>
      </View>
    )
  }
}
