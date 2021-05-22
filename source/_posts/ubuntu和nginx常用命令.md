---
title: ubuntu和nginx常用命令
date: 2019-03-04 00:10:51
tags:
- Linux
- Nginx
---



### Ubuntu

配置host：

```
sudo vim /etc/hosts
```

安装nginx：

```
sudo apt-get install nginx
```

查看有没有nginx占用：

```
ps -ef | grep nginx
```

强制删除所有nginx进程：

```
sudo pkill -9 nginx
```

获取root权限

```
sudo su
```

退出root权限模式

```
ctrl+d
```

<!-- more -->

下载文件（url是下载文件的地址）

```
wget url
```

查看当前路径

```
pwd
```

返回上一次打开的路径

```
cd -
```

创建文件夹

```
mkdir name
```

创建/修改文件

```
vim filename
touch filename
```

查看文件内容

```
cat filename
```

vim保存退出

```javascript
// 保存并退出
:wq
// 保存
:w
// 退出
:q
// 强制退出
:q!
```

vim视图模式

```bash
:set nu
```

vim编辑模式

```
i
```

vim只读模式

```
esc
```

连接远程服务器

```
ssh user@remote_ip
```

上传网站到服务器

```bash
// scp -r ./demo/* root@46.86.255.117:/root/www 例子
scp -r local_dir user@ip:/remote_dir
```

解压

```
tar -xzvf filename.tar.xz
```

移动文件夹

```
mv -r xxx pathname
```

重命名

```
mv old_filename new_filename
```

软链

```
ls -n 
```



### Nginx

启动nginx：

```
sudo nginx -c /etc/nginx/nginx.conf
```

停止nginx进程

```
nginx -s stop
```

重启nginx

```
sudo nginx -s reload
```

查看nginx默认配置文件和路径和语法是否正确

```
nginx -t
```



