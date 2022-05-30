---
title: JS工作经验总结（3）
date: 2019-08-26 21:53:30
tags:
    - JS
---
JS工作经验总结（2）
### JS拿到图片实际宽高方法

其实IE9+和其他浏览器都有原生的api可以取得到图片的实际宽高，用于做一些图片放大插件等有用处。如果api不兼容，可以使用图片onload后，取得到的宽高也是图片的实际宽高

```javascript
if (typeof el.naturalWidth == undefined) {
    // LTE 8
    var i = new Image();
    var rw, rh;
    i.src = el.src;
    // 判断是否有缓存
    if (i.complete) {
        rw = i.width;
        rh = i.height;
    } else {
        i.onload = function() {
            rw = i.width;
            rh = i.height;
        }
    }
} else {
    // GTE IE9
    rw = el.naturalWidth;
    rh = el.naturalHeight;
}
```

### 关于使用formData传送的类型

formData可以直接传file，也可以通过Blob二进制类型转成二进制，然后放到formData里。一些压缩的原理就是经过转换后，存成二进制，然后发到后台，后台收到的仍然是文件类型

注意formData传图片文件的时候，是不能直接传base64的，因为它不是文件类型。


### 清空input文件的值

```javascript
inputEl.files.value = null;
```


### for-in循环时，使用数值作为键值遍历的问题

使用for in循环时，如果对象的键值为数值，会根据数值的大小顺序，从低到高进行遍历，遍历的顺序不可信，不要使用遍历对象然后直接push到数组，会有排序问题，需要额外的方法对数组进行排序



### webpack打包体积过大，使用cdn引入依赖

由于我们常引用依赖的方法是import xx from 'xxx'，但由于引用的cdn是通过全局变量进行引用的，如果想要使用cdn，同时使用import的方法，可以采用cdn和webpack的externals

<!-- more -->

### 字符串模板换行的情况

在模板字符串里换行的时候，实际上会的确存在换行符\n的，想要字符串进行换行，记得设置一下元素的white-space属性，设置为pre-wrap或pre-line进行换行


### url存在特殊字符的情况

get请求，后端定义路由时，注意不要用到可能带有【.】作为路由url，会导致【.】后面的都会被忽略，且【.】属于安全字符，不会被转义。如果有这种情况，只能够使用参数方式传参，这样带【.】是无问题的

例如：

```js
/api/goods/100445.2
```

```js
/api/goods?id=100445.2
```

第一种就是路由方式去传参，100445.2会被浏览器忽略成100445去请求后端

第二种是参数方式传参，就没有问题

如果有各类特殊字符，对参数进行一个encodeURIComponent()操作即可，这是一个编码标准，后端也很容易将它解码，当get请求传入json字符串的时候，必须使用这个编码转码发到后端


### getBoundingClientRect获取的高度问题

getBoundingClientRect拿到的top值只是距离窗口顶部的距离，如果有scroll，先拿到距离文档最高出的距离，需要将`rect.top + window.pageYOffset || document.documentElement.scrollTop`

### 前端登录RSA加密流程

流程是这样的：

- 请求后端，拿到一个publicKey和一个标识字符串
- 前端使用插件，利用publicKey对密码进行RSA加密
- 使用加密后的密码和标识字符串请求登录接口
- 标识字符串的作用是后台通过这个标识使用对应的privateKey对加密字符串进行解密

RSA为什么能安全：加密后的字符串，必须通过privateKey去解密，就算抓包的时候请求抓到publicKey，那也只是加密所使用的key，并不能解密。所以抓包抓到的加密字符串没有privateKey是无法加密的，privateKey保存在后台，解密工作在后台进行

伪代码：
```javascript
import JsEncrypt from 'jsencrypt';

let jse = new JsEncrypt();
// publicKey是请求后台获取的
jse.setPublicKey(publicKey);
let encodePassword = jse.encrypt(password);
client.request.post('/login', {
    username: username,
    password: encodePassword,
    key: key // 标识字符串，后台使用对应的密钥进行解密
});
```

