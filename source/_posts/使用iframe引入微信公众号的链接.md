---
title: 使用iframe引入微信公众号的链接
date: 2020-07-21 21:56:10
tags:
  - 微信
---

本文实现了以下功能：
- iframe可加载微信公众号内容
- 可加载微信的视频或外链的视频
- 可绕过微信图片的防盗链
- iframe里的微信公众号的跳转链接实现浏览器新窗口跳转

前言：由于微信前端页面的的服务器设置了`Content-Security-Policy`，导致他的资源如果在非白名单的网页被引用，就会拒绝返回资源，导致iframe加载内容失败



> 注：开启了CSP的时候要记得配置一下`unsafe-eval`和`unsafe-inline`，否则一些eval()，setTimeout，setInterval会无法执行；内联script，内联样式，内联事件都会失效

关于CSP的一些详细说明：

<!-- more -->

https://blog.csdn.net/qq_25623257/article/details/90473859

https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CSP

https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Content-Security-Policy



微信的CSP配置如下（检查前端html的响应头返回，微信这里是一个服务端渲染）：

```nginx
content-security-policy: script-src 'self' 'unsafe-inline' 'unsafe-eval' http://*.qq.com https://*.qq.com http://*.weishi.com https://*.weishi.com http://*.m.tencent.com https://*.m.tencent.com http://*.weixin.qq.com https://*.weixin.qq.com https://midas.gtimg.cn 'nonce-505653230';style-src 'self' 'unsafe-inline' http://*.qq.com https://*.qq.com;object-src 'self' http://*.qq.com https://*.qq.com http://*.qpic.cn https://*.qpic.cn http://*.qlogo.cn https://*.qlogo.cn;font-src 'self' data: http://*.qq.com https://*.qq.com http://fonts.gstatic.com https://fonts.gstatic.com;frame-ancestors 'self' http://wx.qq.com https://wx.qq.com http://wx2.qq.com https://wx2.qq.com  http://wx8.qq.com https://wx8.qq.com http://web.wechat.com https://web.wechat.com http://web1.wechat.com https://web1.wechat.com http://web2.wechat.com https://web2.wechat.com http://sticker.weixin.qq.com https://sticker.weixin.qq.com http://bang.qq.com https://bang.qq.com http://app.work.weixin.qq.com https://app.work.weixin.qq.com http://work.weixin.qq.com https://work.weixin.qq.com http://finance.qq.com https://finance.qq.com http://gu.qq.com https://gu.qq.com http://wzq.tenpay.com https://wzq.tenpay.com http://test.tcp.tencent.com https://test.tcp.tencent.com http://dev.tcp.tencent.com https://dev.tcp.tencent.com http://tcp.tencent.com https://tcp.tencent.com http://mail.qq.com https://mail.qq.com http://wx.mail.qq.com https://wx.mail.qq.com http://iwx.mail.qq.com https://iwx.mail.qq.com http://dev.mail.qq.com https://dev.mail.qq.com;report-uri https://mp.weixin.qq.com/mp/fereport?action=csp_report
```

看到配置还配置到了一个`report-uri`，如果触发了拦截，会主动发送POST请求到这个uri里，发送的payload字段如下：

