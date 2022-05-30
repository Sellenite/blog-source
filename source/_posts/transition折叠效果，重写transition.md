---
title: transition折叠效果，重写transition
date: 2022-05-30 09:36:01
tags:
- Vue
---

```javascript
const elTransition = '0.3s all ease';
const Transition = {
  beforeEnter(el) {
    el.style.transition = elTransition;
    if (!el.dataset) el.dataset = {};

    el.style.height = 0;
    el.style.opacity = 0;
  },

  enter(el) {
    if (el.scrollHeight !== 0) {
      el.style.height = `${el.scrollHeight}px`;
      el.style.opacity = 1
    } else {
      el.style.height = '';
      el.style.opacity = ''
    }
    el.style.overflow = 'hidden';
  },

  afterEnter(el) {
    el.style.transition = '';
    el.style.height = '';
    el.style.opacity = ''
  },

  beforeLeave(el) {
    if (!el.dataset) el.dataset = {};
    el.style.display = 'block';
    el.style.height = `${el.scrollHeight}px`;
    el.style.overflow = 'hidden';
    el.style.opacity = 1
  },

  leave(el) {
    if (el.scrollHeight !== 0) {
      el.style.transition = elTransition;
      el.style.height = 0;
      el.style.opacity = 0;
    }
  },

  afterLeave(el) {
    el.style.transition = '';
    el.style.height = '';
    el.style.opacity = ''
  },
};

export default {
  name: 'CollapseTransition',
  functional: true,
  render(h, { children }) {
    const data = {
      on: Transition,
    };
    return h('transition', data, children);
  },
};
```

应用：左边导航栏树型组件动画

```html
<template>
  <div class="level-1">
    <div class="label"></div>
    <collapse-transition>
      <div class="level-2-menu" v-show="levelOne.expand">
        ...
      </div>
    </collapse-transition>
  </div>
</template>
```