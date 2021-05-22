---
title: JS工作经验总结（2）
date: 2018-10-29 10:21:20
tags:
- JS
---

> 本文主要记录工作时JS问题或经验

#### new Array()的遍历问题
new Array(3)这样得出的稀疏数组不能够进行遍历，需要进行特殊的转义才能够遍历

#### webkitTransitionEnd监听Transition动画结束事件
css3的过渡属性transition，在动画结束时，也存在结束的事件：webkitTransitionEnd; 注意：transition,也仅仅有这一个事件。
```javascript
$el.addEventListener('webkitTransitionEnd', handler, false);
```
css3的动画animation也能够监听事件，分别在开始和结束时都能够监听到animationstart，animationend

#### 阻止冒泡问题

`stopPropagation()`方法既可以阻止事件冒泡，也可以阻止事件捕获

`stopImmediatePropagation()`和 `stopPropagation()`的区别在，后者只会阻止冒泡或者是捕获。 但是前者除此之外还会阻止该元素的其他事件发生，但是后者就不会阻止其他事件的发生

#### arguments的问题
`arguments`不是一个真正的数组，是一个类数组，无法使用`shift`等数组方法，只能使用`Array.prototype.slice.apply(arguments)`转换成真正的数组，或者使用`[].shift.call(arguments)`之类的方法来调用数组的方法

#### img作为数据统计的问题

img经常进行用于数据上报，做用户埋点什么的，消息已读什么的，就是将query放在图片的请求地址上就可以了。需要注意在使用img进行http请求时，img对象需要存储在闭包里，避免函数执行后，里面的变量在http请求完成前被销毁，导致发送不成功，会造成请求丢失的问题
例子（使用闭包封装img变量，避免销毁）：
```javascript
var tracker = (function() {
    var imgs = [];
    var url = 'https://www.baidu.com/img/bd_logo1.png';
    return function(id, obj = {}) {
        var query = '?id=' + id;
        for (var i in obj) {
            query += '&' + i + '=' + obj[i];
        }
        var img = new Image();
        imgs.push(img);
        img.src = url + query;
    }
})();

tracker('TEST_TRACKER', {
    name: 'yuuhei',
    age: '24'
});
```

<!-- more -->

#### js数组的push实际是进行复制
下面类似v8的实现源码：
```javascript
Array.prototype.arrayPush = function() {
    var _length = this.length;
    var n = arguments.length;
    for (var i = 0; i < n; i++) {
        this[_length + i] = arguments[i]
    }
    this.length = _length + n;
    return this.length;
}
```

#### arguments.callee就是执行函数本身，常用是递归

#### flex布局左右分配规则
```html
<div class="test">
    <div class="left">左边有预留位置，有空位补充</div>
    <div class="right">右边没预留位置，文字多长容器就多长</div>
</div>

.test {
    display: flex;
}
.test .left {
    flex: 1 1 auto;
}
.test .right {
    flex: 0 0 auto;
}
```
flex属性是flex-grow, flex-shrink 和 flex-basis的简写，默认值为0 1 auto
- flex-grow属性定义项目的放大比例，默认为0，即如果存在剩余空间，也不放大。
- flex-shrink属性定义了项目的缩小比例，默认为1，即如果空间不足，该项目将缩小。
- flex-basis属性定义了在分配多余空间之前，项目占据的主轴空间（main size）。浏览器根据这个属性，计算主轴是否有多余空间。它的默认值为auto，即项目的本来大小，占据固定空间。

#### script也有onload
```javascript
var script = document.createElement('script');
script.onload = function() {
    for (var i = 0, fn; fn = cache[i++];) {
        fn();
    }
}
script.src = './miniConsole.js';
document.getElementsByTagName('head')[0].appendChild(script);
```

#### img懒加载完美版
js实现图片加载前显示loading，先设置一个自定义属性，然后img的src先指向loading的位置，然后每个img依次使用`new Image()`，预加载好自定义属性里的图片地址，待预加载好了的时候，使用onload将img的地址指向真正的src

实例：
```html
<div>
    <img src="./loading.gif" data-src="https://www.baidu.com/img/bd_logo1.png" class="lazy-image" />
    <img src="./loading.gif" data-src="https://www.baidu.com/img/bd_logo1.png" class="lazy-image" />
</div>
```

