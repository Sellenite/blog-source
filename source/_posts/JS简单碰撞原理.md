---
title: JS简单碰撞原理
date: 2018-01-09 21:52:50
tags:
- JS
---

先看分析图：
![碰撞原理](/images/js-crash.jpg)

- 当div1在div2的上边线(t2)以上的区域活动时，始终碰不上

- 当div1在div2的右边线(r2)以右的区域活动时,始终碰不上

- 当div1在div2的下边线(b2)以下的区域活动时,始终碰不上

- 当div1在div2的左边线(r2)以左的区域活动时,始终碰不上

> 除了以上四种情况，其他情况表示div1和div2碰上了，下面试完整测试代码

<!--more-->

由于测试时外面有position为relative，使用offsetTop等会受它的影响，故以client为基准，使用getBoundingClientRect，原理不变：

```javascript
/* 传入两个原生dom元素 */
function judgeCrash(obj1, obj2) {
    /* 碰撞判断 */
    var first_Rect = obj1.getBoundingClientRect()
    var second_Rect = obj2.getBoundingClientRect()

    var firstLeft = first_Rect.left;
    var firstTop = first_Rect.top;
    var firstRight = first_Rect.right;
    var firstBottom = first_Rect.bottom;

    var secondLeft = second_Rect.left;
    var secondTop = second_Rect.top;
    var secondRight = second_Rect.right;
    var secondBottom = second_Rect.bottom;
    if (firstLeft > secondRight || firstRight < secondLeft || firstTop > secondBottom || firstBottom < secondTop) {
        // 没有碰撞
        return false;
    } else {
        // 有碰撞
        return true;
    }
}
```