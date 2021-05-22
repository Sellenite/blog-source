---
title: JS实现Ajax和Jsonp
date: 2017-07-13 20:12:16
tags:
- JS
---
### 一、JS原生AJAX
ajax：一种请求数据的方式，不需要刷新整个页面；

ajax的技术核心是 XMLHttpRequest 对象；

ajax 请求过程：创建 XMLHttpRequest 对象、连接服务器、发送请求、接收响应数据；

封装基本ajax函数：


```javascript
// 普通回调
function ajax(options) {
    options = options || {};
    options.data = options.data || {};

    //  请求方式，默认是GET
    options.type = (options.type || 'GET').toUpperCase();
    // 避免有特殊字符，必须格式化传输数据  
    options.data = formatParams(options.data);
    var xhr = null;

    // 实例化XMLHttpRequest对象   
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        // IE6及其以下版本   
        xhr = new ActiveXObjcet('Microsoft.XMLHTTP');
    };

    // 监听事件，只要 readyState 的值变化，就会调用 readystatechange 事件 
    xhr.onreadystatechange = function () {
        //  readyState属性表示请求/响应过程的当前活动阶段，4为完成，已经接收到全部响应数据
        if (xhr.readyState == 4) {
            var status = xhr.status;
            //  status：响应的HTTP状态码，以2开头的都是成功
            if (status >= 200 && status < 300) {
                var response = '';
                // 判断接受数据的内容类型  
                var type = xhr.getResponseHeader('Content-type');
                if (type.indexOf('xml') !== -1 && xhr.responseXML) {
                    response = xhr.responseXML; //Document对象响应   
                } else if (type === 'application/json') {
                    response = JSON.parse(xhr.responseText); //JSON响应   
                } else {
                    response = xhr.responseText; //字符串响应   
                };
                // 成功回调函数 
                options.success && options.success(response);
            } else {
                options.error && options.error(status);
            }
        };
    };

    // 连接和传输数据   
    if (options.type == 'GET') {
        // 三个参数：请求方式、请求地址(get方式时，传输数据是加在地址后的)、是否异步请求(同步请求的情况极少)；
        xhr.open(options.type, options.url + '?' + options.data, true);
        xhr.send(null);
    } else {
        xhr.open(options.type, options.url, true);
        //必须，设置提交时的内容类型   
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        // 传输数据  
        xhr.send(options.data);
    }


    //格式化参数   
    function formatParams(data) {
        var arr = [];
        for (var name in data) {
            //   encodeURIComponent() ：用于对 URI 中的某一部分进行编码
            arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
        };
        // 添加一个随机数参数，防止缓存   
        arr.push('v=' + random());
        return arr.join('&');
    }

    // 获取随机数   
    function random() {
        return Math.floor(Math.random() * 10000 + 500);
    }
}
```

```javascript
// 调用
ajax({
    url: 'test.php',   // 请求地址
    type: 'POST',   // 请求类型，默认"GET"，还可以是"POST"
    data: { 'b': '异步请求' },   // 传输数据
    success: function (res) {   // 请求成功的回调函数
        console.log(JSON.parse(res));
    },
    error: function (error) { }   // 请求失败的回调函数
});
```

<!--more-->

#### 1、创建

1.1、IE7及其以上版本中支持原生的 XHR 对象，因此可以直接用： var oAjax = new XMLHttpRequest();

1.2、IE6及其之前的版本中，XHR对象是通过MSXML库中的一个ActiveX对象实现的。有的书中细化了IE中此类对象的三种不同版本，即MSXML2.XMLHttp、MSXML2.XMLHttp.3.0 和 MSXML2.XMLHttp.6.0；个人感觉太麻烦，可以直接使用下面的语句创建： var oAjax=new ActiveXObject(’Microsoft.XMLHTTP’);

#### 2、连接和发送

2.1、open()函数的三个参数：请求方式、请求地址、是否异步请求(同步请求的情况极少，至今还没用到过)；

2.2、GET 请求方式是通过URL参数将数据提交到服务器的，POST则是通过将数据作为 send 的参数提交到服务器；

2.3、POST 请求中，在发送数据之前，要设置表单提交的内容类型；

2.4、提交到服务器的参数必须经过 encodeURIComponent() 方法进行编码，实际上在参数列表”key=value”的形式中，key 和 value 都需要进行编码，因为会包含特殊字符。每次请求的时候都会在参数列表中拼入一个 “v=xx” 的字符串，这样是为了拒绝缓存，每次都直接请求到服务器上。


