---
title: JS正则匹配url获取query
date: 2017-04-24 14:49:43
tags:
  - JS
---
源码：

```javascript
/* 解析url参数 */
/* @example ?id=12345&a=b */
/* @return Object {id:12345, a:b} */

export function urlParse() {
    let url = window.location.search;
    let obj = {};
    let reg = /[?&][^?&]+=[^?&]+/g;
    let arr = url.match(reg);
    // ['?id=12345', '&a=b'] arr
    if (arr) {
        arr.forEach((item) => {
            /* 干掉第一个字符，？和& */
            let tempArr = item.substring(1).split('=');
            let key = decodeURIComponent(tempArr[0]);
            let val = decodeURIComponent(tempArr[1]);
            obj[key] = val;
        });
    }
    return obj;
};
```

**注意，由于Vue默认的路由是带有#的，就是hash，这样打出来的window.location.search得到的值是空值，所以如果是这种情况，要将上面的.search改成.hash！**