import Taro from "@tarojs/taro";

class Http {
  static baseUrl = "https://openapi.dataoke.com";
  static cdnBaseUrl = "https://cdn.jsdelivr.net/gh/bknds/toolkit/src/static/cdn/";
  static cdnOptions(params) {
    let { url, data, method } = params;
    let contentType = "application/json";
    contentType = params.header.contentType || contentType;
    const option = {
      isShowLoading: false,
      url: this.cdnBaseUrl + url,
      data: data,
      method,
      header: { "content-type": contentType }
    };
    return Taro.request(option);
  }

  static cdn({ url, data, header = {} }) {
    return this.cdnOptions({ url, data, header, method: "GET" });
  }

  static baseOptions(params) {
    let { url, data, method } = params;
    let contentType = "application/json";
    contentType = params.header.contentType || contentType;
    const option = {
      isShowLoading: false,
      url: this.baseUrl + url,
      data: data,
      method,
      header: { "content-type": contentType }
    };
    return Taro.request(option);
  }

  static get({ url, data, header = {} }) {
    return this.baseOptions({ url, data, header, method: "GET" });
  }

  static post({ url, data, header = {} }) {
    return this.baseOptions({ url, data, header, method: "POST" });
  }
}

export default Http;
