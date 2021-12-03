import Http from "./http"

class CDNSdk {
  request({ url, data = {}, header = {}, method = "GET" }) {
    return Http.cdnOptions({
      url,
      data,
      header,
      method,
    })
  }
}

export default CDNSdk
