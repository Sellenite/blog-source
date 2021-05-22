---
title: 关于table-cell实现的各种布局
date: 2018-03-02 20:43:06
tags:
- CSS
---

`display:table-cell`指让标签元素以表格单元格的形式呈现，使元素类似于td标签。IE8+及现代版本的浏览器都支持此属性，IE6/7不支持（可用其他方法实现类似效果）。同样，display：table-cell属性也会被float，position：absolute等属性破坏效果，应避免同时使用。

**设置了display：table-cell的元素**：

- 对宽度高度敏感
- 对margin值无反应
- 响应padding属性
- 内容溢出时会自动撑开父元素


**display：table-cell的几种用法**

#### 1.大小不固定元素的垂直居中

```HTML
<div class="content">
    <div style="padding: 50px 40px;background: #cccccc;color: #fff;"></div>
    <div style="padding: 60px 40px;background: #639146;color: #fff;"></div>
    <div style="padding: 70px 40px;background: #2B82EE;color: #fff;"></div>
    <div style="padding: 80px 40px;background: #F57900;color: #fff;"></div>
    <div style="padding: 90px 40px;background: #BC1D49;color: #fff;"></div>
</div>
```

```CSS
.content {
    display: table-cell;
    padding: 10px;
    border: 2px solid #999;
}

.content div {
    display: inline-block;
    vertical-align: middle;
}
```

___

补充一种多行文本垂直居中的方法：

```HTML
<div class="wrap">
    <div class="left">这边很少</div>
    <div class="right">这边很多字···</div>
</div>
```

```CSS
.wrap {
  display: table;
  margin: 0 auto;
  height: 300px;
  width: 300px;
  border: 2px solid #0cf;
}

.left {
  display: table-cell;
  vertical-align: middle;
  width: 100px;
}

.right {
  display: table-cell;
  vertical-align: middle;
  width: 200px;
}
```

#### 2.两列自适应布局


```HTML
<div class="content">
    <div class="left-box">
        <img src="img/a1.jpg" width="70">
    </div>
    <div class="right-box">...</div>
</div>
```

```CSS
.content {
    display: table;
    padding: 10px;
    border: 2px solid #999;
}

.left-box {
    float: left;
    margin-right: 10px;
}

.right-box {
    display: table-cell;
    padding: 10px;
    width: 3000px;
    vertical-align: top;
    border: 1px solid #ccc;
}
```

左边头像部分使用了float左浮动属性，左侧使用 display: table-cell则实现了两列自适应布局。至于.right-box中的width：3000px解释引用别人的：

> display:table-cell 元素生成的匿名table默认table-layout:auto。宽度将基于单元格内容自动调整。当内容足够多将宽度完全撑开时，再让某个元素（例如关闭按钮）右侧定位就会有问题。所以设置width:3000px的用途是尽可能的宽的意思。

对于IE6/7，我们可以使用display： inline-block属性代替。

#### 3.等高布局

```HTML
<div class="content">
    <div class="box1">我和右边等高</div>
    <div class="box2">table表格中的单元格最大的特点之一就是同一行列表元素都等高。所以，很多时候，我们需要等高布局的时候，就可以借助display:table-cell属性。说到table-cell的布局，不得不说一下“匿名表格元素创建规则”</div>
</div>
```

```CSS
.content {
    display: table;
    padding: 10px;
    border: 2px solid #999;
}

.box1 {
    display: table-cell;
    width: 100px;
    border: 1px solid #ccc;
}

.box2 {
    display: table-cell;
    border: 1px solid #ccc;
}
```

#### 4.和inline-block组合使用

```HTML
<div class="content">
    <div class="left">
        <div class="box">A</div>
    </div>
    <div class="right">
        <div class="box">B</div>
    </div>
</div>
```

```CSS
.content {
    display: table;
    padding: 10px;
    margin: 10px auto;
    width: 1000px;
    border: 2px solid #999;
}
 .left {
    display: table-cell;
    text-align: left;
    border: 1px solid #0cf;
}

.right {
    display: table-cell;
    text-align: right;
    border: 1px solid #fc0;
}
.box {
    display: inline-block;
    width: 100px;
    height: 100px;
    border: 1px solid #ccc;
}
```

**代码解释**：A和B的父元素均设置了display：table-cell属性，所以
它们均匀占据设置了display：table的div元素。而A和B元素设置display：inline-block是为了让它们相应text-align的属性设置。

> inline-block 是宽高margin设定有效，参与行内格式化上下文，在行内对齐时使用它自己的框底边为基线对齐位置

#### 5.列表布局

```HTML
<div class="content">
    <ul>
      <li>1</li>
      <li>2</li>
      <li>3</li>
      <li>4</li>
      <li>5</li>
    </ul>
</div>
```

```CSS
.content {
    padding: 10px;
    margin: 10px auto;
    border: 2px solid #999;
}

.content ul {
  display: table;
  width: 100%;
  padding: 0;
}

.content ul li {
  display: table-cell;
  height: 100px;
  line-height: 100px;
  text-align: center;
  border: 1px solid #ccc;
}
```

这类布局常用浮动布局（给每个li加上float：left属性）实现，但这样做有明显不足：

- 需要清除浮动
- 不支持不定高列表的浮动

display：table-cell可以代替浮动布局，但是其不是最好的方法。其他方法有待进一步学习！

最后，说说“匿名表格元素创建规则”：

> CSS2.1表格模型中的元素，可能不会全部包含在除HTML之外的文档语言中。这时，那些“丢失”的元素会被模拟出来，从而使得表格模型能够正常工作。所有的表格元素将会自动在自身周围生成所需的匿名table对象，使其符合table/inline-table、table-row、table- cell的三层嵌套关系。

简单来讲，我们为一个元素设置了display：table-cell属性，而不将其父元素设置为display：table-row属性，浏览器会默认创建一个表格行。