```
encodeURI() ：用于整个 URI 的编码，不会对本身属于 URI 的特殊字符进行编码，如冒号、正斜杠、问号和井号；其对应的解码函数 decodeURI()；

encodeURIComponent() ：用于对 URI 中的某一部分进行编码，会对它发现的任何非标准字符进行编码；其对应的解码函数 decodeURIComponent()；
```

#### 3、接收

3.1、接收到响应后，响应的数据会自动填充XHR对象，相关属性如下
responseText：响应返回的主体内容，为字符串类型；
responseXML：如果响应的内容类型是 “text/xml” 或 “application/xml”，这个属性中将保存着相应的xml 数据，是 XML 对应的 document 类型；
status：响应的HTTP状态码；
statusText：HTTP状态的说明；

3.2、XHR对象的readyState属性表示请求/响应过程的当前活动阶段，这个属性的值如下

- 0-未初始化，尚未调用open()方法；

- 1-启动，调用了open()方法，未调用send()方法；

- 2-发送，已经调用了send()方法，未接收到响应；

- 3-接收，已经接收到部分响应数据；

- 4-完成，已经接收到全部响应数据；

只要 readyState 的值变化，就会调用 readystatechange 事件，(其实为了逻辑上通顺，可以把readystatechange放到send之后，因为send时请求服务器，会进行网络通信，需要时间，在send之后指定readystatechange事件处理程序也是可以的，我一般都是这样用，但为了规范和跨浏览器兼容性，还是在open之前进行指定吧)。

3.3、在readystatechange事件中，先判断响应是否接收完成，然后判断服务器是否成功处理请求，xhr.status 是状态码，状态码以2开头的都是成功，304表示从缓存中获取，上面的代码在每次请求的时候都加入了随机数，所以不会从缓存中取值，故该状态不需判断。

#### 4、ajax请求是不能跨域的！


### 二、JSONP跨域

JSONP(JSON with Padding) 是一种跨域请求方式。主要原理是利用了script 标签可以跨域请求的特点，由其 src 属性发送请求到服务器，服务器返回 js 代码，网页端接受响应，然后就直接执行了，这和通过 script 标签引用外部文件的原理是一样的。

JSONP由两部分组成：回调函数和数据，回调函数一般是由网页端控制，作为参数发往服务器端，服务器端把该函数和数据拼成字符串返回。
　　
比如网页端创建一个 script 标签，并给其 src 赋值为 http://www.superfiresun.com/json/?callback=process， 此时网页端就发起一个请求。服务端将要返回的数据拼好最为函数的参数传入，服务端返回的数据格式类似`process({'name'':'superfiresun'})`，网页端接收到了响应值，因为请求者是 script，所以相当于直接调用 process 方法，并且传入了一个参数。
　　
单看响应返回的数据，JSONP 比 ajax 方式就多了一个回调函数。

```javascript
/**
 * jsonp请求 原理
 * 服务端返回类似test({"q":"测试"})这样的执行函数
 * 前端只需定义test这个函数处理传入返回的数据即可
 * 有些后台还支持定义返回的函数名是什么，但是需要约定好字段传入
 */
const jsonp = ({ url, params, callbackKey, callback, overtime }) => {
    return new Promise((resolve, reject) => {
        let script = document.createElement('script');
        let head = document.getElementsByTagName('head')[0];
        let arr = [];
        // 随机数防止缓存
        params = { ...params, v: Math.random(), [callbackKey]: callback };
        head.appendChild(script);

        for (let key in params) {
            arr.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
        }

        // 回调函数
        window[callback] = function(data) {
            resolve(data);
            clearTimeout(script.timer);
            head.removeChild(script);
            window[callback] = null;
        }

        // 发送请求
        script.src = `${url}?${arr.join('&')}`;

        // 前端控制超时处理
        if (overtime) {
            script.timer = setTimeout(() => {
                head.removeChild(script);
                // 删除回调，不能直接赋值null，假如之后请求回来后会执行null()，导致报错
                window[callback] = () => { window[callback] = null; };
                reject('前端限制时间内请求超时');
            }, overtime);
        }
    });
};
```

1、因为 script 标签的 src 属性只在第一次设置的时候起作用，导致 script 标签没法重用，所以每次完成操作之后要移除；

2、JSONP这种请求方式中，参数依旧需要编码；

3、如果不设置超时，就无法得知此次请求是成功还是失败；

```javascript
// 执行
jsonp({
    url: 'https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su', // 请求地址
    params: {
        json: 1,
        wd: '测试'
    },
    overtime: 5000, // 超时
    callbackKey: 'cb', // 后端约定字段
    callback: 'test' // 返回时的执行函数名称
}).then(res => {
    console.log(res);
}).catch(err => {
    console.log(err);
});
```