```javascript
// 节流函数
var throttle = function(fn, interval) {
    var timer,
        firstTime = true;

    return function() {
        var _this = this;

        if (firstTime) {
            fn.apply(_this, arguments);
            firstTime = false;
        }

        if (timer) {
            return false;
        }

        timer = setTimeout(function() {
            clearTimeout(timer);
            timer = null;
            fn.apply(_this, arguments);
        }, interval || 200);
    }
}

// 先添加缓存，然后再赋值
var lazyImage = function(imageItem) {
    // .style.cssText会将元素的行内元素整个覆盖
    imageItem.style.cssText = "transition: ''; opacity: 0;";
    var img = new Image();
    var realSrc = imageItem.getAttribute('data-src');
    img.src = realSrc;
    img.onload = function() {
        imageItem.src = realSrc;
        imageItem.style.cssText = "transition:all 1s; opacity: 1;";
        imageItem.onLoad = true;
        imageItem.removeAttribute('data-src');
    }
}

var renderImage = function(event) {
    var imageList = document.getElementsByClassName('lazy-image');
    // 无序加载（图片加载完的时间不是有序）
    for (var i = 0, imageItem; imageItem = imageList[i++];) {
        if (document.documentElement.clientHeight + document.documentElement.scrollTop > imageItem.offsetTop && !imageItem.onLoad) {
            lazyImage(imageItem);
        }
    }
}

window.addEventListener('load', renderImage, false);
window.addEventListener('scroll', throttle(renderImage, 300), false);
```

倒序遍历：
```javascript
for (var l = arr.length - 1; l >= 0; l--) {

}
```

#### 关于es6中的WeakSet和WeakMap：
（Weak都是为了对象解决引用内存的问题）
- WeakMap 只能用Object作为key，不能用基本数据类型比如字符串作为key
- WeakMap 中的key是弱引用
- WeakMap 没有size
- WeakMap 不支持遍历

没有size和不支持遍历的原因是，由于Weak内部有多少个成员，取决于垃圾回收机制有没有运行，运行前后很可能成员个数是不一样的，而垃圾回收机制何时运行是不可预测的，因此ES6规定Weak不可遍历

Map 的一个最大弊端就是它会导致作为key的对象增加一个引用，因此导致GC无法回收这个对象，如果大量使用object作为Map的key会导致大量的内存泄露

WeakMap就是为了解决这个问题，在WeakMap中对作为key的对象是一个弱引用，也就是说，GC在计算对象引用数量的时候并不会把弱引用计算进去。这样当一个对象除了WeakMap没有其他引用的时候就会被GC

#### 自定义事件的创造和触发（version >= ie9）
```javascript
// 建立自定义事件创造函数
var createEvent = function createEvent (name) {
    // new CustomEvent可以自定义event对象返回时的属性
    return new Event(name, { bubbles: true });
};

try {
    new Event('test');
} catch (e) {
    // IE does not support `new Event()`
    createEvent = function (name) {
        var evt = document.createEvent('Event');
        evt.initEvent(name, true, false);
        return evt;
    };
}

// 订阅
el.addEventListener('customEvent', fn, false);

// 触发
var customEvent = createEvent('customEvent');
try {
    el.dispatchEvent(customEvent);
} catch (err) {
    // Firefox will throw an error on dispatchEvent for a detached element
    // https://bugzilla.mozilla.org/show_bug.cgi?id=889376
}
```

注意，手动触发事件更好的做法是 IE 下用 fireEvent，标准浏览器下用 dispatchEvent 实现

#### 可以使用array.length = 0来清空一个数组

#### 客户端的cookies和服务端的session

http是一种无状态的协议，就是收到一个请求，就返回一个响应，而不关心请求者的身份。cookie就是在用户端保存请求信息的机制，每次请求的时候请求头都会携带cookie

cookie是一个分号分隔的多个key-value的字段，它也存在于本地的加密文件里，但只有浏览器能够操作它，本地打开是加密后文件

cookie有几个字段：
- name：代表cookie的名称
- domain：cookie生效的域名，有作用域概念的，比如说二级域名能够使用一级域名的cookie，但不能使用其他二级域名，也不能操作所处的三级域名的cookie
- path：cookie的生效路径，同一域名下又不同路径的cookie，也是无法操作的
- expires：cookie的过期时间，如果不设置这个字段的话，就会在浏览器关闭的时候这个cookie就会被删除。expires的值是标准的日期格式，一般使用new Date().toUTCString()的值
- HttpOnly：由服务端进行设定，并且用户端无法更改这个cookie，防止XSS恶意修改cookie，HttpOnly并不能绝对防止XSS
- 删除对应的cookie只有将某条cookie（其他字段一样）的过期时间改成已经过去的时间，即可删除

