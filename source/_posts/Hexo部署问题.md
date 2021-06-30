---
title: Hexo部署问题
date: 2021-06-30 17:16:22
tags:
---

如果使用了最新版的node安装hexo-cli，然后项目安装hexo，会出现打包的文件为空的问题。这个是node的版本问题，使用nvm切换至node版本为13.14.0，然后重新全局安装hexo-cli和项目安装hexo，此时就会恢复正常
