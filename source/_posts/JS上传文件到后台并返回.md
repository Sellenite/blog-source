---
title: JS上传文件到后台并返回
date: 2019-02-25 11:05:57
tags:
- JS
---

### 一般表单上传文件到后台的格式

```html
<form name="form2" action="/manage/product/upload.do" method="post" encType="multipart/form-data">
    <input type="file" name="upload_file" />
    <input type="submit" value="upload" />
</form>
```

字段说明：

- name：input标签的name属性值要对应后台的字段
- enctype：属性规定在发送到服务器之前应该如何对表单数据进行编码，有以下三个值：
  - application/x-www-form-urlencoded：表单数据编码为键值对，&分隔
  - multipart/form-data：不对字符编码。在使用包含文件上传控件的表单时，必须使用该值
  - text/plain：空格转换为 "+" 加号，但不对特殊字符编码



### 如何实现上传不跳转

​	默认的使用上述提交表单，选择完图片提交后会进行页面跳转，这不是所期望的。由于兼容性问题，会分为IE10+和非IE10的情况。

​	IE9和IE9以下只能用iframe表单上传拿回调，target="rfFrame"调取的是下面这个iframe的id值。作用是为了提交表单时防止页面跳转，不兼容Formdata。

​	IE10+和其他浏览器可以使用ajax的post去send一个Formdata的js对象，可以实现提交表单不跳转。

​	FormData类型其实是在XMLHttpRequest 2级定义的，它是为序列化表以及创建与表单格式相同的数据（当然是用于XHR传输）提供便利，使用FormData的最大优点就是我们可以异步上传一个二进制文件，兼容性需要IE10+。



### Formdata实现上传文件

```js
// ...
// 取file文件的方法
let fileObject = document.getElementById('upload_file').files[0];
// FormData表单对象，ie10+和其他浏览器才能使用，ie9和以下只能够使用原始form+iframe取回调
let form = new FormData();
// 将文件对象打入form实例，upload_file为后台指定的名称，取的是原有的input的name属性的值
form.append('upload_file', fileObject);
// ...
xhr.send(form);
```

注意事项：

- 传输文件时，send的时候不需要对参数进行序列化，直接将整个form对象发送过去，jquery设置processData为false
- 传输文件时，不能设置请求头，jquery设置contentType为fasle
- 可以在input框onChange时进行上传文件，点击确认和取消都会触发input的onChange
- 点击input上传file时，如果点击取消，e.target会被更改，e.target.files[0]这个对象属性会消失



### form+iframe实现上传文件不跳转

​	form原始处理form的回调这样做的：监听form指向的隐藏iframe的onLoad事件，取iframe里的innerHTML，因为它的innerHTML会直接返回一个对象，可以直接使用；有可能会返回其他东西，具体看后台怎样返回，前端再具体处理

​	jquery可以使用ajaxForm插件实现form的提交回调



### 具体实现原理代码

仅供参考，内嵌xhr请求实现，react版。

<!-- more -->

组件实现：

[react-fileupload.jsx](/quote/react-fileupload.jsx);

组件调用：

```javascript
class FileUploader extends React.Component{
    render(){
        const options={
            baseUrl         :'/manage/product/upload.do',
            fileFieldName   : 'upload_file',
            dataType        : 'json',
            chooseAndUpload : true,
            uploadSuccess   : (res) => {
                this.props.onSuccess(res.data);
            },
            uploadError     : (err) => {
                this.props.onError(err.message || '上传图片出错啦');
            }
        }
        return (
            <FileUpload options={options}>
                <button className="btn btn-xs btn-default" ref="chooseAndUpload">请选择图片</button>
            </FileUpload>
        )           
    }
}
```