session机制：
- session是服务端保存请求信息的机制，记录请求者身份
- 一般由服务端接到请求后，由服务端生成一个sessionID，然后将这个id写进请求用户端的cookie里，并且设定HttpOnly，这样每次客户端请求的时候，携带sessionID来请求，就能识别用户身份
- 生成的sessionID并不一定要种在cookie里，也可以放在请求参数里，或者在http的请求头里开辟一个token字段
- 一般都是在Response的Raw里Set-Cookie可以查看到服务端往客户端写cookie的操作

标准写法：
```javascript
document.cookie = 'name=yuuhei;domain=baidu.com;path=/;expires=Mon, 26 Nov 2018 12:11:10 GMT'
```

#### 关于使用async/await进行请求的使用方法

使用了async的函数一般默认返回都是返回一个Promise对象

async/await会由于写法的不同产生的请求时机也会不一样，如以下代码：

首先定义一个模拟的请求函数：

```javascript
// 模拟promise请求
const promiseRequest = function(success, delay) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (success) {
                if (typeof success === 'boolean') {
                    resolve('promise success');
                } else {
                    resolve(success);
                }
            } else {
                reject('promise error');
            }
        }, delay);
    });
}
```

接着写执行函数：

```javascript
const mainStep = async function() {
    // 都是同步代码，p3是在6秒后才打印出来
    let p1 = await promiseRequest(true, 1000);
    let p2 = await promiseRequest(true, 2000);
    let p3 = await promiseRequest(true, 3000);

    console.log(p3);
}

mainStep();
```

注意以上代码，他们只会p1请求完毕只会，才会再请求p2，p2请求完毕后才会请求p3，这是一个同步的代码，并不是并行的代码，如果需要并行则需要改成以下代码：

```javascript
const mainAll = async function() {
    // 这样写的p1和p2是并行的，首先都进行请求，然后再进行await，所用时间是2s+3s
    let p1 = promiseRequest('p1 await', 1000);
    let p2 = promiseRequest('p2 await', 2000);

    // 并行开始，并且两者都完成了才会继续执行p3
    let r1 = await p1;
    let r2 = await p2;

    let p3 = await promiseRequest(`${r1} and ${r2}`, 3000);
    console.log(p3);
}

mainAll();
```

当然也可以使用PromiseAll处理并发，换个方式：

```javascript
const mainPromiseAll = async function() {
    let p1 = promiseRequest('p1 promiseAll await', 1000);
    let p2 = promiseRequest('p2 promiseAll await ', 2000);

    let results = await Promise.all([p1, p2]);

    let [r1, r2] = results;

    let p3 = await promiseRequest(`${r1} and ${r2}`, 3000);
    console.log(p3);
}

mainPromiseAll();
```

async/await同样可以使用Promise.all进行错误捕获：

> await的Promise.all的错误捕获之一，统一在Promise.all中的catch捕获

```javascript
const doRequest1 = async () => {
    let res = await promiseRequest(false, 1000);
    return res;
}

const doRequest2 = async () => {
    let res = await promiseRequest('await try-catch-2', 2000);
    return res;
}

// doRequest1报错后接下来的请求都不会再执行，错误提示只提一遍
Promise.all([doRequest1(), doRequest2()]).then(res => {
    console.log(res);
}).catch(err => {
    console.log(err);
});
```

> await的Promise.all的错误捕获之二，分别在里面的Promise都进行try-catch处理，Promise.all里的catch就不会再执行

```javascript
const doRequest1 = async () => {
    try {
        let res = await promiseRequest(false, 1000);
        return res;
    } catch (err) {
        console.log(err);
    }
}

const doRequest2 = async () => {
    try {
        let res = await promiseRequest('await try-catch-2', 2000);
        return res;
    } catch (err) {
        console.log(err);
    }
}

// doRequest1报错后接下来的请求也会继续执行，有多少个错误就报多少个错，只要里面每个Promise都进行了错误捕获，然后只会执行then，永远不会执行catch，因为已经捕获过了
Promise.all([doRequest1(), doRequest2()]).then(res => {
    console.log(res);
}).catch(err => {
    console.log('do not run here forever');
});
```

不使用Promise.all也可以达到效果的同步代码：

```javascript
async function doRequest() {
    let p1 = promiseRequest(true, 1000);
    let p2 = promiseRequest(true, 2000);
    let p3 = promiseRequest(true, 3000);

    try {
        await p1;
        await p2;
        await p3;

        console.log('next');
    } catch (err) {
        client.alert(err);
    }
}

doRequest()
```