```json
{
  "csp-report": {
    "document-uri": "https://mp.weixin.qq.com/s/84wXnUBr1oE4D9z9oScRmg",
    "referrer": "",
    "violated-directive": "frame-ancestors",
    "effective-directive": "frame-ancestors",
    "original-policy": "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://*.qq.com https://*.qq.com http://*.weishi.com https://*.weishi.com http://*.m.tencent.com https://*.m.tencent.com http://*.weixin.qq.com https://*.weixin.qq.com https://midas.gtimg.cn 'nonce-1034686668';style-src 'self' 'unsafe-inline' http://*.qq.com https://*.qq.com;object-src 'self' http://*.qq.com https://*.qq.com http://*.qpic.cn https://*.qpic.cn http://*.qlogo.cn https://*.qlogo.cn;font-src 'self' data: http://*.qq.com https://*.qq.com http://fonts.gstatic.com https://fonts.gstatic.com;frame-ancestors 'self' http://wx.qq.com https://wx.qq.com http://wx2.qq.com https://wx2.qq.com  http://wx8.qq.com https://wx8.qq.com http://web.wechat.com https://web.wechat.com http://web1.wechat.com https://web1.wechat.com http://web2.wechat.com https://web2.wechat.com http://sticker.weixin.qq.com https://sticker.weixin.qq.com http://bang.qq.com https://bang.qq.com http://app.work.weixin.qq.com https://app.work.weixin.qq.com http://work.weixin.qq.com https://work.weixin.qq.com http://finance.qq.com https://finance.qq.com http://gu.qq.com https://gu.qq.com http://wzq.tenpay.com https://wzq.tenpay.com http://test.tcp.tencent.com https://test.tcp.tencent.com http://dev.tcp.tencent.com https://dev.tcp.tencent.com http://tcp.tencent.com https://tcp.tencent.com http://mail.qq.com https://mail.qq.com http://wx.mail.qq.com https://wx.mail.qq.com http://iwx.mail.qq.com https://iwx.mail.qq.com http://dev.mail.qq.com https://dev.mail.qq.com;report-uri https://mp.weixin.qq.com/mp/fereport?action=csp_report",
    "disposition": "enforce",
    "blocked-uri": "https://mp.weixin.qq.com/s/84wXnUBr1oE4D9z9oScRmg",
    "status-code": 0,
    "script-sample": ""
  }
}
```

并且使用了iframe的前端会报一个错：

```js
Refused to display 'https://mp.weixin.qq.com/s/84wXnUBr1oE4D9z9oScRmg' in a frame because an ancestor violates the following Content Security Policy directive: "frame-ancestors 'self' http://wx.qq.com https://wx.qq.com http://wx2.qq.com https://wx2.qq.com  http://wx8.qq.com https://wx8.qq.com http://web.wechat.com https://web.wechat.com http://web1.wechat.com https://web1.wechat.com http://web2.wechat.com https://web2.wechat.com http://sticker.weixin.qq.com https://sticker.weixin.qq.com http://bang.qq.com https://bang.qq.com http://app.work.weixin.qq.com https://app.work.weixin.qq.com http://work.weixin.qq.com https://work.weixin.qq.com http://finance.qq.com https://finance.qq.com http://gu.qq.com https://gu.qq.com http://wzq.tenpay.com https://wzq.tenpay.com http://test.tcp.tencent.com https://test.tcp.tencent.com http://dev.tcp.tencent.com https://dev.tcp.tencent.com http://tcp.tencent.com https://tcp.tencent.com http://mail.qq.com https://mail.qq.com http://wx.mail.qq.com https://wx.mail.qq.com http://iwx.mail.qq.com https://iwx.mail.qq.com http://dev.mail.qq.com https://dev.mail.qq.com".
```

如果网页不在白名单里，这时候前端就不能够直接引用微信公众号的资源了，只能够将微信本身的html内容返回后，做处理后再渲染出来



寻找了网上的方案，所有的方案都指向了以下项目：

https://github.com/Rob--W/cors-anywhere

该项目可以允许任意跨域请求，且基于nodejs开发，很好地解决了本地部署的问题，因为不可能使用他提供的服务器，很慢且很不稳定，把源码下载下来后可以直接本地部署。用法：

```js
axios.get(process.env.VUE_APP_CORS_ANYWHERE_API_URL + '/' + website)
```



这样就可以返回请求的内容，我们把website替换成微信公众号的链接，这时候返回了html到前端，完成了成功的第一步



拿到html后，尝试使用write写入资源（必须，因为有一些script需要加载，使用`appendChild`会导致这些script无法执行）后，会发现除了标题，其他一片空白，因为很多`visibility`属性都被设置为`hidden`了，需要全局替换一些改为`visible`

>  注：iframe的src不要使用`'data:text/html;charset=utf-8,' + html`的方式加载，使用`container.contentWindow.document.write(html)`写入资源



然后又会发现图片全部都有一个`data-src`属性，原本的`src`属性只是一个默认图，这时候也需要将他们的属性进行替换，`data-src`是用来作为懒加载的，有些js并不能够好好运行，只能改成直接显示



图片显示出来后，会发现微信居然对图片也做了防盗链处理，只能够处理防盗链的问题才能够显示。图片防盗链的原理是在放图片的服务器上加了对`Referer`的验证，资源在请求的时候，会带上`Referer`这个请求头（自动带上，且前端不可以设置这个请求头），那么解决方法就是请求自己的服务器，然后在自己的服务器再请求图片的服务器，自己的服务器置空`Referer`这个请求头，这样图片的服务器就会认为你只是简单的加载图片，而不是通过项目请求的图片，就会成功返回这个图片文件流，然后自己的服务器将这个文件流返回给前端，就可以完成绕过图片防盗链



