---
title: node实现上传文件并保存到硬盘
date: 2020-07-21 21:54:17
tags:
  - Node
---

### 上传文件到node服务器保存并返回文件信息

关键是要使用一个中间件`multer`



使用express：

```js
const express = require('express')
const app = express()
const port = 3000
const multer = require('multer')

const storage = multer.diskStorage({
  // 注意这里，需要具体处理文件的路径
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  // 注意这里，需要具体处理文件的名称，因为存在中文等
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({ storage: storage })

// 多文件就要 upload.array(),单文件就用 upload.single()
// single要与const form = new FormData();form.append('file', event.target.files[0])的key一致；
// single要与<input id='upload' type="file" name="file" />name属性一致
app.post('/upload', upload.single('file'), (req, res, next) => {
  // 这里的req.file返回的是一个json对象
  if (req.file) {
    return res.status(200).json({
      code: 0,
      msg: '上传成功',
      data: req.file
    });
  } else {
    return res.status(200).json({
      code: 1,
      msg: '上传失败',
      data: null
    });
  }
})

// node console.log(req.file)
// {
//   fieldname: 'file',
//   originalname: '19730B75-15AF-4ede-9852-0392DEDD96A4.png',
//   encoding: '7bit',
//   mimetype: 'image/png',
//   destination: './uploads/',
//   filename: '1591588463244-19730B75-15AF-4ede-9852-0392DEDD96A4.png',
//   // 文件保存的路径，这里是由于本机服务器是windows的问题，真实项目需要统一处理路径问题
//   path: 'uploads\\1591588463244-19730B75-15AF-4ede-9852-0392DEDD96A4.png',
//   size: 107642
// }
```



前端代码：

```html
<input type="file" @change="loadFile">
```

```js
loadFile(event) {
  const form = new FormData();
  form.append('file', event.target.files[0])
  axios({
    method: 'POST',
    url: 'http://localhost:3000/upload',
    // request headers的content-type必须设置为multipart/form-data
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: form
  })
}
```



返回的data里会有path的属性，是中间件写上去的，是文件保存的路径
