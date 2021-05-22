---
title: vue-router切换动画实现
date: 2021-05-22 00:41:48
tags:
- Vue
---

#### router-view结构：

> 注意要将router-view的样式使用定位对齐到同一水平线，mode使用同时进出的动画

```vue
<template>
  <div id="app">
    <transition :name="transitionName">
      <keep-alive>
        <router-view class="router"></router-view>
      </keep-alive>
    </transition>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: "App",
  data() {
    return {};
  },
  computed: {
    ...mapState(['transitionName'])
  }
};
</script>

<style>
html,body {
  width:100%;
  height:100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100%;
  height: 100%;
  position: relative;
}

.router {
  position: absolute;
  height: 100%;
  width:100%;
  top: 0;
}

.slide-left-enter, .slide-right-leave-to {
  opacity: 0;
  transform: translate3D(100%, 0, 0);
}

.slide-left-leave-to, .slide-right-enter {
  opacity: 0;
  transform: translateX(-100%, 0, 0);
}

.slide-left-enter-active, .slide-left-leave-active, .slide-right-enter-active, .slide-right-leave-active {
  transition: 0.6s;
  position: absolute;
  top:0;
}
</style>
```

#### store:

> 也可以选择监听$route，来改变transitionName

<!--more-->

```js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        transitionName: 'slide-right'
    },
    mutations: {
      setTransitionName(state, name) {
        state.transitionName = name;
      }
    }
})

export default store
```

> 重要：全局监听浏览器的popstate，路由时hash或history都可以监听，router.back()和router.go(-1)都能触发popstate

```js
import 'lib-flexible/flexible'
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'

Vue.config.productionTip = false

// 重要，无论是hash模式还是history模式都可以使用
window.addEventListener('popstate', function (e) {
  router.isBack = true
},false)

router.beforeEach((to, from, next) => {
  // 监听路由变化时的状态为前进还是后退
  const isBack = router.isBack;
  if (isBack) {
    store.commit('setTransitionName', 'slide-right')
  } else {
    store.commit('setTransitionName', 'slide-left')
  }
  router.isBack = false;
  next();
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
```