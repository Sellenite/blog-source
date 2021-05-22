---
title: '关于ES6的几个新的关于[[Prototype]]的几个API'
date: 2018-01-15 21:19:09
tags:
- JS
---

### Object.create()应用

```javascript
/* Object.create(obj)会将[[prototype]]关联到指定对象，组合继承就由于这个原理 */
/* 面向委托模式来源于Object.create()这个特性 */
let obj = {
    a: 123,
    cool: function(){
    	console.log('cool!')
    }
}

let obj2 = Object.create(obj);
console.log(obj2.a)  // 123
console.log(obj2.cool())  // 'cool!'
```

### __proto__ 和 Object.getPrototypeOf() 应用

```javascript
/* 组合继承 */
let Foo = function(name) {
    this.name = name;
};

let Bar = function(name, age) {
    /* 绑定父亲的构造属性 */
    Foo.call(this, name);
    this.age = age;
};

/* 将Bar的[[prototype]]关联到Foo的，继承Foo的原型链属性 */
Bar.prototype = Object.create(Foo.prototype);

/* ES6直接获取一个对象的[[prototype]]的方式 */
console.log(Object.getPrototypeOf(bar) === Bar.prototype);
/* 绝大多数浏览器（非标准获取方式）支持 */
console.log(bar.__proto__ === Bar.prototype);

```

### instanceof 应用

```javascript
function Foo() {}

function Bar() {
	Foo.call(...)
}

Bar.prototype = Object.create(Foo.prototype)

let bar = new Bar()

/* 构造函数之间Foo和Bar的instanceof */
Bar.prototype instanceof Foo;  // true

/* 继承可以通过instanceof找到源头 */
console.log(bar instanceof Foo);  // true

/* 注意以下instancof用法是错的，不要混淆了 */
Bar instanceof Foo  // false
```

instanceof一般用于确定一个值是哪种引用类型，是否存在于参数 object 的原型链上。而不是用于判断对象的构造函数，判断构造函数还是需要使用constructor，实例对象.constructor === 构造函数名字来判断

array，function对象instanceof Object会返回true，因为他们的引用都来自Object

### .prototype.isPrototypeOf() 应用

```javascript
/* 内省 */
let Foo = function(name) {
    this.name = name;
};

let Bar = function(name, age) {
    Foo.call(this, name);
    this.age = age;
};

Bar.prototype = Object.create(Foo.prototype);

let bar = new Bar('yuuhei', 23);

// 首先要纠正错误，Bar instanceof Foo是错的

/* 构造函数之间Foo和Bar的内省 */
Bar.prototype instanceof Foo; // true
Object.getPrototypeOf(Bar.prototype) === Foo.prototype; // true
Foo.prototype.isPrototypeOf(Bar.prototype); // true

/* 实例和构造函数之间的内省 */
bar instanceof Bar; // true
bar instanceof Foo; // true
Object.getPrototypeOf(bar) === Bar.prototype; /// true
Foo.prototype.isPrototypeOf(bar); // true
Bar.prototype.isPrototypeOf(bar); // true

```

### Object.setPrototypeOf()继承应用

```javascript
/* ES6拥有Object.setPrototypeOf进行原型链继承 */
let Foo = function() {};
Foo.prototype.a = 1;

let Bar = function() {};

Object.setPrototypeOf(Bar.prototype, Foo.prototype);

let bar = new Bar();
console.log(bar.a);  // 1
```