/**
 * 添加拦截器:
 *   拦截 request 请求
 *   拦截 uploadFile 文件上传
 *
 * TODO:
 *   1. 非 http 开头需拼接地址
 *   2. 请求超时
 *   3. 添加小程序端请求头标识
 *   4. 添加 token 请求头标识
 */

import { useMemberStore } from '@/stores'

const baseURL = 'https://pcapi-xiaotuxian-front-devtest.itheima.net'

// 添加拦截器
const httpInterceptor = {
  // 拦截前触发
  invoke(options: UniApp.RequestOptions) {
    // 1. 非 http 开头需拼接地址----startsWith:以...开头
    if (!options.url.startsWith('http')) {
      options.url = baseURL + options.url
    }
    // 2. 请求超时, 默认 60s（默认6000毫秒）
    options.timeout = 10000
    // 3. 添加小程序端请求头标识----小程序端调用，请求头中 header 中添加：'source-client': 'miniapp'
    options.header = {
      ...options.header, //如果有标识就不用添加
      'source-client': 'miniapp',
    }
    // 4. 添加 token 请求头标识
    const memberStore = useMemberStore()
    const token = memberStore.profile?.token //token不存在避免被定义成underfined
    if (token) {
      options.header.Authorization = token //用于进行身份验证或授权操作。
    }
  },
}
uni.addInterceptor('request', httpInterceptor) //拦截 request 请求
uni.addInterceptor('uploadFile', httpInterceptor) //拦截 uploadFile 文件上传

/**
 * 请求函数
 * @param  UniApp.RequestOptions
 * @returns Promise
 *  1. 返回 Promise 对象
 *  2. 获取数据成功
 *    2.1 提取核心数据 res.data
 *    2.2 添加类型，支持泛型
 *  3. 获取数据失败
 *    3.1 401错误  -> 清理用户信息，跳转到登录页
 *    3.2 其他错误 -> 根据后端错误信息轻提示
 *    3.3 网络错误 -> 提示用户换网络
 */
type Data<T> = {
  code: string
  msg: string
  result: T
}
// 2.2 添加类型，支持泛型
export const http = <T>(options: UniApp.RequestOptions) => {
  // 1. 返回 Promise 对象
  return new Promise<Data<T>>((resolve, reject) => {
    uni.request({
      ...options,
      // 响应成功
      success(res) {
        // 状态码 2xx， axios 就是这样设计的
        // uni.request 的 success 回调函数只是表示服务器响应成功，没处理响应状态码，业务中使用不方便
        // axios 函数是只有响应状态码是 2xx 才调用 resolve 函数，表示获取数据成功，业务中使用更准确
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 2.1 提取核心数据 res.data
          resolve(res.data as Data<T>)
        } else if (res.statusCode === 401) {
          // 401错误  -> 清理用户信息，跳转到登录页
          const memberStore = useMemberStore()
          memberStore.clearProfile()
          uni.navigateTo({ url: '/pages/login/login' })
          reject(res) //触发 Promise 的失败状态,"res" 可能是一个代表失败原因的参数。这个参数通常是一个对象、错误消息或其他描述性信息，用来说明为什么操作失败了。
        } else {
          // 其他错误 -> 根据后端错误信息轻提示---- uni.showToast提示框
          uni.showToast({
            icon: 'none',
            title: (res.data as Data<T>).msg || '请求错误',
          })
          reject(res)
        }
      },
      // 响应失败
      fail(err) {
        uni.showToast({
          icon: 'none',
          title: '网络错误，换个网络试试',
        })
        reject(err)
      },
    })
  })
}