网上有很多绕过图片防盗链的请求链接，这里推荐使用https://images.weserv.nl，速度很快

但有个坑点，如果是gif，需要在后面加上一些参数`&output=gif&n=-1`，说明他以gif返回，否则返回的图片是不会动的：

```
https://images.weserv.nl/?url=https://mmbiz.qpic.cn/mmbiz_gif/iblvrvduDqxFibk6bianDue1Ygn2t0k1Cs8dmKjwcibxIesKWwDZwrib0aNxOxpZQyo4MxUPag0Cgz3dCrTMW6prHGA/640?wx_fmt=gif&output=gif&n=-1
```

或者使用文章里绕过图片防盗链的node方法，放在自己的服务器更放心。

微信的图片链接一般都会有一个参数说明这个图片是什么类型：`wx_fmt`，否则其实微信这个mmbiz.qpic.cn接口，也只是请求文件流，并不是访问服务器的真实地址，通过这个`wx_fmt`决定了返回的`Content-Type`是什么，这样直接浏览才会显示图片类型，而不是变成了下载这个文件

> 注：不要在html增加`<meta name="referrer" content="never">`的方法处理这类事件



解决了图片的外链问题后，会发现上传到微信服务器的视频的视频链接是无法加载的，且前端报了以下错误：

```
moon4df393.js:275 [TryCatch]Error: Blocked a frame with origin "https://mp.weixin.qq.com" from accessing a cross-origin frame.
```

意思就是这个加载的视频链接，里面加载的js有进行xhr请求，在我们域名进行请求就会造成跨域。



由于在上一个获取微信内容的步骤中，已经有允许跨域请求的接口，我们查找出这个视频链接进行了什么xhr请求，然后使用这个跨域接口将它请求返回到前端即可。这个请求实际是为了返回视频的资源地址，返回了资源地址后，直接修改dom使用video加载这个src即可解决微信视频无法播放的问题

还有一个问题，就是微信对跳转链接【有图片跳转和文字跳转】也做了处理，通过这种方法加载出来的文章点击这个链接是无法跳转的，且需求是需要在浏览器新窗口进行跳转，这就需要特殊处理一下：

大体方向是取到需要跳转链接的a标签的dom，然后addEventListener，分别加入click和touch事件，且必须使用捕获的监听事件，才能正确执行回调的方法且不执行其他微信加了的监听事件

> 以下为具体细节实现源码：

```html
<iframe id="wx_iframe" frameborder="0" scrolling="no"></iframe>
```

