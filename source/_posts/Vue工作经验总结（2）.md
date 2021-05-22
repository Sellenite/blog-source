---
title: Vue工作经验总结（2）
date: 2019-03-14 18:04:19
tags:
    - Vue
---

#### props可以控制传入的限制，使用validator

```javascript
const oneOf = (value, validList) => {
    for (let i = 0; i < validList.length; i++) {
        if (value === validList[i]) {
            return true;
        }
    }
    return false;
}

props: {
    size: {
        validator(value) {
            return oneOf(value, ['large', 'small', 'default'])
        },
        default: 'default'
    }
}
```

#### provide/inject允许支持上下文特性，共享数据（类似react的context）

```javascript
// 祖先组件
provide() {
    return {
        form: this
    }
}

// 子组件，这样子组件就可以使用this.form访问到祖先组件的实例了
inject: ['form']
```

#### 使用mixins高度抽象各类方法，方便复用

使用mixins时，如果有定义created等函数的，会先执行mixins里的created，然后再执行组件里的created。如果mixins里有定义方法，然后组件里也定义了一个同样名称的方法，组件里的方法会覆盖mixins里的方法。

#### 组件内使用$emit出来的事件，同样可以在本组件使用$on监听到

```javascript
// 同一个组件
this.$emit('on-select', selectValue);
this.$on('on-select', (selectValue) => {});
```

#### Vue2.x废除了Vue1.x的$dispatch和$broadcast的方法，可以使用现有的$on和$emit实现

<!-- more -->

```javascript
/**
 * Vue1.x
 * $dispatch用于向上级派发事件，只要是它的父级（一级或多级以上），都可以在组件内通过$on监听到
 * $broadcast用于向下级广播时间，同样使用$on监听到
 * 由于Vue2.x已经废弃这两个方法，使用$emit和$on替代，使用递归遍历方式可以模拟达到功能
 * 根本原理是使用$emit可以在本组件使用$on监听到
 */

export default {
    methods: {
        // 需要指定谁接受这个信息
        dispatch(componentName, eventName, params) {
            let parent = this.$parent || this.$root;
            let name = parent.$options.name;
            // 循环往上遍历
            while (parent && (!name || name !== componentName)) {
                parent = parent.$parent;

                if (parent) {
                    name = parent.$options.name;
                }
            }
            // 找到后触发emit，然后使用on就可监听到
            if (parent) {
                parent.$emit.apply(parent, [eventName, params]);
            }
        },
        // 具名函数，子组件递归遍历查询使用
        broadcast: function broadcast(componentName, eventName, params) {
            this.$children.forEach((child) => {
                let name = child.$options.name;
                if (name === componentName) {
                    child.$emit.apply(child, [eventName, params]);
                } else {
                    broadcast.apply(child, [componentName, eventName, params]);
                }
            });
        }
    }
}
```

dispatch是用于子组件向祖先组件派发事件，与Vue1.x的方法不同，模拟的方法需要指定组件的名称。使用方法:

```javascript
// 子组件
this.dispatch('form', 'on-select', selectValue);
// 祖先组件监听
this.$on('on-select', (selectValue) => {});
```

broadcast是用于祖先组件向子组件广播事件，与Vue1.x的方法不同，模拟的方法同样需要指定组件的名称。使用方法:

```javascript
// 祖先组件
this.broadcast('y-select', 'trigger-select', value);
// 子组件监听
this.$on('trigger-select', (value) => {});
```

#### 5个很有用的找到任意组件的方法

