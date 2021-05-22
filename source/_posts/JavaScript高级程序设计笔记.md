---
title: JavaScript高级程序设计笔记
date: 2018-11-01 11:21:09
tags:
  - JS
  - 读书笔记
---

#### 全局函数isNaN()的问题
> isNaN()去执行一个非数字字符串，会返回true，注意。

因为isNaN()的本意是去判断这个参数是否"不是数值"，任何不能被转为数值的值都会导致这个函数返回true，注意，即首先对参数进行一次Number转换，返回为NaN的参数会被判断为NaN

```javascript
alert(isNaN(NaN)); //true
alert(isNaN(10)); //false（ 10 是一个数值）
alert(isNaN("10")); //false（可以被转换成数值 10）
alert(isNaN(true)); //false（Boolean可以被转换成数值 1）
alert(isNaN("blue")); //true（非数字字符串不能转换成数值）
alert(isNaN(undefined)); //true（undefined不能转换成数值）
```

解决方案有两种：
利用NaN是唯一一个与自身严格不相等的值：
```javascript
function myIsNaN(value) { 
    return value !== value; 
}
```

在使用isNaN()之前先检查一下这个值是不是数字类型，这样就避免了隐式转换的问题：
```javascript
function myIsNaN2(value) { 
    return typeof value === 'number' && isNaN(value); 
}
```

#### null进行数值转换为0，undefined进行数值转换为NaN

#### js将字符串转换为dom元素的方法，利用childNodes
```javascript
function parseDom(arg) {
　　var objE = document.createElement("div");
　　objE.innerHTML = arg;
　　return objE.childNodes[0];
};

var obj=parseDom('<div id="div_1" class="div1">Hello World!</div>');
```

注意：childNodes返回的是一个类似数组的list。所以如果是一个元素，要使用这个dom需要这样使用obj[0]。如果是多个同级的dom转换，可以这样使用obj[0]、obj[1]...

#### js获取元素的兄弟元素

```javascript
var siblings = function (el) {
    var arr = [];
    var children = el.parentNode.children;
    for (var i = 0, len = children.length; i < len; i++) {
        if (children[i] !== el) {
            arr.push(children[i]);
        }
    }
    return arr;
}
```

#### new原理
使用构造函数，要创建新的实例，必须使用 new 操作符。以这种方式调用构造函数实际上会经历以下 4
个步骤：
- 创建一个新对象；
- 将构造函数的作用域赋给新对象（因此 this 就指向了这个新对象）；
- 执行构造函数中的代码（为这个新对象添加属性）；
- 返回新对象。

实现代码:

```javascript
var Person = function (name, age) {
    this.name = name;
    this.age = age;
}

var newConstructor = function (Foo, ...args) {
    // 继承构造函数prototype的属性，有两种写法
    // var obj = {};
    // obj.__proto__ = Foo.prototype;
    var obj = Object.create(Foo.prototype);
    // 执行并绑定this到新对象
    var k = Foo.apply(obj, args);
    // 返回
    if (typeof k === 'object') {
        return k;
    } else {
        return obj;
    }
}

var person = newConstructor(Person, 'yuuhei', 23);
```