以上代码p1、p2和p3并行完成后才会继续走next后的代码

#### 在请求头使用Token

在使用JSON Web Token作为单点登录的验证媒介时，为保证安全性，建议将JWT的信息存放在HTTP的请求头中，并使用https对请求链接进行加密传输

当在进行跨域请求的时候，如自定义请求头，如添加token字段，属于复杂请求，那么HTTP请求会发出一个预检请求，即OPTIONS请求，访问服务器是否允许该请求，如果没有进行设置，服务器会返回403 Forbidden，需要在服务端也要定义好自定义的请求头字段，才能响应响应预检请求，ajax工具可以在beforeSend进行对xhr.setRequestHeader进行设置请求头

#### 数组的indexOf也可以用来判断对象的位置，传入对象引用的内存地址就能够找到

```javascript
let obj1 = {a: 1, b: 2};
let obj2 = {a: 3, b: 4};
let arr = [obj1, obj2];

arr.indexOf(obj2); // 1
```

#### String类型也可以使用slice，用法与Array差不多

#### JS标准快排原理

```javascript
function quickSort(array) {
    return quick(array, 0, array.length - 1);
}

function quick(array, left, right) {
    let index;
    if (array.length > 1) {
        index = partition(array, left, right);
        if (left < index - 1) {
            quick(array, left, index - 1);
        }
        if (index < right) {
            quick(array, index, right);
        }
    }
    return array;
}

// 划分操作函数
function partition(array, left, right) {
    // 用index取中间值而非splice
    const pivot = array[Math.floor((right + left) / 2)];
    let i = left;
    let j = right;

    while (i <= j) {
        while (compare(array[i], pivot) === -1) {
            i++;
        }
        while (compare(array[j], pivot) === 1) {
            j--;
        }
        if (i <= j) {
            swap(array, i, j);
            i++;
            j--;
        }
    }
    return i;
}

// 比较函数
function compare(a, b) {
    if (a === b) {
        return 0;
    }
    return a < b ? -1 : 1;
}

// 原地交换函数，而非用临时数组
function swap(array, a, b) {;
    [array[a], array[b]] = [array[b], array[a]];
}
````

阮一峰老师的快排会增加空间复杂度，尽量使用这种教科书式的原理，且v8的sort底层本身就经过优化，比现在大多数排序的优化都好，尽量使用sort。

#### 金钱千分符格式化正则

```javascript
function exchange(num) {
    num = String(num);
    if (num.length < 4) {
        return num;
    }

    num = num.replace(/\d{1,3}(?=(\d{3})+$)/g, (v) => {
        return v + ',';
    });

    return num;
};
````

#### JS深复制原理实现

- 判断类型

```javascript
/**
 * 判断数据类型
 * @param  {All} obj    需要判断的对象
 * @return {String}     返回结果字符串
 */
function typeOf(obj) {
    const toString = Object.prototype.toString;
    const map = {
        "[object Boolean]": "boolean",
        "[object Number]": "number",
        "[object String]": "string",
        "[object Function]": "function",
        "[object Array]": "array",
        "[object Date]": "date",
        "[object RegExp]": "regExp",
        "[object Undefined]": "undefined",
        "[object Null]": "null",
        "[object Object]": "object"
    };
    return map[toString.call(obj)];
}
```

- 递归赋值

```javascript
/**
 * 深复制
 * @param  {Array/Object} data 需要复制的数据
 * @return {Array/Object}      返回新的数据
 */
function deepCopy(data) {
    const type = typeOf(data);
    let ret;

    // 只有array和object需要递归遍历
    if (type === "array") {
        ret = [];
    } else if (type === "object") {
        ret = {};
    } else {
        return data;
    }

    if (type === "array") {
        for (let i = 0; i < data.length; i++) {
            ret.push(deepCopy(data[i]));
        }
    } else if (type === "object") {
        for (let key in data) {
            ret[key] = deepCopy(data[key]);
        }
    }

    return ret;
}
```

#### iOS下调用元素的focus方法，input元素不聚焦问题

注意，在iOS有一个兼容问题，就是如果在钩子函数里调用$el.focus()，或异步调用$el.focus()的话，是不成功的。

google有以下解释：

> iOS将只允许在其他元素上绑定函数来触发focus事件，如果第一个函数调用栈是由非编程触发的事件，调用setTimeout开始一个新的调用堆栈，IOS的安全机制开始阻止你触发input元素的focus事件。在函数里使用异步也是不行的

