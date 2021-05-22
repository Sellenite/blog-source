---
title: Vue工作经验总结（1）
date: 2018-03-19 23:51:53
tags:
- Vue
---

> 本文主要记录工作时使用Vue时的问题或经验

#### 关于使用v-model传值给组件的语法糖

template:

```html
<currency-input v-model="price"></currentcy-input>
<!-- 上行代码是下行的语法糖
    <currency-input :value="price" @input="changeInput"></currency-input>
-->
```

```javascript
Vue.component('currency-input', {
    // 这里emit给父组件的input事件是由于v-model的语法糖所创立的
    template: `
        <span>
          <input ref="input" :value="value" @input="$emit('input', $event.target.value)">
        </span>
    `,
    props: ['value'], // v-model后在组件里使用props的value来相应
})

var demo = new Vue({
    el: '#demo',
    data: {
        price: 100,
    }
    /*methods: {
        changeInput(val) {
            this.price = val
        }
    }*/
})
```

这样使用v-model就可以不用像注释里一样，在组件emit一个自定义事件，在外面接住，这样写在里面修改，外面就能接收到传过来的value，并且将其改写，响应data

#### 事件修饰符.native的使用场景

关于加了native和不加的区别，使用以下代码说明：

定义自定义组件vButton：

```html
<button type="button" @click="clickHandler"></button>
```

```javascript
export default {
  name: 'vButton',
  methods: {
    clickHandler () {
      this.$emit('vclick') // 触发 `vclick` 事件
    }
  }
}
```

引用自定义组件vButton时事件的触发情况：

```html
<v-button @click="clickHandler" @vclick="vClickHandler">按钮</v-button>
```

```javascript
import vButton from '@/components/Button'
export default {
  components: { vButton },
  methods: {
    clickHandler () {
      alert('onclick') // 此处不会执行 因为组件中未定义 `click` 事件
    },
    vClickHandler () {
      alert('onvclick') // 触发 `vclick` 自定义事件
    }
  }
}
```

如果将上面模版改成：

```html
<v-button @click.native="clickHandler" @vclick="vClickHandler">按钮</v-button>
```

那么两个事件都会执行，`.native` 修饰符就是用来注册元素的原生事件而不是组件自定义事件的

意思就是当你给一个vue组件绑定事件时候，要加上`.native`，如果是普通的html元素就不需要。

#### 使用v-if、v-else-if、v-else处理显示

注意v-else-if和v-else前一兄弟元素必须有 v-if 或 v-else-if，v-else。链式调用可以更好的处理template显示逻辑

#### class条件判断绑定问题

`:class={ active: isActive }`的时候左边可以不加引号，也可以加上active这个class，右边是props或data或computed的数据

#### 在template使用引用静态文件（img等）

vue，webpack中，template中可以使用`~+alias`配置名称，js里可以使用import和require引用静态图片地址

#### 父子组件和非父子组件的传值问题

父子组件：使用@和$emit传值;\\
非父子组件：eventBus或vuex。

#### filter使用技巧

filter可以的到第二，第三，以此类推个参数，在使用filter的时候使用filterA(arg1, agr2, ...)传入，第一个参数就是值本身

#### vux如何通过v-model显示组件的问题

vux是通过v-model传入value作为props，然后value用v-if控制组件的显示与否

#### 对象watch问题

有三种方法，推荐第二、三种方法，可以拿到oldValue，直接检测对象是拿不到oldValue的：

<!-- more -->

```javascript
data() {
    return {
        obj: {
            num: 0
        }
    }
}
```

第一种：

```javascript
watch: {
    /* 监听某个对象属性的写法，必须使用handler和deep */
    numObj: {
        handler(nval, oval) {
            /* 注意：在变异 (不是替换) 对象或数组时，旧值将与新值相同，因为它们的引用指向同一个对象/数组。Vue 不会保留变异之前值的副本。 */
            console.log(nval.num === oval.num); // true
        },
        deep: true
    }
}
```

第二种：

```javascript
computed: {
    // 利用computed返回对象中的一个属性，改变改对象下的属性就能在watch里监听
    computedNum() {
        return this.numObj.num
    }
}

watch: {
    /* 这样监听对象里的属性就可以拿到newValue和oldValue */
    computedNum(nval, oval) {
        console.log(nval, oval);
    }
}
```

第三种（和第二种一样效果）：

```javascript
watch: {
    /* 效果与使用computed做中间层一样，有newValue和oldValue */
    'numObj.num': function(nval, oval) {
        console.log(nval, oval)
    }
}
```

#### 通过data检测数组的注意事项

由于 JavaScript 的限制，Vue 不能检测以下变动的数组：

-   当你利用索引直接设置一个项时，例如：vm.items[indexOfItem] = newValue
-   当你修改数组的长度时，例如：vm.items.length = newLength

举个例子：

```javascript
var vm = new Vue({
  data: {
    items: ['a', 'b', 'c']
  }
})
vm.items[1] = 'x' // 不是响应性的
vm.items.length = 2 // 不是响应性的
```

为了解决第一类问题，以下两种方式都可以实现和 `vm.items[indexOfItem] = newValue` 相同的效果，同时也将触发状态更新：

```javascript
// Vue.set
Vue.set(vm.items, indexOfItem, newValue)
// Array.prototype.splice
vm.items.splice(indexOfItem, 1, newValue)
```

