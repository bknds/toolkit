/*
 * 大淘客API请求sdk
 */
import GlobalConfig from '../config';
import Http from "./http";
import { hexMD5 } from "./md5";

class DTKSdk {
  appSecret = GlobalConfig.appSecret;
  appKey = GlobalConfig.appKey;

  // 获取指定长度随机数字字符串
  getRandomNumberString(length) {
    let baseArray = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    let result = Array(length)
      .fill("")
      .reduce(
        total =>
          total +
          baseArray[parseInt((Math.random() * baseArray.length).toString())],
        ""
      );
    return result;
  }

  // 大淘客API请求函数
  request({ url, data, header = {}, method = "GET" }) {
    const timer = new Date().getTime();
    const nonce = this.getRandomNumberString(6);
    // 获取验签用加密字符串
    const signString = `appKey=${this.appKey}&timer=${timer}&nonce=${nonce}&key=${this.appSecret}`;
    const signRan = hexMD5(signString).toUpperCase();
    return Http.baseOptions({
      url,
      data: {
        ...data,
        appKey: this.appKey,
        nonce: nonce,
        signRan: signRan,
        timer: timer
      },
      header,
      method
    });
  }
}

export default DTKSdk;

/*
 * 大淘客API请求验签参数加密
 * 新增输入参数：
 * Nonce：一个6位的随机数
 * Timer：毫秒级时间戳
 * 验签步骤：
 * 1、将当前应用的appkey，appsecret，nonce参数和timer参数进行组装，拼接成字符串：appKey=xxx&timer=xxx&nonce=xxx&key=xxx （key对应appsecret）
 * 2、将刚才拼接的字符串进行md5加密并将加密结果转成大写
 * 3、将即将请求的接口的参数进行拼接，并将刚才生成的md5加密结果拼接至请求链接中，然后发送请求。
 * 示例：
 * 请求商品列表接口：
 * https://openapi.dataoke.com/api/goods/get-goods-list?appKey=XXXXXX&nonce=597632&pageId=1&pageSize=200&signRan=BDEBE0C6BBA9BB968995AF7974C072BC&timer=1589253503659&version=v1.2.0&
 * 注：新验签方式md5加密结果须命名为signRan
 */