已经通过RSA加密的内容进行解密（一般不会这么做，privateKey是不能暴露出来的）：
```javascript
import JsEncrypt from 'jsencrypt';

let jse = new JsEncrypt();
jse.setPrivateKey(privateKey);
let decodePassword = jse.decrypt(encodePassword);
```

这样就完成一次RSA登录流程


### offsetTop的相对偏移问题

offsetTop是元素到offsetParent顶部的距离，offsetParent是距离元素最近的一个具有定位的祖宗元素（relative，absolute，fixed），若祖宗都不符合条件，offsetParent为body


### 使用ajax的方式下载文件

一直使用的url下载方式只能为get【使用window.location.open或建立一个假的a标签或使用iframe加载路径】，而且并不是一个ajax请求，返回的是一个文件流，带有后端文件名称的文件。但这种方式有个问题，就是不知道后端能够下载文件的时机。假如这个文件是一个后端动态生成的excel文件，那么距离生成会有一段时间，传统的url下载方式并不知道后端什么时候才能下载

以下为使用ajax的方式下载文件，配合blob二进制格式，以axios为例的伪代码：

```javascript
function downFile(url, parameter) {
    return axios({
        url: url,
        params: parameter,
        method:'get' ,
        responseType: 'blob'
    })
}

// 这里的fileName完全自定义，但如果想获取文件本来的名字就需要改接口
function handleExportXls(fileName) {
    let url = '/download';
    let param = { id: 10001 };
    downFile(url, param).then((data) => {
        if (!data) {
            alert("文件下载失败");
            return
        }
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
            window.navigator.msSaveBlob(new Blob([data]), fileName + '.xls')
        } else {
            let url = window.URL.createObjectURL(new Blob([data]))
            let link = document.createElement('a')
            link.style.display = 'none'
            link.href = url
            link.setAttribute('download', fileName + '.xls')
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link); //下载完成移除元素
            window.URL.revokeObjectURL(url); //释放掉blob对象
        }
    })
}
```

这样就可以在不跳转的情况下，下载ajax请求的二进制文件

但这时的文件名是需要前端定义的，如何知道后端的这个文件是什么名称？可以通过后端的配合，设置响应头一个属性，前端取响应头的属性然后赋值即可

例子：
```javascript
this.$axios({
   method: params.method,
   url: params.url,
   data: params.data,
   responseType: 'blob' // 指明返回格式,
}).then(res => {
   // 这里尤其需要注意, '\ufeff' 用于解决乱码问题, blob可以解决数据量大导致网络失败.
   const blob = new Blob(['\ufeff' + res.data], { type: 'text/csv;charset=utf-8' })
   const url = window.URL.createObjectURL(blob)
   // 通过创建a标签实现
   const link = document.createElement('a')
   link.href = url
   // 对下载的文件命名
   link.download = decodeURI(res.headers['content-disposition'].split('=')[1]) || '发货单导出数据表.csv'
   document.body.appendChild(link)
   link.click()
   document.body.removeChild(link)
})
```

注意`content-disposition`这个属性能在请求调试里看到，但如果res.headers怎么都取不到的话，需要在服务器端配置一个属性：

```java
Access-Control-Expose-Headers: Content-Disposition
```

参考：
https://stackoverflow.com/questions/37897523/axios-get-access-to-response-header-fields

In case of CORS requests, browsers can only access the following response headers by default:

- Cache-Control
- Content-Language
- Content-Type
- Expires
- Last-Modified
- Pragma

If you would like your client app to be able to access other headers, you need to set the `Access-Control-Expose-Headers` header on the server:

```java
Access-Control-Expose-Headers: Access-Token, Uid
```


### 获取布局信息的操作时，会强制队列刷新

比如当你访问以下属性或者使用以下方法：

- offsetTop、offsetLeft、offsetWidth、offsetHeight
- scrollTop、scrollLeft、scrollWidth、scrollHeight
- clientTop、clientLeft、clientWidth、clientHeight
- getComputedStyle()
- getBoundingClientRect

