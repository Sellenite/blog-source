---
title: JS各种完美继承方案及其应用
date: 2018-01-15 20:55:19
tags:
- JS
---

### ES5组合继承方案（首选）

```javascript
var Parent = function (name, age) {
    this.name = name
    this.age = age
    this.say = function () {
        console.log('say from parent constructor')
    }
}
Parent.prototype.sayALL = function () {
    console.log('sayALL from parent prototype')
}
// 完美继承
var Child = function (name, age, type) {
    // 调用父元素构造函数
    Parent.apply(this, [name, age])
    this.type = type
}
// Object.create(..)它会创建一个对象并把这个对象的[[Prototype]]关联到指定的对象
Child.prototype = Object.create(Parent.prototype)
// 这里直接赋值会造成constructor在实例中能在原型链上被枚举
Child.prototype.constructor = Child
/* 可选，通过以下方式使constructor不能被枚举 */
Object.defineProperty(Child.prototype, 'constructor', {
    writable: false,
    enumerable: false,
    configurable: false,
    value: Child
})
var Child = new Child('yuuhei', '23', 'Child')
```

### ES5寄生组合继承方案（候选）

```javascript
var Parent = function (name, age) {
    this.name = name
    this.age = age
    this.say = function () {
        console.log('say from parent constructor')
    }
}
Parent.prototype.sayALL = function () {
    console.log('sayALL from parent prototype')
}
// 完美继承
var Child = function (name, age, type) {
    // 调用父元素构造函数
    Parent.apply(this, [name, age])
    this.type = type
}
// 重点
var Super = function () {}
Super.prototype = Parent.prototype
// 这时候Super实例化就没有Parent的构造函数的内容了
Child.prototype = new Super()
// 这里直接赋值会造成constructor在实例中能在原型链上被枚举
Child.prototype.constructor = Child
/* 可选，通过以下方式使constructor不能被枚举 */
Object.defineProperty(Child.prototype, 'constructor', {
    writable: false,
    enumerable: false,
    configurable: false,
    value: Child
})
var Child = new Child('yuuhei', '23', 'Child')
```

### ES6的class实现继承方案（首选）

```javascript
class Parent {
    constructor(name, age) {
        this.name = name
        this.age = age
    }
    say() {
        return 'this is parent'
    }
}

// ES6语法糖继承
class Child extends Parent {
    constructor(name, age, type) {
        // super必须放在第一行
        super(name, age)
        this.type = type
    }
    sayChild() {
        // 利用super调用父构造函数
        return super.say()
    }
}

var children = new Child('yuuhei', 23, 'child')
```

### class扩展阅读参考（伪多态等）

```javascript

/* Orbment.prototype.call(this, ...)是伪多态 */
class Orbment {
    constructor(name) {
        this.name = name || 'Orbment';
        this.message = null;
    }
    setSize(width, height) {
        this.width = width || 50;
        this.height = height || 50;
        this.message = `The ${this.name} `;
    }
    getMessage() {
        return this.message;
    }
}

class ENIGMA extends Orbment {
    constructor(name, width, height) {
        // super()在constructor必须在this调用前执行
        super(name);
        this.width = width || 50;
        this.height = height || 50;
    }
    setSize(width, height) {
        // 以前的伪多态写法：Orbment.prototype.setSize.apply(this, [width, height])
        // 注意你不知道的javascript出版书上的super(width, height)在constructor外使用已被禁止，改为替换以下方式实现相对多态
        // 对父元素的setSize的基础上进行重写
        super.setSize(width, height);
        this.message += `size is width ${this.width} and height ${this.height}`;
        return this;
    }
}

class ARCUS extends Orbment {
    constructor(name, width, height) {
        // super()在constructor必须在this调用前执行
        super(name);
        this.width = width || 50;
        this.height = height || 50;
    }
    setSize(width, height) {
        // 以前的伪多态写法：Orbment.prototype.setSize.apply(this, [width, height])
        // 注意你不知道的javascript出版书上的super(width, height)在constructor外使用已被禁止，改为替换以下方式实现相对多态
        // 对父元素的setSize的基础上进行重写
        super.setSize(width, height);
        this.message += `size is width ${this.width} and height ${this.height}`;
        return this;
    }
}

let ENIGMA_I = new ARCUS('ENIGMA_I');
let ENIGMA_I_SIZE_MESSAGE = ENIGMA_I
    .setSize()
    .getMessage();

let ARCUS_I = new ARCUS('ARCUS_I');
let ARCUS_I_SIZE_MESSAGE = ARCUS_I
    .setSize(100, 70)
    .getMessage();

console.log(ENIGMA_I_SIZE_MESSAGE);
console.log(ARCUS_I_SIZE_MESSAGE);

```