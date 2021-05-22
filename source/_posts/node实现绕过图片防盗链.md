---
title: node实现绕过图片防盗链
date: 2020-07-21 21:51:46
tags:
  - Node
---

绕过图片防盗链的关键就是要伪造请求头的`Referer`，将`Referer`置为空即可

不要在html增加`<meta name="referrer" content="never">`的方法处理这类事件

```js
const express = require('express')
const app = express()
const port = 3000
const superagent = require('superagent')

function getQueryObject(url) {
  url = url == null ? window.location.href : url
  const search = url.substring(url.lastIndexOf('?') + 1)
  const obj = {}
  const reg = /([^?&=]+)=([^?&=]*)/g
  search.replace(reg, (rs, $1, $2) => {
    const name = decodeURIComponent($1)
    let val = decodeURIComponent($2)
    val = String(val)
    obj[name] = val
    return rs
  })
  return obj
}

// 前端无法修改请求头的Referer，只能通过接口修改，做一个转发请求
app.get('/imgBridge', async (req, res, next) => {
  let url = req.query.url;
  if (!url) {
    res.send('');
    return false;
  }
  // 微信的链接自带说明是什么格式，可以直接取，不用再额外分析文件的格式是什么
  const wx_query = getQueryObject(url);

  superagent.get(req.query.url)
    .set('Referer', '')
    .end(function(err, result) {
      if (err) {
        return false;
      }
      // 返回头必须写入对应的文件类型，直接在浏览器打开才会显示正确的图片而不是下载
      res.set({
        'Content-Type': `image/${query.wx_fmt}`
      });
    	// 返回文件流
      res.end(result.body);
      return;
    });
})
```

使用方法，直接赋值到img的src上或background的url上：

```
http://localhost:8080?url=https://mmbiz.qpic.cn/mmbiz_gif/iblvrvduDqxFibk6bianDue1Ygn2t0k1Cs8dmKjwcibxIesKWwDZwrib0aNxOxpZQyo4MxUPag0Cgz3dCrTMW6prHGA/640?wx_fmt=gif
```

即可显示出图片