```javascript
/**
 * 由一个组件，向上找到最近的指定组件
 * @param  {Object} context       上下文
 * @param  {String} componentName 需要找的指定组件的name
 * @return {Object}               返回找到组件的实例
 */
function findComponentUpward(context, componentName) {
    let parent = context.$parent;
    let name = context.$parent.$options.name;

    // 循环往上遍历
    while (parent && (!name || name !== componentName)) {
        parent = parent.$parent;
        if (parent) {
            name = parent.$options.name;
        }
    }

    return parent;
}

/**
 * 由一个组件，向上找到所有的指定组件，递归使用组件比较少用，一般不用该方法
 * @param  {Object} context       上下文
 * @param  {String} componentName 需要找的指定组件的name
 * @return {Array}                返回找到组件的实例集合
 */
function findComponentsUpward(context, componentName) {
    let parents = [];
    let parent = context.$parent;

    if (parent) {
        if (parent.$options.name === componentName) {
            parents.push(parent)
        }
        // 递归遍历
        return [
            ...parents,
            ...findComponentsUpward(parent, componentName)
        ];
    } else {
        return [];
    }
}

/**
 * 由一个组件，向下找到最近的指定组件，递归遍历子组件
 * @param  {Object} context       上下文
 * @param  {String} componentName 需要找的指定组件的name
 * @return {Object}               返回找到组件的实例
 */
function findComponentDownward(context, componentName) {
    let children = context.$children;
    let child = null;

    if (children.length > 0) {
        for (let item of children) {
            if (item.$options.name === componentName) {
                child = item;
                break;
            } else {
                // 跟Emitter不同，这个函数主要要返回，在第一次递归的时候必须赋值拿到后来递归的返回值
                child = findComponentDownward(item, componentName);
                if (child) break;
            }
        }
    }

    return child;
}

/**
 * 由一个组件，向下找到所有指定的组件，递归遍历子组件，这个比网上遍历所有父组件有用
 * @param  {Object} context       上下文
 * @param  {String} componentName 需要找的指定组件的name
 * @return {Array}                返回找到组件的实例集合
 */
function findComponentsDownward(context, componentName) {
    let ret = [];
    let children = context.$children;

    if (children.length > 0) {
        for (let item of children) {
            if (item.$options.name === componentName) {
                ret.push(item);
            }
            // 递归遍历
            ret = [
                ...ret,
                ...findComponentsDownward(item, componentName)
            ]
        }
        return ret;
    } else {
        return [];
    }
}

/**
 * 由一个组件，找到指定组件的兄弟组件
 * @param  {Object}  context        上下文
 * @param  {String}  componentName  需要找的指定组件的name
 * @param  {Boolean} exceptMe       是否除去组件本身
 * @return {Array}                  返回找到组件的实例集合
 */
function findBrothersComponents(context, componentName, exceptMe = true) {
    let parent = context.$parent;
    let children = parent.$children;

    let brothers = children.filter((child) => {
        return child.$options.name === componentName;
    });
    // 利用vue实例里的_uid属性的值是唯一的做筛选
    let index = brothers.findIndex((brother) => brother._uid === context._uid);
    if (exceptMe) {
        brothers.splice(index, 1);
    }
    return brothers;
}

export {
    findComponentUpward,
    findComponentsUpward,
    findComponentDownward,
    findComponentsDownward,
    findBrothersComponents
};
```

导入后，使用方法：
```javascript
findComponentUpward(this, 'y-checkbox-group');
```

#### 利用eventBus实现跨组件通信

首先建立一个js文件，导出一个vue实例：

```javascript
import Vue from 'vue';
export default new Vue();
```

实例方法里有$emit和$on方法，同一个实例中$emit出来的事件可以在$on里监听到，利用这个原理可以实现跨组件通信：

- 分别导入这个实例
- 需要传出方：`Bus.$emit('eventBus', 'eventBus');`
- 接收方：`Bus.$on('eventBus', (val) => {});`

#### import一个.vue文件，其实返回的就是export的那个对象，具体形式是这样的：

```javascript
{
    beforeCreate: [ƒ],
    beforeDestroy: [ƒ],
    data: ƒ data(),
    methods: {add: ƒ, remove: ƒ},
    render: ƒ ()
}
```

其中render函数是通过Webpack的vue-loader编译出来的

#### :is可以绑定一个组件对象，或可以是一个String，比如标签名或组件名

#### v-bind="{a:1, b:2}"可以绑定一个有属性的对象，然后props里使用