以上属性和方法都需要返回最新的布局信息，因此浏览器不得不清空队列，触发回流重绘来返回正确的值。因此，我们在修改样式的时候，最好避免使用上面列出的属性，他们都会刷新渲染队列。如果要使用它们，最好将值缓存起来。

但强制清空队列也有好处，可以解决display:none转场的transition失效问题：

```js
el.style.display = 'block';
el.offsetHeight;
el.style.transform = 'translate3d(100px, 0, 0)';
```

假如元素设置了transition，且display为none，如果不使用`el.offsetHeight`这句强制刷新队列，那么转场的动画就会失效

### 混合开发时web端和原生端的请求的不同

> web端请求

- web端发送请求是基于XMLHttpRequest或fetch
- 浏览器同源政策CORS安全限制，需要后端设置请求头或设置服务器代理转发
- 不够安全，无法网络优化，原生端无法对请求进行监控或加密


> 原生端请求，web端利用JSBridge调起原生端请求

- 没有浏览器跨域限制
- 安全加密，签名校验
- 弱网优化，流量优化
- 原生端可以对请求进行压缩
- 甚至可以将http请求替换成rpc（远程过程调用）这种节省流量的方法，利用私有协议请求数据（底层变了）


### 混合开发的JSBridge实现原理

web端调用原生端方法：
- 拦截URL Schema，可使用alert等，原生端会对其进行拦截
- 原生端注入JSAPI，注入一个全局对象，web端可以直接调用


原生端调用web端方法：
- web端定义一个全局对象，原生端直接执行js字符串代码


带有回调的原理：
- web端发起时，利用JSBridge调用原生端方法，原生端又执行web端的js字符串代码，进行两次跨端的操作，是需要两边都约定好协议和全局对象
- 原生端发起原理与上面相同
- 由于代码繁琐或有坑，一般采用开源里比较成熟的JSBridge，会带有封装好的webview和JSAPI


### SSO单点登录方案

SSO单点登录有两种方案，一种是Domain相同的，一种是Domain不相同的

Domain相同的SSO接入非常简单，逻辑大多是后台实现，就是在response的时候进入setCookie操作，同时指定Domain，例如`.bilibili.com`，这样所有是这个Domain都能够共享cookie

另一种是Domain不相同的接入。加入不同的网页的端的Domain都不相同，这时候分别需要他们的后台进行SSO接入，具体就是放出一个接口，这个接口在被请求成功的时候会对对应的前台页面的Domain下写入cookie，为了确保这样，通常都是不同端的前台和后台使用代理请求，确保在同一个域里。然后从SSO里调用这些后台的接口，后台就会对对应的前台写入cookie

### 关于window.open()的使用事项

window.open()可以指定内容：

```javascript
const newWin = window.open();
if (!newWin) {
  return;
}
newWin.document.write(item.content);
newWin.document.body.style.width = '1000px';
newWin.document.body.style.margin = '0 auto';
if (item.title === undefined) {
  item.title = '标题';
}
newWin.document.title = item.title;
```

然后，发现window.open()拦截是有条件的。一般通过用户的点击事件触发的在新标签页中打开链接，浏览器是不会拦截的，因为这种形式打开新窗口浏览器会认为是用户自己需要的。

在我的项目中，是需要在ajax异步请求成功后需要在新窗口中打开返回的url地址，使用window.open()会被拦截，因为在异步队列里进行弹窗，浏览器认为该操作不是用户主动触发的，所以会拦截。

ajax请求由异步改为同步。(async:false)   (测试有效)

```javascript
$.ajax({
  async: false, // 该值为必须的
  url: "请求地址",
  type: "post",
  success: function (data) {
    var data = JSON.parse(data),
        result = data.result;
    if (result == "0") {
      window.open("新的页面");
    }else{
      …… //相关处理
    }
  }
});
```

### 递归遍历父元素找到对应的DOM元素

