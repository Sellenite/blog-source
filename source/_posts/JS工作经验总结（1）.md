---
title: JS工作经验总结（1）
date: 2018-06-20 22:47:49
tags:
- JS
---

> 本文主要记录工作时JS问题或经验

#### html里自定义属性的赋值和取出问题

给html元素写入`data-type`这样的格式，可以使用`el.dataset.type`进行相对应的访问；\\
在不兼容dataset的情况下，可以使用更原始的`el.getAttribute(name)`进行取值，使用`el.setAttribute(name, value)`进行赋值

#### document.activeElement的应用（焦点问题）

`document.activeElement.tagName`可获得当前获得焦点的元素，`document.activeElement.blur()`使当前获得焦点的元素失焦

#### 关闭webApp中的调起的系统键盘

`window.nativeKeyboradCancel()`，在webApp里取消调起系统的键盘，如果有的话

#### 循环遍历父元素的方法

以下可以使用while一直遍历父元素：

```javascript
function getTagName(ele) {
    var parent = ele.parentElement;
    var string = '';
    while (parent !== null) {
        string += parent.tagName + ' ';
        parent = parent.parentElement；
    }
    return string;
}
```

<!-- more -->

#### CSS伪元素问题

`:empty` 选择器匹配没有子元素（包括文本节点）的每个元素\\
配合`before`和`after`伪元素，可以使用`content: attr(placeholder)`，将HTML里placeholder的属性写进伪元素里，属性随你定

#### window.pageYOffset和window.scrollY

`window.pageYOffset`是`window.scrollY`的别名，都是同一种功能

#### input元素里的属性问题

input框的maxlength属性可以限制输入长度，但只有当type为text的时候才可以控制，当type为number等其他时长度不受控制时，还是需要js来控制长度。
如`<input type="number" oninput="if(value.length>5)value=value.slice(0,5)" />`，password类型可以限制长度

**注意**, type为number时监听oninput不能实时监听小数点，需要输入小数点后面的数后，才能获取到小数点的输入，需要将type改成text

#### onchange和oninput的不同

有别于onchange事件，oninput 事件在元素值发生变化是立即触发， onchange 在元素失去焦点时触发。另外一点不同是 onchange 事件也可以作用于 `<keygen>` 和 `<select>` 元素

```html
<select name="type" onchange="show_sub(this.options[this.options.selectedIndex].value)">
    <option value="0">请选择主类别</option>
    <option value="1">1</option>
    <option value="2">2</option>
</select>
```

#### string.charCodeAt和string.charAt的不同

string.charCodeAt(index) 方法可返回指定位置的字符的 Unicode 编码。这个返回值是 0 - 65535 之间的整数。方法 string.charCodeAt() 与 string.charAt() 方法执行的操作相似，只不过前者返回的是位于指定位置的字符的编码，而后者返回的是字符子串。charCodeAt可以使用该方法配合A-Z进行升降序排序等

<!-- more -->

#### better-scroll使用问题（监听滚动）

需要根据文档定义传入`probeType="3`，用于better-scroll监听swip等操作的scrollY，需要传入这个再选择:listen-scroll，即better-scroll的`this.scroll.on('scroll', (pos) => {})`进行监听返回的scrollY

#### async和await的使用方法

async和await，await必定是写在async函数里：

```javascript
async function testSync() {
     const response = await new Promise(resolve => {
         setTimeout(() => {
             resolve("async await test...");
          }, 1000);
     });
     console.log(response);
}
testSync(); // async await test...
```

声明式版：

`const testSync = async() => {};`

#### Promise.all使用方法及注意事项

Promise.all是在会处理完then中的函数后（如果有执行后续then），再统一执行的，如果有返回数据则推进Promise.all的then中的res数组中，且返回顺序是确定的，传入all前的数组的顺序与后续返回的res的数组顺序是一致的；没有返回则里面推进undefined：