```js
let timer = null;
const website = 'https://mp.weixin.qq.com/s/84wXnUBr1oE4D9z9oScRmg';
const imgPrefix = 'https://images.weserv.nl/?url='; // 绕过微信公众号图片的防盗链，如果是加载gif，需要加上参数&output=gif&n=-1，必须加上n=-1，不然不生效

// ...
_getWeixinNews() {
  this.$client.showLoading();
  axios.get(process.env.VUE_APP_CORS_ANYWHERE_API_URL + '/' + website).then(res => {
    // 处理DOMString
    let data = res.data
    // data-src是图片的预加载机制，visible是返回后默认是hidden
    data = data.replace(/data-src/gi, 'src').replace(/hidden/gi, 'visible');
    // 在img前面加上反倒链的请求链接
    data = data.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi, (match, capture) => {
      // gif必须加上额外参数
      if (match.indexOf('data-type="gif"') !== -1) {
        return match.replace(capture, imgPrefix + capture + '&output=gif&n=-1')
      } else {
        return match.replace(capture, imgPrefix + capture)
      }
    });
    // 将DOMString转换为DOM，以便操作DOM
    const wx_dom = document.createElement('div');
    wx_dom.innerHTML = data;
    // 删除加载失败的二维码，要想加载成功需要代理地址
    const qrcode = wx_dom.querySelector('#js_pc_qr_code');
    qrcode && qrcode.parentNode.removeChild(qrcode);
    // 删除再看人数，功能不能正常执行
    const watching = wx_dom.querySelector('#js_like_btn');
    watching && watching.parentNode.removeChild(watching);
    // 删除点击外链的时候会出现的弹框
    const js_link_dialog = wx_dom.querySelector('#js_link_dialog');
    js_link_dialog && js_link_dialog.parentNode.removeChild(js_link_dialog);
    // 处理微信的视频iframe
    const videoElList = Array.from(wx_dom.querySelectorAll('.video_iframe.rich_pages'));
    const _videoInfoList = videoElList.map((el, index) => {
      // 有一些视频是外链，vidtype是1，例如https://mp.weixin.qq.com/s/sMzUXCsPUH1PvtiK3BDU8w，是没有el.dataset.mpvid的，这时候请求会返回的url_info是一个空数组
      // 微信本身的视频的vidtype是为2
      return {
        index,
        container: el.parentNode,
        mpvid: el.dataset.mpvid, // 微信视频的id
        cover: imgPrefix + decodeURIComponent(el.dataset.cover), // 封面
        requestUrl: `http://mp.weixin.qq.com/mp/videoplayer?action=get_mp_video_play_url&preview=0&__biz=&mid=&idx=&vid=${el.dataset.mpvid}&uin=&key=&pass_ticket=&wxtoken=&appmsg_token=&x5=0&f=json` // 请求视频真实地址的请求
      }
    });
    const requestVideoInfoPromiseList = _videoInfoList.map(item => {
      if (item.mpvid) {
        return axios.get(process.env.VUE_APP_CORS_ANYWHERE_API_URL + '/' + item.requestUrl);
      } else {
        return Promise.resolve({ data: null });
      }
    });
    // 渲染函数，在最后一步执行
    const next = () => {
      // 必须使用iframe的write进行写入资源，否则script不会运行，一些微信引用的外链视频就会无法执行
      const container = document.getElementById('wx_iframe');
      container.contentWindow.document.write(wx_dom.innerHTML);
      // iframe无法冒泡出去
      container.contentWindow.document.addEventListener('click', this.handleUnActiveMobileEdit);
      // 处理点击a标签外链链接跳转
      console.log('------- a_link inject -------');
      const aList = Array.from(container.contentWindow.document.querySelectorAll('a'));
      const aLinkList = [];
      for (const aItem of aList) {
        if (aItem.getAttribute('tab') === 'outerlink' && aItem.href) {
          // pc监听，必须使用捕获
          aItem.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            window.open(aItem.href);
          }, true);
          // 移动端监听，必须使用捕获
          aItem.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            window.open(aItem.href);
          }, true);
          aLinkList.push(aItem);
        }
      }
      console.log(aLinkList);
      // 处理微信的page_share_img模式，由于body的class是通过js生成的，会导致部分样式不生效，需要手动添加
      const body = container.contentWindow.document.documentElement || container.contentWindow.document.body;
      body && addClass(body, 'page_share_img');
      // 持续监听iframe的高度，由于图片显示的关系，高度会一直变化
      timer = setInterval(() => {
        if (container.contentWindow) {
          // 使用内容的高度作为iframe的高度，以达到自适应的效果
          const inner = container.contentWindow.document.querySelector('#js_article');
          container.style.height = inner.scrollHeight + 'px';
        }
      }, 1000);
      this.$client.hideLoading();
    }
    // 获取微信video真实播放地址
    Promise.all(requestVideoInfoPromiseList).then(arr => {
      console.log('------- wx_video inject -------');
      const videoInfoList = _videoInfoList.map((item, index) => {
        return {
          ...item,
          videoUrl: (arr[index].data && arr[index].data.url_info && arr[index].data.url_info[0]) ? arr[index].data.url_info[0].url : ''
        }
      });
      for (const item of videoInfoList) {
        if (!item.videoUrl) {
          continue;
        }
        // 安卓微信X5内核浏览器，假如有poster无法显示，video标签加上x5-video-player-type="h5"试试
        item.container.innerHTML = `
          <div>
            <video src="${item.videoUrl}" width="100%" style="object-fit: contain;" poster="${item.cover}" controls="controls"></video>
          </div>
        `;
      }
      console.log(videoInfoList);
      next();
    }).catch((err) => {
      this.$client.error({ message: err.message });
      next();
    });
  }).catch((err) => {
    this.$client.error({ message: err.message });
    this.$client.hideLoading();
  })
}
```




