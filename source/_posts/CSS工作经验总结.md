---
title: CSS工作经验总结
date: 2019-05-17 22:44:25
tags:
    - CSS
---

### 使用line-height垂直居中时，要注意border的设置

将border设置为一个很粗的值时再进行垂直居中设置，line-height和height和border都在同一个元素设置时，会有偏差，这时候解决的方法就是将border的设置放置在此对象的外层

使用line-height，越大的时候，安卓和ios差距越大，尽量在移动端不要使用line-height进行垂直居中，多使用flex


### flex左边固定宽度，右边动态高度实现

```css
.line {
    display: flex;
    width: 200px;
}

.left {
    width: 30px
}

.right {
    flex: 1;
}
```

```html
<div class="test">
    <div class="line">
        <div class="left">固定宽度</div>
        <div class="right">动态高度，文字多的时候会换行撑开</div>
    </div>
</div>
```

<!-- more -->

### flex左边固定宽度，右边强制不换行，超出省略号【有坑】

在flex为1的容器中，设置了里面的元素100%长度且超出省略，这时候外容器并不会像想象中那样，而是外容器的宽度随着里面的长度改变而改变，这是由于flex布局的问题，需要在外容器加上width: 0或overflow: hidden来解决，具体代码如下：

```css
.line {
    display: flex;
    width: 200px;
}

.left {
    width: 30px
}

.right {
    flex: 1;
    /* 必须，使用了不会让flex一直延伸 */
    overflow: hidden;
    /* 或使用以下代码 */
    width: 0;
    /* 必须同时使用，实测火狐只有width: 0还不够，需要加上min-width */
    min-width: 0;
}

.nowrap {
    display: inline-block;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
```

```html
<div class="test">
    <div class="line">
        <div class="left">123</div>
        <div class="right">
            <span class="nowrap">需要单行显示超出省略的内容</span>
        </div>
    </div>
</div>
```

上面的二种方法都可以达到我们需要的效果，即给 content 设置了 flex 为 1 的时候，它会动态的获得父容器的剩余宽度，且不会被自己的子元素把内容撑开。

记得实现单行文字超出省略需要以下条件：
- 将css设置在包含文字的元素上
- 元素需要固定高度
- 元素设置以下css属性
    - white-space: nowrap;
    - overflow: hidden;
    - text-overflow: ellipsis;

### 流程实现（stepBar）

结构可以参考elementUI的Steps组件，实现比较取巧，组件什么的可以通过这种结构进行拓展。总的来说line是通过位移实现的，最后一个需要需要隐藏

```css
.test {
    display: flex;
    width: 500px;
}

.item {
    flex: 1;
}

.line-wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* 重点 */
.line {
    position: absolute;
    height: 1px;
    width: 100%;
    background: #CCC;
    /* 位移重点 */
    left: 50%;
    right: -50%;
}
/* 最后一个是不用显示的，line需要位移 */
.item:last-of-type .line-wrapper .line {
    display: none;
}

.point {
    position: relative;
    z-index: 1;
    display: inline-block;
    width: 9px;
    height: 9px;
    border: 2px solid #FFF;
    background: #CCC;
    border-radius: 50%;
}

.content {
    display: flex;
    justify-content: center;
    align-items: center;
}

.item.pass .line,
.item.pass .point {
    background: #a6d5f3;
}

.item.current .point {
    background: #2aa5f3;
}
```

```html
<div class="test">
    <!-- 已经过去的状态 -->
    <div class="item pass">
        <div class="line-wrapper">
            <div class="line"></div>
            <span class="point"></span>
        </div>
        <div class="content">
            <span>第一步</span>
        </div>
    </div>
    <!-- 当前进行状态 -->
    <div class="item current">
        <div class="line-wrapper">
            <div class="line"></div>
            <span class="point"></span>
        </div>
        <div class="content">
            <span>第二步</span>
        </div>
    </div>
    <!-- 还无进行的状态 -->
    <div class="item">
        <div class="line-wrapper">
            <div class="line"></div>
            <span class="point"></span>
        </div>
        <div class="content">
            <span>第三步</span>
        </div>
    </div>
</div>
```

### 文字两端对齐技巧

原理：利用text-align: justify进行两端对齐，但是由于文字只有一行的话是不会生效的，这时候需要靠伪元素伪造一行，直接在需要对齐的文字里加入这个class即可：

注意，使用了这个方法后生效的元素会高了很多，不知道什么原因，需要另外加height调整高度处理

