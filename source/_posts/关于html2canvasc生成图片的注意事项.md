---
title: 关于html2canvasc生成图片的注意事项
date: 2021-12-22 15:07:59
tags:
  - JS
---

> "html2canvas": "^1.3.2"，最新版已经支持scale，网上搜索的图片模糊解决方案均已过时

一般使用：

```js
// "html2canvas": "^1.3.2"
import html2canvas from 'html2canvas'

const options = {
  scale: window.devicePixelRatio, // 添加的scale参数
  useCORS: true, // 【重要】开启跨域配置，否则iOS会报【DOM Exception 18: The operation is insecure】
  backgroundColor: '#FFF', // null
}

// 保证在最顶层，不然出现了滚动条后，不在最顶层截图时会出现截图空白
html2canvas(document.querySelector('.container'), options)
  .then(canvas => {
    // base64渲染方法
    const base64Url = canvas.toDataURL('image/jpeg', 0.9)

    // 图片转换成文件提交方法
    // 不能大于1m，否则报错，所以使用jpg并且压缩0.9
    canvas.toBlob((blob) => {
      const formData = new FormData();
      // 钉钉的消息通知只认png和jpg结尾的文件为图片，不能使用jpeg作为后缀，否则推送不成功
      formData.append('uploadFile', blob, `test.jpg`);
      // 发送formData类型到后端
      request(formData)
    }, 'image/jpeg', 0.9);
  })
  .catch(err => {

  })
```

<!-- more -->

#### 元素里面的图片渲染不清晰问题

> 有两点需要特别注意，这关系到生成图片的质量

1、img元素不要使用object-fit，html2canvas生成的图片不支持object-fit

2、不要使用background或background-image来渲染图片，会导致html2canvas生成的图片background区域内的图片很模糊，必须使用img


有以下场景：图片大小不固定，需要自适应显示，对应object-fit的contain和background-size的contain，如今html2canvas对object-fit不支持，且使用background会使图片模糊，只能额外借助js解决

不使用object-fit和background-size模拟contain的效果，但只能一个方向，要判断两个方向需要额外判断图片的渲染大小，写在行内样式里

```css
.image-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-wrapper image {
  // width: 100%; 宽比高长时可以垂直居中显示并具有contain效果，width和height只能设置其中一个为100%
  // height: 100%; 宽比高长时可以水平居中显示并具有contain效果，width和height只能设置其中一个为100%
}
```

配合js实现图片contain自适应，vue解决方案

template
```html
<div class="image-wrapper">
  <img :src="image" :style="imgComputedStyle"></img>
</div>
```

```js
{
  data() {
    return {
      imgComputedStyle: {}
    }
  },
  watch: {
    image: {
      handler(v) {
        this.$nextTick(() => {
          const img = new Image()
          let imgComputedStyle = {}
          img.onload = () => {
            const width = img.width
            const height = img.height
            if (width >= height) {
              imgComputedStyle.width = '100%'
            } else {
              imgComputedStyle.height = '100%'
            }
            this.imgComputedStyle = imgComputedStyle
          }
          img.src = v
        })
      },
      immediate: true
    }
  }
}
```

这样的html2canvas渲染出来里面的图片具有自适应contain的效果且清晰


#### 渲染文字错位渲染不全的问题

有时候渲染的容器需要有预留空位，不要使用margin作为预留左右空位，且overflow:hidden的手段，使用padding代替，这样就不会出现错误渲染字体的情况


#### 非视野区域截图

opacity为0，或者visibility为hidden，display：none，这样都无法解决非视野区域截图的问题

使用top: -9999px，这样也是无法解决的

只有使用层级最低的手段下才能做到非视野区域的截图

```css
top: 0px;
z-index: -1;
```