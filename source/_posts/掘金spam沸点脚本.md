---
title: 掘金spam沸点脚本
date: 2021-05-22 19:17:40
tags:
- JS
---

> 用于攻击某些发言有问题的用户，刷他沸点评论，将textarea放到浏览器里，放上垃圾话后，在浏览器执行脚本（开小号执行，会被掘金检测到后然后禁言，慎用）

<!--more-->

```js
// userId从用户主页获取
// <textarea id="testTextarea"></textarea> // 垃圾话填装
var get_item_id_url = 'https://api.juejin.cn/content_api/v1/short_msg/query_list'; // 获取用户最新一条数据接口
var comment_api_url = 'https://api.juejin.cn/interact_api/v1/comment/publish'; // 发布评论接口
var comments = testTextarea.value.replace(/Sellenite/g, '').split('\n');

function ajax(options) {
  options = options || {};
  options.data = options.data || {};
  //  请求方式，默认是GET
  options.type = options.type || 'GET';
  // 避免有特殊字符，必须格式化传输数据
  options.data = JSON.stringify(options.data);
  var xhr = null;
  // 实例化XMLHttpRequest对象
  if (window.XMLHttpRequest) {
    xhr = new XMLHttpRequest();
  } else {
    // IE6及其以下版本
    xhr = new ActiveXObjcet('Microsoft.XMLHTTP');
  };
  // 监听事件，只要 readyState 的值变化，就会调用 readystatechange 事件
  xhr.onreadystatechange = function() {
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
  if (options.type === 'GET') {
    // 三个参数：请求方式、请求地址(get方式时，传输数据是加在地址后的)、是否异步请求(同步请求的情况极少)；
    xhr.open(options.type, options.url, true);
    xhr.send(null);
  } else {
    // 连接和传输数据
    xhr.open(options.type, options.url, true);
    //必须，设置提交时的内容类型
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    // 传输数据
    xhr.send(options.data);
  }
}

function randomNum(minNum, maxNum) {
  switch (arguments.length) {
    case 1:
      return parseInt(Math.random() * minNum + 1, 10);
      break;
    case 2:
      return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
      break;
    default:
      return 0;
      break;
  }
}

// 使用循环循环获取所有沸点数
async function getAllItemIds(requestUserId) {
  function rq(cursor = 0) {
    return new Promise((resolve, reject) => {
      ajax({
        url: get_item_id_url, // 请求地址
        type: 'POST', // 请求类型，默认"GET"，还可以是"POST"
        data: {
          cursor: String(cursor), // 页码开始
          limit: 100, // 每次请求多少大小
          sort_type: 4, // 列表类型，4为沸点
          user_id: requestUserId
        },
        success: function(res) { // 请求成功的回调函数
          res = JSON.parse(res);
          var list = res.data;
          resolve({ list: list || [], has_more: res.has_more });
        },
        error: function(error) {
          reject(error);
        }
      });
    })
  }

  let cursor = 0;
  let arr = [];
  let res;

  do {
    res = await rq(cursor);
    arr = [...arr, ...res.list];
    cursor += 100;
  } while (res.has_more);

  let ret = [];

  arr.forEach((item, i) => {
    var itemId = item.msg_id;
    var userId = item.author_user_info && item.author_user_info.user_id;
    if (itemId && userId === requestUserId) {
      ret.push({
        itemId,
        userId
      })
    }
  })
  
  return ret;
}

function setComment(itemId) {
  return new Promise((resolve, reject) => {
    var num = randomNum(0, comments.length - 1);
    var comment = comments[num];
    ajax({
      url: comment_api_url, // 请求地址
      type: 'POST', // 请求类型，默认"GET"，还可以是"POST"
      data: {
        "item_id": itemId,
        "item_type": 4,
        "comment_content": comment,
        "comment_pics": [],
        "client_type": 2608
      }, // 传输数据
      success: function(res) {
        resolve(JSON.parse(res));
      },
      error: function(error) {
        reject(error);
      }
    });
  })
}

// 评论所有动态
setInterval(function() {
  var targetUserId = '2137106332779502';
  getAllItemIds(targetUserId).then((arr) => {
    if (arr.length) {
      var promise = arr.map(item => {
        return setComment(item.itemId);
      });
      Promise.all(promise).then((res) => {
        console.log(res);
      })
    } else {
      console.log('该用户暂未有可评论的沸点内容');
    }
  })
}, 5000)
```