```javascript
function Promise1() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('success');
        }, 3000);
    });
}

function Promise2() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('success 2');
        }, 5000);
    });
}

var p1 = Promise1

var p2 = Promise2

var a = p1().then(res => { return res })

var b = p2().then(res => { return res })

Promise.all([a, b]).then(res => {
	// 5秒之后打印 ["success", "success 2"]
    console.log(res);
});
```

没有后续then版，直接resolve：

```javascript
var a = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve('aaa');
    }, 3000);
});

var b = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve('bbb');
    }, 1000);
});

var p = Promise.all([a, b]);

p.then((res) => {
	// 3秒后返回结果：['aaa','bbb']，数组的内容并不是谁先执行完谁在前面，而是按照之前传入的顺序
    console.log(res);
});
```

注意，如果进行Promise.all的Promise里进行了catch的处理，当一个Promise报错后，会优先处理具体Promise的catch，然后依然会走Promise.all的then，而不会走Promise.all的catch

#### 字符串减法运算问题

数字的字符串版，他们之间是可以进行减法运算的，因为减号是作为数值运算，没有二义性(不像+号)，所以 解释器就将"123"和"1"通过 new Number() 转换成了 数值类型，在进行运算。

```javascript
var foo = "123" - "1";
console.log(foo); // 结果是122
```

#### `~~`和`|`运算符的用法与巧用

js中的`~~`其实是一种利用符号进行的类型转换，转换成数字类型；除此之外还可以进行数字的向下取整。向下取整还有一种方法是进行或0操作

```javascript
~~true == 1
~~false == 0
~~"" == 0
~~"123" == 123
~~undefined ==0
~~!undefined == 1
~~null == 0
~~!null == 1

~~1.9 == 1
~~1.1 == 1
1.9 | 0 == 1
1.1 | 0 == 1
```

#### 使用正则判断是否存在特殊符号

```javascript
containSpecial (s) {
    let containSpecials = RegExp(/^[A-Za-z0-9\u4e00-\u9fa5]+$/);
    return (!containSpecials.test(s));
}
```

#### Object.assign是可以覆盖更改第一个引用对象的

#### Promise处理异常的情况
处理异常分2种：
- then里的第二个参数，就近捕获的原则（reject），
- catch全局异常，所有流程异常都捕获，例如reject一个Error，但如果then的第二个参数没有写，reject就会在catch中被捕获，否则不处理

```javascript
var someAsyncThing = function() {
     return new Promise((resolve, reject) => {
          reject({a: 1, b: 2})
     });
};
```

```javascript
// 由于then里没有写处理rejecte的函数，所以会在catch中处理
someAsyncThing().then(function() {
     console.log('everything is great');
}).catch(err => {
     alert(err.a)    // 1
});
```

#### Date.parse()的使用
Date.parse()可以将特点格式的日期字符串转为输出从 1970/01/01 到一个具体日期的毫秒数：
```javascript
// 可处理格式，不带时分秒也可以
var d = Date.parse("2017/03/19 11:12:30")
var d = Date.parse("2017.03.19 11:12:30")
```
Date还有类似于`getMonth()`和`setMonth()`的方法，进行特定的时间设定

#### git处理无法推送或pull下来很多冲突的方法
`git branch -D xxx` （删除本地分支）
`git checkout xxx` （重新拉取远程分支）

#### git取回所有分支的更新并新建分支
`git fetch`
`git branch -b xxx(本地) xxx(远端)`

#### 关于canvas的几条基础知识
- canvas画布的大小，需要用height和width直接设置元素，或setAttribute，使用css的width和height相当于将画布放大和缩小，也可以利用这个原理使在手机上的canvas更清晰，一般是css的属性是canvas画布大小的一半，然后canvas的画布大小也要根据屏幕的clientWidth进行适应
- canvas的画布坐标是从左上角开始算起0、0，之后递增坐标数
- canvas虚线绘制完后，使用ctx.setLineDash([])，传入空数组，可以切换回实线绘制
- ctx.globalCompositeOperation可以设置交替元素的显示方式