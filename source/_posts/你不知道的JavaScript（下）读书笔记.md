---
title: "你不知道的JavaScript（下）读书笔记"
date: 2019-01-13 13:24:16
tags:
 - JS
 - 读书笔记
---

### 第二部分  ES6及更新版本

<!-- more -->

```javascript
/**
 * 你不知道的JavaScript(下卷) 第二部分 ES6及更新版本
 * 第一部分没有笔记
 */

{
    const runSomething = (obj) => {
        let x = Math.random(),
            y = Math.random();

        return obj.something(x, y);
    }

    let num = runSomething({
        // 递归引用当前函数的必要写法
        something: function something(x, y) {
            if (x > y) {
                return something(y, x);
            }
            return y - x;
        }
    });

    console.log(num);
};

{
    let obj1 = {
        foo() {
            console.log('foo obj1');
        }
    };

    let obj2 = {
        foo() {
            // 可以这样使用super
            super.foo();
            console.log('foo obj2');
        }
    };

    // 其实就是将obj1的__proto__赋值给obj2
    Object.setPrototypeOf(obj2, obj1);
    obj2.foo();
};

{
    // 标签字符串字面量
    const foo = (strings, ...values) => {
        console.log(strings);
        console.log(values);
    };

    const desc = 'awesome';

    foo`Everything is ${desc}!`;
};

{
    // 标签字符串字面量简单应用
    const fixNum = (strings, ...values) => {
        // strings ["you should pay ", " to me"]
        // values [19.9891]
        return strings.reduce((prev, curr, currIdx) => {
            console.log(prev);
            console.log(curr);
            if (currIdx > 0) {
                if (typeof values[currIdx - 1] === 'number') {
                    prev += `$${values[currIdx - 1].toFixed(2)}`
                }
                else {
                    prev += values[currIdx - 1];
                }
            }
            return prev + curr;
        }, "");
    };

    const amt = 19.9891;
    // 每个通过字面量传入的数字都会被toFixed
    const result = fixNum`you should pay ${amt} to me`;
    console.log(result);
};

{
    // 箭头函数没有自己的arguments，而是继承自父层
    const foo = function() {
        const bar = () => {
            console.log(arguments); // Arguments [1, 2, 3, callee:(..)]
        };
        bar(4, 5, 6);
    }

    foo(1, 2, 3);

    // 但是仍然像普通函数一样可以通过结构来得到类似arguments的数组
    const baz = (...args) => {
        console.log(args);
    }

    baz(7, 8, 9); // [7, 8, 9]
};

{
    // 箭头函数内部没有constructor方法，也没有prototype，所以不支持new操作
    // 它对this的处理与一般的普通函数不一样，箭头函数的this始终指向函数定义时的this，不可用于构造
    const foo = () => { };
    const bar = new foo(); // 不要使用箭头函数做为构造函数
}

{
    // symbol没有字面量形式，不能对Symbol使用new，他不是一个构造器，也不会创建对象
    const sym = Symbol('some optional description');
    // 基础类型，识别symbol的首选办法
    console.log(typeof sym); // symbol
    // 提供描述时会只被作为这个符号的字符串表示
    console.log(sym.toString()); // Symbol(some optional description)

    // sym不是Symbol的实例，像字符串不是String的实例一样，所以无法使用instanceof判断，需要装箱
    console.log(sym instanceof Symbol); // false
    console.log(Object(sym) instanceof Symbol); // true
    // 平时判断直接使用typeof判断即可，无需再次装箱再判断
};

{
    // 单例creator
    const getSingle = function(fn) {
        // 符号本身的内部值是不在代码中出现且无法获得的，所以可以作为唯一值
        const INSTANCE = Symbol('instance');
        // 将返回的结果绑定creator的执行环境this
        const _this = this;

        return function() {
            return getSingle[INSTANCE] || (getSingle[INSTANCE] = fn.apply(_this, arguments));
        }
    };

    // 执行环境
    const container = {
        getSingle
    };

    const creator = container.getSingle(function() { return this });
    const result1 = creator();
    const result2 = creator();
    console.log(result1); // container
    console.log(result1 === result2); // true
};

{
    // 符号作为键值存在于对象中时，不可被枚举，但可以被Object.getOwnPropertySymbols拿出
    const obj = {
        foo: 42,
        [Symbol('foo')]: 24,
        bar: 110
    }

    console.log(Object.getOwnPropertyNames(obj)); // ["foo", "bar"]
    console.log(Object.getOwnPropertySymbols(obj)); // [Symbol(foo)]

    // 内置符号
    const arr = [1, 2, 3];
    console.log(arr[Symbol.iterator]); // ƒ values() { [native code] }
};

{
    const arr = [{ a: 1, b: 2 }, 2, 3];
    const it = arr[Symbol.iterator]();

    const map = new Map();
    map.set('a', 4);
    map.set('b', 5);

    const it2 = map.entries();

    // 返回最终值，例如前面的arr的3，done依然是false的，再进行一次迭代done才是true
    console.log(it.next());
    console.log(it2.next());
};

{
    const arr = [1, 2, 3];
    const it = arr[Symbol.iterator]();
    /**
     * for-of实现原理
     * 迭代之前都调用了 it.next()，然后查看一下 res.done，
     * 如果 res.done 为 true，表达式求值为 false，迭代就不会发生，
     * 这就是返回最后一个值时，返回的done仍然是true的原因，否则就直接忽略最后一个值了
     */
    for (let v, res; (res = it.next()) && !res.done;) {
        v = res.value;
        console.log(v);
    }
};

{
    const task = {
        actions: [],
        [Symbol.iterator]() {
            let steps = this.actions.slice();

            return {
                // 使迭代器成为iterable
                [Symbol.iterator]() { return this },
                next(...args) {
                    if (steps.length > 0) {
                        let res = steps.shift()(...args);
                        return { value: res, done: false };
                    } else {
                        return { value: undefined, done: true };
                    }
                },

                return(v) {
                    steps.length = 0;
                    return { value: v, done: true };
                }
            }
        }
    };

    task.actions.push(function(x, y) {
        return x + y;
    });

    let it = task[Symbol.iterator]();

    console.log(it.next(10, 20));
};

{
    // iterator返回的value是yield后面的值
    // 每次next都会停在yield的左边，并把yield的内容先返回为value
    // 使用next赋值可以用作里面表达式的值进行运算
    // next总比yield多一
    const foo = function* () {
        yield 1;
        const num = 100 * (yield 2);
        return num;
    }

    const it = foo();
    console.log(it.next('111'));
    console.log(it.next('222'));
    console.log(it.next('333')); // 333000, done
};

{
    // Regenerator原理，ES5
    // 原来的写法：
    const foo = function* () {
        const x = yield 42;
        console.log(x);
    }

    const it = foo();
    console.log(it.next());
    console.log(it.next('111'));

    // facebook Regenerator 实现iterator大概原理：
    const bar = function() {
        let state = 0, x;

        function nextState(v) {
            switch (state) {
                case 0:
                    state++;
                    return 42;
                case 1:
                    state++;
                    x = v;
                    console.log(x);
                    return undefined;
            }
        }

        return {
            next: function(v) {
                let ret = nextState(v);
                return { value: ret, done: state === 2 }
            }
        }
    }

    // 与原生的iterator同样用法
    const it2 = bar();
    console.log(it2.next());
    console.log(it2.next('222'));
};

{
    class Foo {
        constructor(a, b) {
            this.x = a;
            this.y = b;
        }

        getValueXY() {
            return this.x * this.y;
        }
    }

    class Bar extends Foo {
        constructor(a, b, c) {
            super(a, b);
            this.z = c;
        }

        getValueXYZ() {
            return super.getValueXY() * this.z;
        }
    }

    const bar = new Bar(5, 10, 15);
    console.log(bar);
};

{
    // 对于map来说，通常会使用对象作为键值，因为普通对象本来就能够使用字符串
    let x = { id: 1 };
    let y = { id: 2 };
    let map = new Map();
    map.set(x, 1);
    map.set(y, 2);

    // map的keys()，values()，entries()得到的全是iterator，可以使用...进行扩展
    const itValues = map.values();
    // 方法从一个类似数组或可迭代对象中创建一个新的数组实例，有第二个回调参数
    const arr1 = Array.from(itValues); // [1, 2]
    // 也可以通过扩展运算符处理iterator
    const arr2 = [...itValues]; // []，arr1已经将iterator迭代完毕
    console.log(arr1, arr2, itValues);

    const itKeys = map.keys();
    const arr3 = [...itKeys]; // [{id: 1}, {id: 2}]
    console.log(arr3);
};

{
    // new Array时传入一个数字参数时是生成一个空数组，其length 属性为这个数字
    // Array.of(..)可以修复这个问题
    const arrEmpty = new Array(3);
    console.log(arrEmpty);

    const arrExist = Array.of(3);
    console.log(arrExist);

    // babel默认不支持原生构造函数的继承，需要插件支持，不然执行会找不到方法
    class AnotherArray extends Array {
        sum() {
            return this.reduce((prev, curr, currIdx) => {
                return prev + curr;
            }, 0);
        }
    }

    const arr = AnotherArray.of(1, 2, 3);
    console.log(arr.sum());
};

{
    // Array.from可以将iterator转成数组（看上面例子）
    // 如果把类数组对象作为参数传给Array.from，它的行为方式和slice()或者apply(..)是一样的
    const arr = [1, 2, 3];
    const arrCopy = Array.from(arr);
    arrCopy[1] = 4;
    console.log(arr, arrCopy);

    // Array.from转换的数组没有空槽位，是真正的undefined值，new Array(4)就有4个空槽位
    const arrEmpty = new Array(4);
    const arrUndefined = Array.from(arrEmpty);
    console.log(arrEmpty, arrUndefined);

    // Array.from的第二个参数，映射功能，与Array#map的功能相似
    const arrCopyMap = Array.from(arr, (item, index) => {
        if (item % 2 === 1) {
            return item * 2;
        } else {
            return item;
        }
    });
    console.log(arrCopyMap);
};

{
    /**
     * copyWithin，
     * 参数是 target（要复制到的索引）
     * start（开始复制的源索引，包括在内）
     * end（复制结束的不包含索引）
     * 任何一个参数是负数，就被当作是相对于数组结束的相对值
     * 会修改原数组
     */
    const arr = [0, 1, 2, 3, 4];
    console.log(arr.copyWithin(3, 0, 1)); // [0, 1, 2, 0, 4]
    [1, 2, 3, 4, 5].copyWithin(2, 1); // 结果是[1, 2, 2, 3, 4]，而不是[1, 2, 2, 2, 2]
};

{
    const arrEmpty = new Array(4);
    arrEmpty.fill('all');
    const arrUndefined = Array.from(new Array(4));
    arrUndefined.fill('part', 1, 3);
    console.log(arrEmpty, arrUndefined);
};

{
    // some返回的是true/false
    const arr = [1, 3, 2, 4, 5];
    const result = arr.some((item, index, arr) => {
        return item === index;
    });
    console.log(result); // true

    // find返回的是真正的数组值，找不到返回undefined
    const num = arr.find((item, index) => {
        return item === index;
    });
    console.log(num); // 2

    // findIndex返回的是数组的索引值，找不到返回-1
    const index = arr.findIndex((item, index) => {
        return item === 5;
    });
    console.log(index); // 4

    // find和findIndex都支持数组值是对象的复杂值
    const arrComplex = [
        { id: 1, value: 100 },
        { id: 2, value: 200 }
    ];

    const obj = arrComplex.find((item, index) => {
        return item.id === 2;
    });
    console.log(obj); // {id: 2, value: 200}

    const num2 = arrComplex.findIndex((item, index) => {
        return item.value === 200;
    });
    console.log(num2); // 1
};

{
    // Object.is执行比 === 比较更严格的值比较，具体在于NaN和+0与-0的比较，与===不太相同
    const x = NaN, y = +0, z = -0;
    console.log(Object.is(x, NaN)); // true
    console.log(Object.is(y, z)); // false

    x === NaN; // false
    y === z; // true
};

{
    // Number.isNaN()与window.isNaN()不相同，window.isNaN()判断有问题，会将传入的参数先转为数字
    console.log(Number.isNaN('test')) // false
    console.log(window.isNaN('test')) // true
};

{
    /**
     * new.target能够指向调用new的目标构造器
     * 在普通的函数调用中（和作为构造函数来调用相对），new.target的值是undefined
     * 这使得可以检测一个函数是否是作为构造函数通过new被调用的
     */
    class Parent {
        constructor() {
            if (new.target === Parent) {
                // 函数有name属性
                console.log(`${new.target.name} instantiated`);
            } else {
                // 继承时new.target是一个undefined值，可能是继承执行父元素的构造函数时，属于普通调用导致的
                console.log(`Child instantiated`);
            }
        }
    };

    class Child extends Parent { };

    const parent = new Parent();
    const child = new Child();
};

{
    // 定义一个只返回奇数索引值对应的值的迭代器
    const arr = [2, 4, 6, 8, 10];
    arr[Symbol.iterator] = function* () {
        let idx = 1;
        do {
            yield this[idx];
        } while ((idx += 2) < this.length)
    }

    for (let v of arr) {
        console.log(v);
    }
};
```