你也可以使用 `vm.$set` 实例方法，该方法是全局方法 `Vue.set` 的一个别名（Vue文件里vm代表this）：

`vm.$set(vm.items, indexOfItem, newValue)`

为了解决第二类问题，你可以使用 splice：

`vm.items.splice(newLength)`

#### 通过data检测对象的注意事项

还是由于 JavaScript 的限制，Vue 不能检测对象属性的添加或删除：

```javascript
var vm = new Vue({
  data: {
    a: 1
  }
})
// `vm.a` 现在是响应式的

vm.b = 2
// `vm.b` 不是响应式的
```

对于已经创建的实例，Vue 不能动态添加根级别的响应式属性。但是，可以使用 `Vue.set(object, key, value)` 方法向嵌套对象添加响应式属性。例如，对于：

```javascript
var vm = new Vue({
  data: {
    userProfile: {
      name: 'Anika'
    }
  }
})
```

你可以添加一个新的 `age` 属性到嵌套的 `userProfile` 对象：

`Vue.set(vm.userProfile, 'age', 27)`

你还可以使用 `vm.$set` 实例方法，它只是全局 `Vue.set` 的别名：

`vm.$set(vm.userProfile, 'age', 27)`

有时你可能需要为已有对象赋予多个新属性，比如使用 `Object.assign()` 或 `_.extend()`。在这种情况下，你应该用两个对象的属性创建一个新的对象。所以，如果你想添加新的响应式属性，不要像这样：

```javascript
Object.assign(vm.userProfile, {
  age: 27,
  favoriteColor: 'Vue Green'
})
```

你应该这样做：

```javascript
vm.userProfile = Object.assign({}, vm.userProfile, {
  age: 27,
  favoriteColor: 'Vue Green'
})
```

#### template里关于data的渲染和methods的传值

1、template中可以使用this，或值直接不用都可以：

`{{account_No}}` 和 `{{this.account_No}}` 都能够访问到data或computed

2、在传入方法的时候，如果不传参，methods里默认有一个event对象；如果有传参，在template里通过`test('233', $event)`，在methods中接收第二个参数，就可以用到event了

#### 父元素使用v-model语法糖检测子元素传过来的值

使用v-model语法糖对封装好的input传值时（例如vux的x-input），或者是使用父子双向绑定的时候（$emit），如果要在父元素里使用watch检测值并且修改，需要在修改的最后一般使用$nextTick或者延时修改，不然会不生效：

子组件修改父组件传过来的值：

```html
<template>
    <div class="x-input">
        <input :value="value" @input="$emit('input', $event.target.value)">
    </div>
</template>

<script>
export default {
    name: 'xInput',
    props: {
        value: {
            type: String,
            default: 0
        }
    }
}
</script>
```

父元素检测值并进行二次赋值：

```html
<template>
        ...
    	<x-input v-model="test"></x-input>
</template>

<script>
export default {
	data() {
		return {
			test: '123'
		}
	},
	watch: {
		/* 双向绑定过滤非数字判断 */
		test(nval, oval) {
			let num = +nval;
			let type = Object.prototype.toString.call(num);
			if(!isNaN(num) && type === '[object Number]') {
				// 必须
				this.$nextTick(() => {
					this.test = nval
				})
			} else {
				this.$nextTick(() => {
					this.test = oval
				})
			}
		}
	}
}
</script>
```

以上步骤就可以对v-model传入的值进行过滤判断

#### .capture事件修饰符的用法

给元素添加一个监听器，当该元素发生冒泡时，先触发带有该修饰符的元素，若有多个修饰符，则由外而内触发，就是谁有该事件修饰符，就先触发谁


#### 使用事件event对象和传参时的使用

```javascript
@click="test('123', $event)" -> test(str, event) {event.stopPropagation()}

@click="test" -> test(event) {event.stopPropagation()}
```

#### vue在iOS9下，for..in遍历data里的数组会执行两遍

#### 子组件的emit事件，父组件在调用时可以额外传入参数

可以分两种方式，一种是子组件只emit一个参数；另一种是emit多个参数。

> 子组件只emit一个参数

子组件：
```javascript
this.$emit('on-change', value);
```

父组件：
```html
<component-a @on-change="handleChange($event, anotherVal)"><component-a>
```

```javascript
methods: {
    handleChange(val, anotherVal) {
        // val是子组件传过来的数值
        // anotherVal是父组件额外传入的数值
    }
}
```

> 子组件emit了多个参数

子组件：
```javascript
this.$emit('on-change', value1, value2, value3);
```

父组件：
```html
<component-a @on-change="handleChange(anotherVal, arguments)"><component-a>
```

```javascript
methods: {
    handleChange(anotherVal, [value1, value2, value3]) {
        // anotherVal是父组件额外传入的数值
        // [value1, value2, value3]就是子组件传过来参数的解构赋值
        // 注意父组件写的时候必须写入arguments
    }
}
```

参考issue：https://github.com/vuejs/vue/issues/5735

```
@change="(val) => { onDateChange(item, val); }"
```

#### 组件的props可以定义多个type

```javascript
props: {
    value: {
        type: [Boolean, String, Number]
    }
}
```

#### 可以使用this.$parent、this.$children访问父组件、子组件的实例

#### 可以使用this.$parent.$options访问实例的自定义属性，例如name等