#### 递归组件的使用

递归组件就是指组件在模板中调用自己，开启递归组件的必要条件，就是在组件中设置一个 name 选项。

实现一个递归组件的必要条件是：
- 要给组件设置 name；
- 要有一个明确的结束条件

```html
<template>
    <div>
        <my-component :count="count + 1" v-if="count <= 5"></my-component>
    </div>
</template>

<script>
export default {
    name: 'my-component',
    props: {
        count: {
            type: Number,
            default: 1
        }
    }
}
</script>
```

#### vue 2.2.0以上，可以指定v-model的语法糖传入的指定值

子组件设置model：

```javascript
export default {
    ...,
    model: {
        prop: 'number',
        event: 'change'
    }
}
```

然后子组件在接受props和设置事件时写入自定义的属性：

```javascript
export default {
    ...,
    props: {
        number: {
            type: Number,
            default: 0
        }
    },
    methods: {
        handelChange(e) {
            this.emit('change', e.target.value);
        }
    }
}
```

父组件（v-model写法）：

```html
<input-number v-model="inputNumberVal" />
```

这样父子组件就完成了一次不是使用value/input的v-model语法糖

#### vue2.3.0+的.sync 修饰符

可以看做v-model使用的扩展版，可以绑定多个语法糖，本质还是在父组件上修改数据，并非在子组件

子组件里面的emit方式改变：

```javascript
export default {
    ...,
    props: {
        number: {
            type: Number,
            default: 0
        }
    },
    methods: {
        handelChange(e) {
            // 注意这里使用的emit格式
            this.emit('update:number', e.target.value);
        }
    }
}
```

父组件，绑定的属性后加上.sync：

```html
<sync-number :number.sync="syncNumberVal" />
```

看起来要比 v-model 的实现简单多，实现的效果是一样的。v-model 在一个组件中只能有一个，但 .sync 可以设置很多个，且有以下限制：

- 不能和表达式一起使用（如 `v-bind:title.sync="doc.title + '!'"` 是无效的）；
- 不能用在字面量对象上（如 `v-bind.sync="{ title: doc.title }"` 是无法正常工作的）。

#### $nextTick原理

