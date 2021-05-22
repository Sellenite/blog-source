---
title: call/apply/bind/new/create/instanceof原理
date: 2019-03-26 00:42:53
tags:
    - JS
---

### call

```javascript
Function.prototype.myCall = function(context) {
    if (typeof this !== 'function') {
        throw new TypeError('Error');
    }
    context = context || window;
    const args = [...arguments].slice(1);
    // 将函数绑定到上下文
    context.fn = this;
    const result = context.fn(...args);
    delete context.fn;
    return result;
}
```

### apply

```javascript
Function.prototype.myApply = function(context) {
    if (typeof this !== 'function') {
        throw new TypeError('Error');
    }
    context = context || window;
    context.fn = this;
    let result;
    if (arguments[1]) {
        result = context.fn(...arguments[1]);
    } else {
        result = context.fn();
    }
    delete context.fn;
    return result;
}
```

<!-- more -->

### bind

```javascript
Function.prototype.myBind = function(context) {
    if (typeof this !== 'function') {
        throw new TypeError('Error');
    }
    const _this = this;
    const args = [...arguments].slice(1);
    // bind需要返回一个函数
    return function F() {
        // 因为返回了一个函数，如果进行了new F()，需要重新制定this
        if (this instanceof F) {
            return new _this(...args, ...arguments);
        }
        // 合并参数执行
        return _this.apply(context, [...args, ...arguments]);
    }
}
```

### new

```javascript
// 使用__proto__
const myNew = function() {
    // 创建一个对象
    const obj = {};
    const Constructor = [].shift.call(arguments);
    // obj原型指向原型链
    obj.__proto__ = Constructor.prototype;
    // 使obj得到构造函数的属性
    const result = Constructor.apply(obj, arguments);
    // 返回
    return typeof result === 'object' ? result : obj;
}

// 使用Object.create
const myNew2 = function(Foo, ...args) {
    const obj = Object.create(Foo.prototype);
    const result = Foo.apply(obj, args);
    if (typeof result === 'object') {
        return result;
    } else {
        // 构造函数不返回对象时执行，一般情况下是执行这行
        return obj;
    }
}
```

### Object.create

```javascript
const myCreate = function(obj) {
    let F = function() {};
    F.prototype = obj;
    return new F();
}
```

### instanceof

```javascript
// instanceof实现原理，本质是遍历原型链
const myInstanceof = function(left, right) {
    // 原本的instanceof只能根据原型链上判断，因此基础类型直接返回false
    if (typeof left !== 'object') {
        return false;
    }
    let prototype = right.prototype;
    left = left.__proto__;
    while (true) {
        if (left == null) {
            return false;
        }
        if (left === prototype) {
            return true;
        }
        left = left.__proto__;
    }
};
```