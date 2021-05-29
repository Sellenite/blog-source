---
title: CSS实现等比图片
date: 2021-05-29 17:39:51
tags:
- CSS
---

先说核心的代码：

```css
padding-top: 222%; // 高比宽长，百分比就是大于100%的
```

比如要实现一个长宽为580x1289的等比图片展示（等比图片大多数要求在移动端，一些列表或顶部图片的需求），这时候需要使用一个容器包着img，容器的长度为100%，如果要控制长度，需要在容器的外层再包一层，用于长度控制。

最主要的等比是使用padding-top属性。比如我的图片是580x1289，那就要设置padding-top为（1289/580*100%）的百分比，就是222%。

以下为demo代码：

<!--more-->

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CSS实现等比图片</title>
  <style>
    * {
      margin: 0;
      padding: 0;
    }

    .container {
      width: 60%;
      margin: 0 auto;
    }

    .img-wrapper {
      width: 100%;
      padding-top: 222%;
      position: relative;
    }

    img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  </style>
</head>

<body>
  <div>
    <div class="container">
      <div class="img-wrapper">
        <img src="./f92fe7014a90f6033bd07f2c2e12b31bb151eda3.jpg" alt="">
      </div>
    </div>
  </div>
</body>

</html>
```