钩子函数无法触发例子：

```javascript
export default {
    mounted() {
        this.$refs.input.focus();
    }
}
```

上述代码应该很多人会这么做，需求背景时：点击某个元素，弹框出现，然后自动聚焦在弹框的input上


异步函数无法触发例子：

```javascript
export default {
    handleClick() {
        this.visable = true;
        // 视图更新后，必须在nextTick回调做事，不然不生效
        this.$nextTick(() => {
            this.$refs.component.$refs.input.focus();
        })
    }
}
```

既然钩子函数无法触发，那就使用点击事件，其中visable对应v-show和v-if都是一样的，然后在异步调用focus

以上两个例子在真机上，安卓是可以的，iOS是失效的。

那怎么办，暂时找到的唯一方法：使input元素一直存在于页面中，只是对用户不可见而已（位移移出可视区域），然后调用focus，iOS才能生效

**成功例子**：

```javascript
export default {
    // 必须通过事件触发，click, touchend等
    handleClick() {
        // 将子组件移动到可视区域
        // ...
        this.$refs.component.$refs.input.focus();
    }
}
```

在iOS中，所有异步调用setTimeout，Promise，nextTick等，调用focus()均无效


#### 超长String转Number后会有问题

注意：Number类型超过16位的数字会变成0，且第16位会加一

在对String进行转换为Number时需要注意长度问题


#### 使用递归格式化用于级联列表的格式

从后台返回的树状列表结构，一般是这种形式：

```javascript
[
    // 从公司开始，所以这个列表只有一个对象，从部门开始才是多个对象
    {
        "id": "0000",
        "name": "公司名称",
        "level": "0",
        "parentId": "null",
        "children": [
            {
                "id": "1000",
                "name": "信息技术中心",
                "level": "1",
                "parentId": "1",
                "children": [
                    {
                        "id": "10001",
                        "name": "系统开发部",
                        "level": "1000",
                        "parentId": "68610408",
                        "children": [
                            {
                                "id": "1000101",
                                "name": "后端开发组",
                                "level": "3",
                                "parentId": "10001",
                                "children": []
                            },
                            {
                                "id": "1000102",
                                "name": "前端开发组",
                                "level": "3",
                                "parentId": "10001",
                                "children": []
                            }
                        ]
                    }
                ]
            },
            // ...其他部门
        ]
    }
]
```

而级联组件一般的格式就是如此，但由于后端返回来的字段各种各样，前端也需要进行一个数据的格式化，需要将格式变为以下如此：

```javascript
[
  {
    "value": "zhinan",
    "label": "指南",
    "children": [
      {
        "value": "shejiyuanze",
        "label": "设计原则",
        "children": [
          {
            "value": "yizhi",
            "label": "一致"
          },
          {
            "value": "fankui",
            "label": "反馈"
          },
          {
            "value": "xiaolv",
            "label": "效率"
          },
          {
            "value": "kekong",
            "label": "可控"
          }
        ]
      }
    ]
  }
]
```

可以发现，这类数据都有着重复的规律，这种就可以使用递归进行遍历：

```javascript
// 递归处理树状结构
function formatList(list) {
    let ret = [];

    list.forEach((item, index) => {
        let obj = {};
        obj.label = item.name;
        obj.value = item.id;
        for (let key in item) {
            if (Array.isArray(item[key]) && item[key].length > 0) {
                // children与第一层结构一样，可以递归
                obj.children = formatList(item[key]);
            }
        }
        ret.push(obj);
    });

    return ret;
}
```

#### 关于document.write的问题

document.write写入的内容是叠加的，不是覆盖写入，可以做一些如下操作：

```js
document.write('<link rel="stylesheet" type="text/css" href="css/reset.css">')
```

可以动态加载注入外部的css文件

#### 前端生成的base64图片或文件如何下载

前端下载的原理是通过在a标签上定义href和download属性，download在同源里可以设置下载的文件名，然后通过自定义时间触发a标签的点击，就可以进行下载了：

```js
// data可以为base64，或后端的文件地址
function saveFile(data, filename = '') {
    let save_link = document.createElement('a');
    save_link.href = data;
    save_link.download = filename; // 同域下才能指定download，否则又后端控制

    // 自定义派发时间，相当于点击a标签
    let event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    save_link.dispatchEvent(event);
}
```

#### 前端生成pdf并下载

可以通过html2canvas和jsPDF配合生成下载，具体教程可以网上搜


#### 