```css
.justified {
    text-align: justify;
}

.justified:after {
    content: '';
    display: inline-block;
    width: 100%;
    /* opera浏览器需要添加 vertical-align:top 才能完全解决底部多余的空白 */
    vertical-align:top;
}
```

### 文字超出多少行省略实现

所遇到的问题：-webkit-box-orient: vertical 在使用 webpack 打包的时候这段代码会被删除掉，原因是 optimize-css-assets-webpack-plugin 这个插件的问题。

使用scss，传入行数即可

```scss
.line-camp( @clamp:2 ) {
    text-overflow: -o-ellipsis-lastline;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: @clamp;
    /*! autoprefixer: off */
    -webkit-box-orient: vertical;
    /* autoprefixer: on */
}
```

注意line-clamp是一个不规范的css属性，一般只能兼容webkit内核的浏览器，如果有兼容需要的话需要另寻方法

### 内联首屏关键CSS

像饿了么那样，加载时候，会出现一个比较捡漏的大概样式，其实有一种专门的称呼，叫做Critical CSS。这里做个记录

### 从 html 元素继承 box-sizing

我不希望每次都重写一遍border-box，而是希望他是继承而来的，那么我们可以使用如下代码：

```css
html {
  box-sizing: border-box;
}

*, *:before, *:after {
  box-sizing: inherit;
}
```

这样的好处在于他不会覆盖其他组件的 box-sizing 值，又无需为每一个元素重复设置 box-sizing: border-box;

### IOS中滑动页面fixed浮动的问题

fixed元素如果不是在body的第一下级，会有往上滑动遮罩的问题，或向下滑动也会有遮罩的问题

类似以下结构，button为fixed是没有问题的：

```html
<body>
    <div class="other">其他</div>
    <div class="container"></div>
    <div class="button">按钮</div>
</body>
```

但如果是以下那样，就会有问题（button为fixed，固定在最底）：

```html
<body>
    <div class="other">其他</div>
    <div class="container">
    	<div class="button">按钮</div>
    </div>
</body>
```

像以上这种情况只能使用relative+absolute了

### 父元素设置了min-height：100%, 子元素设置height:100%无效

通过google知道了 webkit（chrom/safari）bug：有最小高度的父盒子里面的子元素不能继承高度属性，父元素只能设置height让子元素继承


### 在vue里的scoped状态里可以修改element-ui等全局样式，使用局部样式覆盖

如下代码，这样就可以局部修改scoped状态下wrapper的el-form-item样式，由于el-form-item是全局样式，不使用/deep/在scoped状态下是无法修改的

```scss
.wrapper {
    /deep/ .el-form-item {
        /* ... */
    }
}
```

### webpack下scss可以将变量作为js的变量使用

在scss里输出变量：

```scss
$menuBg: #3c3c3d;

:export {
  menuBg: $menuBg;
}
```

在js里就可以这么使用：

```js
import variables from '@/common/scss/variables.scss';

variables.menuBg
```

参考资料：

> the :export directive is the magic sauce for webpack
> https://www.bluematador.com/blog/how-to-share-variables-between-js-and-sass


### input框在flex里的长度问题

input框有默认的宽度，直接写在flex容器里会有布局问题，一般解决方法是在外面再包一层div作为flex的容器，然后包着input，input设置width为100%处理


### scss里变量传入calc的办法

在calc里直接使用遍历或方法会失效，需要这样写：

```scss
.test {
    height: calc(100% - #{$header-height});
    width: calc(100% - #{px2rem(30px)});
}
```

### flex实现sticky-footer

flex也可以实现sticky-footer，相比传统的实现方式，要较为简单。在兼容性允许flex的情况下，优先使用这种布局会比较简单：

本质上是利用flex的方向和伸缩完成：

```html
<div class="wrapper">
    <div class="header">header</div>
    <div class="main">main</div>
    <div class="footer">footer</div>
</div>
```

```css
.wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: auto;
}

.main {
    flex: 1;
}
```

### 全是英文和数字的情况会造成不换行解决办法

注意在全是英文和数字的情况下，按照默认样式，是有可能不会自动换行而自动溢出的，需要在元素上以下属性：

```css
word-break: nomal;
word-wrap: break-word;
```


### 浮动布局错位问题

在使用栅栏布局或其他浮动布局的时候，如果有第二行浮动元素错位问题，需要考虑是否上一行有元素高度或行高过高，导致元素浮动错位



### 后端返回了换行符，前端如何换行

