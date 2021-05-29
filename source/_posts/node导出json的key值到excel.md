---
title: node导出json的key值到excel
date: 2021-05-29 20:38:20
tags:
- Node
---

进行多语言设定的时候，有时会有导出json的key值到excel，然后在excel进行语言配置，然后再使用excel导出多个国际语言的需求

以下的代码是进行第一步的代码，csv后缀改为xlsx即可

```js
/* 此文件用于导出需要做国际化翻译的语句 */
const fs = require('fs');
const json = require('./lang-en.json');

const array = Object.keys(json);
fs.writeFile('need-translate.csv', array.join('\r\n'), () => console.log('写入完毕'));
```