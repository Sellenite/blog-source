---
title: vue-router前进刷新，后退缓存方案
date: 2021-06-29 17:25:30
tags:
- Vue
---

#### 原理

进入页面后添加该页面至缓存。如果是replace进入的则不进行缓存操作；

退出页面的时候移除该页面的缓存；

添加缓存必须是进入页面后再加，这样下次进入才是缓存，而不是进入前加入缓存，进入后立刻获取上一个状态的缓存

<!--more-->

#### 重新定义路由跳转的函数

由于全局需要监听函数是否前进/后退，需要重新编写路由的跳转函数，利用store，存储进入前的路由状态routerPushStatus，然后在全局路由守卫中获取这个值，以判断进入的是前进还是后退等：

> ./router.js

```js
import store from './store/index.js'
import VueRouter from 'vue-router'
import Vue from 'vue'

const useRouter = VueRouter => {
  const routerPush = VueRouter.prototype.push
  const routerReplace = VueRouter.prototype.replace
  const routerGo = VueRouter.prototype.go
  const routerBack = VueRouter.prototype.back
  const routerForward = VueRouter.prototype.forward

  VueRouter.prototype.push = function push(location, onComplete, onAbort) {
    store.state.routerPushStatus = 'push'
    return routerPush.apply(this, [location, onComplete, onAbort])
  }

  VueRouter.prototype.replace = function replace(location, onComplete, onAbort) {
    store.state.routerPushStatus = 'replace'
    return routerReplace.apply(this, [location, onComplete, onAbort])
  }

  VueRouter.prototype.go = function go(n) {
    if (n < 0) {
      store.state.routerPushStatus = 'back'
    } else {
      store.state.routerPushStatus = 'push'
    }

    return routerGo.apply(this, [n])
  }

  VueRouter.prototype.back = function back() {
    store.state.routerPushStatus = 'back'

    return routerBack.apply(this, [])
  }

  VueRouter.prototype.forward = function forward() {
    store.state.routerPushStatus = 'push'

    return routerForward.apply(this, [])
  }
}

useRouter(VueRouter);
Vue.use(VueRouter)
```

手机端的后退有一个问题，就是如果使用原生的后退，是不会触发router的back()或go(-1)方法的，结果就是如果使用了浏览器原生的后退进行后退，就不会经过自定义的路由函数，无法得知他是后退状态，这时候需要监听popstate来解决这个问题

> main.js

```js
import store from './store/index.js'

window.addEventListener('popstate', function (e) {
  store.state.routerPushStatus = 'back'
}, false)
```



#### 在vuex中定义router缓存的相关module

> ./router-cache.js

```js
const state = {
  includedComponents: [],
  excludedComponents: []
}

const mutations = {
  removeInclude(state, str) {
    state.includedComponents.splice(state.includedComponents.indexOf(str), 1);
  },
  addToInclude(state, str) {
    if (str && state.includedComponents.indexOf(str) === -1) {
      state.includedComponents.push(str);
    }
  },
  removeExclude(state, str) {
    state.excludedComponents.splice(state.excludedComponents.indexOf(str), 1);
  },
  addToExclude(state, str) {
    if (str && state.excludedComponents.indexOf(str) === -1) {
      state.excludedComponents.push(str);
    }
  }
}

export default {
  state,
  mutations
}
```

> ./store/index.js

```js
import Vue from 'vue'
import Vuex from 'vuex'
import routerCache from './modules/router-cache.js'

export default new Vuex.Store({
  modules: {
    routerCache,
  },
})
```



#### 定义好进行缓存/移除缓存的函数

> ./util.js

```js
import store from './store/index.js'

const addRouterCache = routeName => {
  store.commit('addToInclude', routeName)
  store.commit('removeExclude', routeName)
}

const removeRouterCache = routeName => {
  store.commit('removeInclude', routeName)
  store.commit('addToExclude', routeName)
}
```



#### 路由要定义好name属性，引用的组件同样要定义相同的name

> ./router.js

```js
import VueRouter from 'vue-router'

const routers = [{
  path: '/',
  name: 'Home',
  component: () => import('./views/Home.vue'),
}]
    
const router = new VueRouter({
  routes,
})

export default router
```



> ./views/Home.vue

```js
export default {
  name: 'Home'
}
```



#### 在全局定义路由守卫，执行缓存相关函数

> ./main.js

```js
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueRouter from 'vue-router'
import { addRouterCache, removeRouterCache } from './utils.js'

function _handleRouterCacheFn(to, from) {
  const routerPushStatus = store.state.routerPushStatus
  if (routerPushStatus === 'back') {
    store.state.routerAnimate = 'slide-right'
    removeRouterCache(from.name)
    addRouterCache(to.name)
  } else {
    store.state.routerAnimate = 'slide-left'
    addRouterCache(to.name)
    // replace模式下将from不进行缓存
    if (routerPushStatus === 'replace') {
      removeRouterCache(from.name)
    }
  }
}

// 处理前进刷新，后退缓存的逻辑，beforeEach也可以，不限
router.afterEach((to, from) => {
  _handleRouterCacheFn(to, from)
})

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
```



#### 处理keep-alive的逻辑

> ./App.vue

```html
<template>
  <div class="app">
    <transition :name="routerAnimate">
      <keep-alive :include="includedComponents" :exclude="excludedComponents">
        <router-view :key="$route.fullPath" />
      </keep-alive>
    </transition>
  </div>
</template>

<script>
export default {
  computed: {
    ...mapState({
      includedComponents: state => state.routerCache.includedComponents,
      excludedComponents: state => state.routerCache.excludedComponents,
    }),
  },
}
</script>

<style lang="less" scoped>
.slide-left-enter,
.slide-right-leave-to {
  opacity: 0;
  transform: translate3d(100%, 0, 0);
}

.slide-left-leave-to,
.slide-right-enter {
  opacity: 0;
  transform: translate3d(-100%, 0, 0);
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: 0.4s;
}
</style>
```



自此为止完成了通用的APP使用vue&vue-router&vuex进行的前进刷新，后退缓存的方案。如果在提交某些订单返回后要删除缓存，使用utils.js里的removeRouterCache函数即可