后端返回了换行符，由于前端的css换行属性默认是不会换行的，需要通过设置css的white-space属性，设置为pre-line和pre-wrap都可以进行换行，区别是pre-line会把多个空格合并成一个，而pre-wrap不会，可以根据实际需求进行设置


### 不要使用fixed布局去嵌套fixed布局

不要使用fixed布局去嵌套fixed布局，会引起zIndex和transform无法如愿的情况，或是引起iOS的滑动bug。最外层容器尽量不要使用fixed，因为可能会在里面再嵌套一些全局弹窗

例如

```html
<div class="wrapper">
    <div class="left"></div>
    <div class="right">
        <div class="fullPage"></div>
    </div>
</div>
```

以上代码，如果left，right，fullPage都设置为fixed，left的zIndex设置为2，right的zIndex设置为1，则fullPage无论设置多大，层级依然比left低，因为同级right的zIndex比left低，与子元素无关。需要将right的zIndex设置得比left高，fullPage的fixed的层级才会在left之上


### href设为空时可以跳转到当前html的路径

```html
<a href>跳到首页</a>
```

这样设置就可以跳到当前html的路径，通常单页的404页跳转的时候可能会用到这个


### fixed布局的相对定位问题

position:fixed默认是相对浏览器定位的。如果想fixed定位相对父级容器定位，子元素定义好fixed后，不要添加:top,bottom,left,right样式,通过margin定位，即可实现相对父元素的效果，且固定位置不变，不用通过js去计算


### 添加css属性让任何事件无效

给元素增加pointer-events: none;, 这样伪类元素可以点击穿透, 也就是能看到, 但是不触发任何默认事件(click等)


### border-1px最终实现方案，兼容pc和移动端

```scss
// 如果编译的时候提示编码的问题，百度修改ruby下sass的设定源码
@mixin border-1px($directionList: bottom, $color: #ccc, $radius:(0, 0, 0, 0), $position: after) {
    // 是否只有一个方向，type-of是sass判断变量类型的内置函数
    // list是一种格式，类似这种：(top, right, bottom, left)，可使用each遍历
    $isSingleDirection: type-of($directionList)==list;

    // 使用not对boolean进行取反
    @if (not $isSingleDirection) {
        $directionList: ($directionList);
    }

    // 先设定普通pc状态下的样式
    @each $direction in $directionList {
        border-#{$direction}: 1px solid $color;
    }

    // 判断圆角是list还是number
    @if(type-of($radius)==list) {
        border-radius: nth($radius, 1) nth($radius, 2) nth($radius, 3) nth($radius, 4);
    }

    @else {
        border-radius: $radius;
    }

    // 判断到是移动端时（移动端有dpr），使用伪类的方式实现，删除之前的样式
    @media only screen and (-webkit-min-device-pixel-ratio: 2) {
        & {
            position: relative;

            // 删除1像素密度比下的边框
            @each $direction in $directionList {
                border-#{$direction}: none;
            }
        }

        &:#{$position} {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            display: block;
            width: 200%;
            height: 200%;
            transform: scale(0.5);
            box-sizing: border-box;
            padding: 1px;
            transform-origin: 0 0;
            pointer-events: none;
            border: 0 solid $color;

            @each $direction in $directionList {
                border-#{$direction}-width: 1px;
            }

            @if(type-of($radius)==list) {
                border-radius: nth($radius, 1)*2 nth($radius, 2)*2 nth($radius, 3)*2 nth($radius, 4)*2;
            }

            // unit用于检查单位是什么，unitless()检查带不带单位，单位是百分比直接赋值
            @else if (unit($radius)=='%') {
                border-radius: $radius;
            }

            @else {
                border-radius: $radius*2;
            }

        }
    }

    @media only screen and (-webkit-min-device-pixel-ratio: 3) {
        &:#{$position} {
            @if(type-of($radius)==list) {
                border-radius: nth($radius, 1)*3 nth($radius, 2)*3 nth($radius, 3)*3 nth($radius, 4)*3;
            }

            @else if (unit($radius)=='%') {
                border-radius: $radius;
            }

            @else {
                border-radius: $radius*3;
            }

            width: 300%;
            height: 300%;
            transform: scale(0.33333);
        }
    }
}
```

使用方法：

```scss
// 设定底下一条线，radius为10px
@include border-1px(bottom, #eee, (10px 10px 10px 10px));

// 设定四周都有线，radius为50%，即圆
@include border-1px((top, right, bottom, left), #eee, 50%, before);
```

### 英文不会换行 word-break:break-all

### transform不适用于inline元素














