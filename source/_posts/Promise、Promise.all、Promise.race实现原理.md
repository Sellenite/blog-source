---
title: Promise、Promise.all、Promise.race实现原理
date: 2019-03-08 22:50:21
tags:
    - JS
---

### Promise

#### 原理

- 简易版Promise
- 实现原理，执行从闭包带出来的resolve和reject函数
- 然后再执行then，将函数压到执行栈中
- 然后第一步的异步函数执行好了，就会利用resolve或reject传入参数并执行栈中的函数

#### 实现

```javascript
const PENDING = 'pending';
const RESOLVED = 'resolved';
const REJECTED = 'rejected';

const MyPromise = function(fn) {
    const that = this;
    this.state = PENDING;
    this.value = null;
    this.resolvedCallbacks = [];
    this.rejectedCallbacks = [];

    function resolve(value) {
        // 执行环境不同，需要使用闭包变量
        if (that.state === PENDING) {
            that.state = RESOLVED;
            that.value = value;
            that.resolvedCallbacks.forEach(cb => cb(that.value));
        }
    }

    function reject(value) {
        if (that.state === PENDING) {
            that.state = REJECTED;
            that.value = value;
            that.rejectedCallbacks.forEach(cb => cb(that.value));
        }
    }

    try {
        fn(resolve, reject);
    } catch (e) {
        reject(e);
    }
}

MyPromise.prototype.then = function(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
    onRejected = typeof onRejected === 'function' ? onRejected : r => {
        throw r
    };
    if (this.state === PENDING) {
        this.resolvedCallbacks.push(onFulfilled);
        this.rejectedCallbacks.push(onRejected);
    }
    // 如果在new Promise的时候就已经处理的resolve，直接执行函数
    if (this.state === RESOLVED) {
        onFulfilled(this.value);
    }
    if (this.state === REJECTED) {
        onRejected(this.value);
    }
}
```

### Promise.all

#### 原理

- 返回新的promise，遍历循环传入的数组，处理每一个promise的then和catch
- then里处理将返回的内容写入对应的位置，如果判断所有结果已经处理，就将数组集合resolve
- catch里处理错误，只要有一个错误，就直接将错误reject

#### 实现

```javascript
const promiseAll = (arr) => {
    let result = new Array(arr.length).fill(undefined),
        count = arr.length;

    return new Promise((resolve, reject) => {
        for (let i = 0; i < arr.length; i++) {
            arr[i].then((res) => {
                // 按顺序写入结果
                result[i] = res;
                if (--count === 0) {
                    resolve(result);
                }
            }).catch((err) => {
                reject(err);
            })
        }
    });
}
```

### Promise.race

#### 原理

- 返回新的promise，遍历循环传入的数组，处理每一个promise的then和catch
- then里处理返回的内容，只要有返回，立即将结果resolve
- catch里处理错误，只要捕获到错误，立即将错误reject

#### 实现

```javascript
const promiseRace = (arr) => {
    return new Promise((resolve, reject) => {
        for (let i = 0; i < arr.length; i++) {
            // 一个成功直接返回
            arr[i].then((res) => {
                resolve(res);
            }).catch((err) => {
                reject(err);
            });
        }
    });
}
```