```javascript
function findAncestor (el, cls) {
  while ((el = el.parentElement) && !el.classList.contains(cls));
  return el;
}
```

### 安装node-sass被墙解决方法
```
npm i node-sass --sass_binary_site=https://npm.taobao.org/mirrors/node-sass/
```


### 找到树中指定id的所有父节点(或包括自己)

```javascript
  const treeData = [{
    id: 1,
    children: [{
      id: 2,
      children: [{
        id: 3,
      }, {
        id: 4,
      }],
    }],
  }, {
    id: 5,
    children: [{
      id: 6,
    }],
  }];

  let relateNodes = []

  const getRelateNodes = (his = [], targetId = null, tree = []) => {
    for (const item of tree) {
      const children = item.children || []
      if (item.id === targetId) {
        // 如果只要返回父元素们，就写成relateNodes = his
        relateNodes = [...his, item]
        return true
      } else if (children.length > 0) {
        const history = [...his]
        history.push(item)
        // 终止递归的条件
        if (getRelateNodes(history, targetId, children)) {
          break
        }
      }
    }
  }

  // 要查找的对象里存在的id
  const id = 4

  getRelateNodes([], id, treeData)

  // 返回各个父元素的对象合集，可用于修改数据，做像树组件的展开等数据变更
  console.log(relateNodes)
```


### 遍历树把该层属于第几层树的属性写进去

```javascript
  const treeData = [{
    id: 1,
    children: [{
      id: 2,
      children: [{
        id: 3,
      }, {
        id: 4,
      }],
    }],
  }, {
    id: 5,
    children: [{
      id: 6,
    }],
  }];

 // 第几层递归
  let level = 0
  const fn = (arr = [], level) => {
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i]
      item.__level = level
      if (!item.children) item.children = []
      if (Array.isArray(item.children) && item.children.length) {
        fn(item.children, level + 1)
      }
    }
  }

  fn(treeData, level)

  console.log(treeData)
```


### scrollTo实现

```javascript
function easeInOutQuad(t, b, c, d) {
  t /= d / 2
  if (t < 1) {
    return c / 2 * t * t + b
  }
  t--
  return -c / 2 * (t * (t - 2) - 1) + b
}

const requestAnimFrame = (function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) { window.setTimeout(callback, 1000 / 60) }
})()

function move($el, amount) {
  if ($el) {
    $el.scrollTop = amount
  } else {
    document.documentElement.scrollTop = amount
    document.body.parentNode.scrollTop = amount
    document.body.scrollTop = amount
  }
}

function position($el) {
  if ($el) {
    return $el.scrollTop
  } else {
    return document.documentElement.scrollTop || document.body.parentNode.scrollTop || document.body.scrollTop
  }
}

export default function scrollTo($el, to, duration, callback) {
  const start = position($el)
  const change = to - start
  const increment = 20
  let currentTime = 0
  duration = (duration != null) ? 500 : duration
  let animateScroll = function() {
    currentTime += increment
    const val = easeInOutQuad(currentTime, start, change, duration)
    move($el, val)
    if (currentTime < duration) {
      requestAnimFrame(animateScroll)
    } else {
      if (callback && typeof (callback) === 'function') {
        callback()
      }
    }
  }
  animateScroll()
}
```

### 根据数组对象的某个字段去重
```javascript
function uniqueArrayByObjectKey(arr, key) {
  const res = new Map()
  return arr.filter(item => !res.has(item[key]) && res.set(item[key], 1))
}
```

### 简单数组去重
```javascript
function uniqueArray(arr) {
  return Array.from(new Set(arr))
}
```


### 多语言某些在中间需要替换语言

例如：
LANG = "The quantity of selected products:XXX; Subtotal:XXX"

replacement = [1, 10]

transformI18n(LANG, replacement)

```javascript
function transformI18n(key, replacement) {
  if (!Array.isArray(replacement)) {
    replacement = [replacement]
  }
  const regex = /(XXX)+/gi
  let count = 0
  return i18n.t(key).replace(regex, () => replacement[count++])
}
```