[nextTick源码](https://github.com/vuejs/vue/blob/dev/src/core/util/next-tick.js)

由于vue是异步执行DOM更新的，nextTick的作用就是将回调推到异步队列去执行，确保DOM已经更新完毕。分别使用了三种执行异步队列的方法，优雅降级：

- 如果浏览器支持Promise，使用promise.then延迟调用
- MutationObserver是h5新加的一个功能，其功能是监听dom节点的变动，在所有dom变动完成后，执行回调函数
- 以上都不支持就使用setTimeout延迟器

现在2.6版本的走的全是microtasks，microtasks比macrotasks的优先级高很多，如果遇到nextTick后获取的DOM不符合预期，直接使用setTimeout延迟20毫秒，确保DOM更新即可
> We are reverting back to microtasks everywhere and will remove withMacroTask entirely in 2.6.

**macrotasks**:
- setTimeout
- setInterval
- setImmediate
- requestAnimationFrame
- I/O
- UI rendering

**microtasks**:
- process.nextTick
- Promises
- Object.observe
- MutationObserver

```javascript
setTimeout(() => {
    cb();
}, 20);
```

参考资料：
- https://juejin.im/post/5a1af88f5188254a701ec230
- https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/

#### vue数组更新及小技巧

可以更新数组视图的操作有：

- push
- pop
- shift
- unshift
- splice
- sort
- reverse

不可更新数组的操作有：

- 当利用索引直接设置一个项时，例如：`this.items[index] = value`
- 当修改数组的长度时，例如：`this.items.length = newLength`

利用索引修改一个项，并且可以更新视图的技巧是，先复制一个完全一样的，然后修改对应的索引。虽然修改一个索引不会更新，但修改整个指向数据就会更新：

```javascript
handler(val) {
    // 浅复制/深复制一个数组，这里为了方便使用浅复制
    const data = [...this.items];
    data[2] = val;
    this.items = data;
}
```

#### 使用了keep-alive后，在router-view里设定path属性可以加载多个参数不同，且使用同一个组件的路由

以上情况多在后台管理模式下常见，即多个标签切换，例如编辑，是根据params或query进行加载不同的详情，但由于使用的是同一个组件，在使用keep-alive后，会导致每次加载的都是已经缓存下来的组件，这时候如果在每个路由上都定义不同的path，即使是同一个组件，也会进行重新的加载

```html
<keep-alive :include="cachedViews">
    <router-view :key="$route.path" />
</keep-alive>
```

其中cachedViews是一个组件内名字的数组，只有匹配上，才会被keep-alive


#### vue-router编程式路由跳转问题

vue-router在使用this.$router.push的时候，需要注意path和params不能公用，path会覆盖params，但可以使用query。如果需要使用params进行跳转，需要使用name+params的组合进行跳转


#### 不要将this.$route传入某个地方

由于this.$route里的match属性存在循环引用的问题，假如每次路由跳转将整个this.$route传入vuex里进行管理，会造成内存泄露导致卡死的问题，需要重新建立一个完全独立的副本。注意由于循环引用，深复制是会失败的，建立副本直接每个值都赋值一遍就好，重要的也就是path，query，params，meta，fullPath这些


#### 在better-scroll里使用定位问题

在使用better-scroll，如果需要使用一些特殊定位，置顶等效果，不要将需要定位的元素写在第一个子元素或第一个子元素里，由于better-scroll实例化之后的滚动效果只对第一个子元素生效，写在第一个子元素里实例化后的transform会使所有定位失效

#### slot的使用（新旧两种方法）

注意。slot不仅能向父组件传递当前作用域的数据，还能传递方法

子组件v-slot：

```html
<template>
    <!-- 知识点：具名插槽，插槽传递props，传递methods -->
    <div class="v-slot">
        <slot name="namedSlot" :user="user">{{ user.lastName }}</slot>
        <slot name="button" :close="close"></slot>
        <slot :user="user"></slot>
    </div>
</template>

<script>
export default {
    data() {
        return {
            user: {
                lastName: 'Satellite'
            }
        }
    },
    methods: {
        close() {
            alert('close method from inner')
        }
    }
}
</script>
```

2.6.0以下引用方式：

```html
<v-slot>
    <!-- 老版无法使用解构 -->
    <template slot="namedSlot" slot-scope="slotProps">
    	<h1>{{ slotProps.user.lastName }}</h1>
    </template>
    <!-- slot不用template，直接写在上面也可以 -->
    <!-- slot可以传递函数 -->
    <button slot="button" slot-scope="methodsProps" @click="methodsProps.close">
        测试slot传过来的方法
    </button>
</v-slot>
```

2.6.0以上引用方式：

```html
<v-slot>
    <template v-slot:namedSlot="slotProps">
    	<h1>{{ slotProps.user.lastName }}</h1>
    </template>
    <!-- 使用解构 -->
    <template v-slot:namedSlot="{{ user }}">
    	<h1>{{ user.lastName }}</h1>
    </template>
    <!-- 使用缩写 -->
    <template #namedSlot="{{ user }}">
    	<h1>{{ user.lastName }}</h1>
    </template>
    <!-- 使用缩写的时候，default插槽需要写出来 -->
    <p #default="{{ user }}">user.lastName</p>
    <!-- slot不用template，直接写在上面也可以 -->
    <!-- slot可以传递函数 -->
    <button v-slot:button="methodsProps" @click="methodsProps.close">
        测试slot传过来的方法
    </button>
</v-slot>
```

####  使用全局指令开发点击波纹效果

其实本质上就是点击的时候在元素里加入一个元素，元素做放大动画，需要css3支持

waves.js：

```js
import './waves.scss';

const context = '@@wavesContext';

function handleClick(el, binding) {
    // binding.value，指令的绑定值，例如：v-my-directive="1 + 1" 中，绑定值为 2

    // 这样也可以将event传进来，神奇
    function handle(e) {
        const type = binding.value || 'hit'; // 可输入center或hit
        const opts = {
            ele: el, // 波纹作用元素
            color: 'rgba(0, 0, 0, 0.15)', // 波纹颜色
            type
        };

        const target = opts.ele;

        console.log(target, e);

        if (target) {
            target.style.position = 'relative';
            target.style.overflow = 'hidden';
            const rect = target.getBoundingClientRect();
            let ripple = target.querySelector('.waves-ripple');
            if (!ripple) {
                ripple = document.createElement('span');
                ripple.className = 'waves-ripple';
                ripple.style.width = ripple.style.height = Math.max(rect.width, rect.height) + 'px';
                target.appendChild(ripple);
            } else {
                ripple.className = 'waves-ripple';
            }

            switch (opts.type) {
                case 'center':
                    // 访问offsetHeight可以重绘重新触发动画
                    // 为了使蒙层置于中间，注意是使用定位
                    ripple.style.top = rect.height / 2 - ripple.offsetHeight / 2 + 'px';
                    ripple.style.left = rect.width / 2 - ripple.offsetWidth / 2 + 'px';
                    break;
                default:
                    ripple.style.top =
                        (e.pageY - rect.top - ripple.offsetHeight / 2 - document.documentElement.scrollTop ||
                            document.body.scrollTop) + 'px';
                    ripple.style.left =
                        (e.pageX - rect.left - ripple.offsetWidth / 2 - document.documentElement.scrollLeft ||
                            document.body.scrollLeft) + 'px';
            }

            ripple.style.backgroundColor = opts.color;
            ripple.className = 'waves-ripple z-active';
            return false;
        }
    }

    // 单例
    if (!el[context]) {
        el[context] = {
            removeHandle: handle
        }
    } else {
        el[context].removeHandle = handle
    }

    return handle;
}

export default {
    // 只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置。
    bind(el, binding) {
        el.addEventListener('click', handleClick(el, binding), false);
    },
    // 被绑定元素插入父节点时调用 (仅保证父节点存在，但不一定已被插入文档中)。
    inserted(el) {

    },
    /**
     * 所在组件的 VNode 更新时调用，但是可能发生在其子 VNode 更新之前。指令的值可能发生了改变，也可能没有。
     * 但是你可以通过比较更新前后的值来忽略不必要的模板更新 (详细的钩子函数参数见下)。
     */
    update(el, binding) {
        el.removeEventListener('click', el[context].removeHandle, false)
        el.addEventListener('click', handleClick(el, binding), false)
    },
    // 指令所在组件的 VNode 及其子 VNode 全部更新后调用
    componentUpdated() {

    },
    // 只调用一次，指令与元素解绑时调用。
    unbind(el) {
        el.removeEventListener('click', el[context].removeHandle, false);
        el[context] = null;
        delete el[context];
    }
}
```

main.js

```js
import waves from '@/directive/waves/waves.js';
Vue.directive('waves', waves);
```

使用：

```html
<div class="btn" v-waves>测试waves</div>
<div class="btn" v-waves="'center'">测试waves</div>
```


#### router初始化，回到new Router()的时候

由于前端有时需要做权限处理，这时候就需要做权限处理，使用动态路由的router.addRoutes()，动态添加路由。

有以下场景：new Router()的时候已经添加里基础的路由，也通过addRoutes添加了对应权限的路由。这时候角色退出登录，登入另一个角色，角色拥有其他权限，这时候就需要清除之前添加的路由，回到初始基础路由的时候再一次动态添加对应角色的路由

由于vue-router官方只有动态添加路由的api，没有提供删除动态路由的办法，有issue提供了以下方法：

初始创建的router实例，最终要返回的状态：

```js
const createRouter = () => new Router({
    routes: constantRoutes
})

const router = createRouter()
```

reset方法：

```js
// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
    const newRouter = createRouter()
    router.matcher = newRouter.matcher // reset router
}
```


#### ElementUI的table切换错乱解决方案

ElementUI存在一个问题，譬如进行两个table切换或动态渲染table列，会有渲染错乱的问题，有两个解决方案

1、在每个el-table-column上设置独一无二的key值，千万不要设置一个随机数值
2、每个column都使用scope渲染


#### 图片预览插件vue-photo-preview的实现

插件地址：https://github.com/826327700/vue-photo-preview

实现原理：本插件是使用photoSwipe这个插件进行二次开发，使用全局mixins，将设定特定属性的元素取出来，获取图片地址，再按photoSwipe的数据格式进行传入调用


#### 父子组件的渲染和监听顺序问题

vue组件的渲染顺序是由内而外的，父组件的created要先于子组件的mounted，所以需要在父组件的created定义监听子组件的函数，使用监听一般都是父子组件关联比较大的


#### 使用全局指令开发统一管理点击document

有些弹出额外框的组件，像日历选择，tooltip等，都会有一种需求，就是要求点击组件外的地方能够使组件收起来，而这个实现的原理其实就是在组件加载的时候，对document加入监听函数，然后在组件销毁的钩子里移除这个监听，避免组件移除后监听函数还存在，垃圾无法被回收而造成内存泄露。

可以想象如果每个组件都要这么写的话，每个判断点击的地方是否在组件外的逻辑都要重新写，是很麻烦的事，这时候就可以利用全局指令，哪里需要判断的，加上就可以

以下代码取自ElementUI，需要注意判断点击的地方是否在组件内的判断条件就可以，全局指令的应用参考vue官网即可

```javascript
import Vue from 'vue';
import { on } from '@/utils/dom';

const nodeList = [];
const ctx = '@@clickoutsideContext';

let startClick;
let seed = 0;

!Vue.prototype.$isServer && on(document, 'mousedown', e => (startClick = e));

!Vue.prototype.$isServer && on(document, 'mouseup', e => {
    nodeList.forEach(node => node[ctx].documentHandler(e, startClick));
});

function createDocumentHandler(el, binding, vnode) {
    return function(mouseup = {}, mousedown = {}) {
        if (!vnode ||
            !vnode.context ||
            !mouseup.target ||
            !mousedown.target ||
            el.contains(mouseup.target) ||
            el.contains(mousedown.target) ||
            el === mouseup.target ||
            (vnode.context.popperElm && (vnode.context.popperElm.contains(mouseup.target) ||
            vnode.context.popperElm.contains(mousedown.target)))) return;

        if (binding.expression &&
            el[ctx].methodName &&
            vnode.context[el[ctx].methodName]) {
            vnode.context[el[ctx].methodName]();
        } else {
            el[ctx].bindingFn && el[ctx].bindingFn();
        }
    };
}

/**
 * v-clickoutside
 * @desc 点击元素外面才会触发的事件
 * @example
 * <div v-clickoutside="handleClose">
 */
export default {
    bind(el, binding, vnode) {
        nodeList.push(el);
        const id = seed++;
        el[ctx] = {
            id,
            documentHandler: createDocumentHandler(el, binding, vnode),
            methodName: binding.expression,
            bindingFn: binding.value
        };
    },

    update(el, binding, vnode) {
        el[ctx].documentHandler = createDocumentHandler(el, binding, vnode);
        el[ctx].methodName = binding.expression;
        el[ctx].bindingFn = binding.value;
    },

    unbind(el) {
        let len = nodeList.length;

        for (let i = 0; i < len; i++) {
            if (nodeList[i][ctx].id === el[ctx].id) {
                nodeList.splice(i, 1);
                break;
            }
        }
        delete el[ctx];
    }
};
```

局部使用：
```javascript
directives: { Clickoutside },
<div v-clickoutside="handleClose">
```

注意，此指令可以对组件本身使用，也可以对元素本身使用


####

