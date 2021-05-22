---
title: git常用错误解决方案
date: 2020-07-21 21:48:01
tags:
  - Git
---

### git常用错误解决方案



### git被墙，需要设置代理

假如`git push`等操作出现`Timed out`等，无法对远端的代码进行操作，且访问github的时候无法访问，就要考虑是被墙的问题。浏览器可以通过SwitchyOmega进行代理，git同样需要进行配置代理才能够访问



我用的是ByWave，是V2ray的机场。注册购买登录后进入系统设置面板，主要看Socks5端口和HTTP端口，然后在需要进行配置的项目执行以下配置命令（不建议使用--global命令，不同项目的地址可能都不同，不需要所有都代理）



使用Socks5：（设配置定义的端口是1081）

`git config http.proxy "socks5://127.0.0.1:1081"`

`git config https.proxy "socks5://127.0.0.1:1081"`



使用HTTP：

`git config http.proxy "http://127.0.0.1:1081"`
`git config https.proxy "http://127.0.0.1:1081"`



然后开启代理，即可进行`git push`等操作



如果要取消代理配置，执行以下命令即可：

`git config --unset http.proxy`

`git config --unset https.proxy`



### github连接报"ssh: connect to host github.com port 22: Connection timed out"错误

先测试是不是由于这个问题无法进行一系列的git操作：

在连接github时，执行”ssh -T git@github.com” 命令时，出现

```
ssh: connect to host github.com port 22: Connection timed out
```



解决方法：

首先设置好ssh key

然后找到git的安装目录，找到/etc/ssh/ssh_config文件，然后再把以下这段写入到文本即可

```
Host github.com // 或者使用默认的Host *
User YourEmail@163.com // 设置成自己ssh定义的email
Hostname ssh.github.com
PreferredAuthentications publickey
IdentityFile ~/.ssh/id_rsa
Port 443
```

Ubuntu就在根目录找到.ssh和直接找/etc路径即可，注意需要使用sudo权限去修改
