---
title: JS函数节流和函数去抖和分时函数
date: 2017-07-21 15:48:06
tags:
- JS
---

### 函数节流throttle.js

我们这里说的throttle就是函数节流的意思。再说的通俗一点就是函数调用的频度控制器，是连续执行时间间隔控制。主要应用的场景比如：

- 鼠标移动，mousemove 事件
- DOM 元素动态定位，window对象的resize和scroll 事件
- 定时器版：


```javascript
var throttle = function(fn, interval) {
    var timer,
        firstTime = true;

    return function(...args) {
        var _this = this;

        if (firstTime) {
            fn.apply(_this, args);
            return firstTime = false;
        }

        if (timer) {
            return false;
        }

        timer = setTimeout(function() {
            clearTimeout(timer);
            timer = null;
            fn.apply(_this, args);
        }, interval || 200);
    }
}
```

* 时间戳版

```javascript
var throttle = function(fn, interval) {
    var previous = 0;

    return function(...args) {
        var now = +new Date();
        var _this = this;

        if (now - previous > interval) {
            fn.apply(_this, args);
            previous = now
        }
    }
}
```



### 函数去抖debounce.js

debounce和throttle很像，debounce是空闲时间必须大于或等于 一定值的时候，才会执行调用方法。debounce是空闲时间的间隔控制。比如我们做autocomplete，这时需要我们很好的控制输入文字时调用方法时间间隔。一般时第一个输入的字符马上开始调用，根据一定的时间间隔重复调用执行的方法。对于变态的输入，比如按住某一个建不放的时候特别有用。
debounce主要应用的场景比如：

- 文本输入keydown 事件，keyup 事件，例如做autocomplete



```javascript
var debounce = function(fn, interval) {
    var timer

    return function(...args) {
        var _this = this;

        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(function() {
            fn.apply(_this, args);
        }, interval);
    }
}
```

用法：
```javascript
document.addEventListener('mousemove', debounce(function() {
    console.log(this)
}, 500));

document.addEventListener('mousemove', throttle(function() {
    console.log(this)
}, 500));
```

### 额外性能优化方案：分时函数
```javascript
// 分时函数，避免一次加载过多数据，类似好友列表
var timeChunk = function(array, fn, count, interval) {
    var obj,
        timer

    var start = function() {
        for (var i = 0; i < Math.min(count || 1, array.length); i++) {
            obj = array.shift();
            fn(obj)
        }
    }

    return function() {
        timer = setInterval(function() {
            if (array.length === 0) {
                return clearInterval(timer);
            }
            start();
        }, interval || 200);
    }
}

var friendList = [];
for (var i = 0; i < 100; i++) {
    friendList.push({ id: i });
}

var renderFriendList = timeChunk(friendList, function(item) {
    var div = document.createElement('div');
    div.innerHTML = item.id;
    document.body.appendChild(div);
}, 10);

renderFriendList();
```