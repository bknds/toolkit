import DTKSdk from "./dtk-sdk"
import CDNSdk from "./cdn-sdk"

const dtkSdk = new DTKSdk()
const cdnSdk = new CDNSdk()

// 商品列表
export const GET_GOODS_LIST = (params) => dtkSdk.get({ url: "/api/goods/get-goods-list", ...params })
// 商品详情
export const GOODS_DETAIL = (params) => dtkSdk.get({ url: "/api/goods/get-goods-details", ...params })
// 搜索联盟商品
export const GOODS_SEARCH = (params) => dtkSdk.get({ url: "/api/tb-service/get-tb-service", ...params })
// 搜索大淘客商品
export const GOODS_DTK_SEARCH = (params) => dtkSdk.get({ url: "/api/goods/get-dtk-search-goods", ...params })
// 生成淘口令
export const CREATE_TAOKOULING = (params) => dtkSdk.get({ url: "/api/tb-service/creat-taokouling", ...params })
// 高效转链
export const GET_PRIVILEGE_LINK = (params) => dtkSdk.get({ url: "/api/tb-service/get-privilege-link", ...params })
// 9.9超值包邮
export const OP_GOODS_LIST = (params) => dtkSdk.get({ url: "/api/goods/nine/op-goods-list", ...params })
// 排行榜
export const RANK_GOODS_LIST = (params) => dtkSdk.get({ url: "/api/goods/get-ranking-list", ...params })
// 热搜关键词
export const SEARCH_HOT_KEYWORDS = (params) => dtkSdk.get({ url: "/api/category/get-top100", ...params })
// 搜索联想词
export const SEARCH_SUGGESTION = (params) => dtkSdk.get({ url: "/api/goods/search-suggestion", ...params })


// 获取贴图数据
export const GET_PASTER_JSON = () => cdnSdk.request({ url: "paster.json"})
