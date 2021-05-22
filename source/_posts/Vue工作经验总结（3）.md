---
title: Vue工作经验总结（3）
date: 2019-08-26 22:18:15
tags:
    - Vue
---

### v-model语法糖时，可以使用watch进行数据初始化

之前一直都是使用created+watch进行里面数据的初始化，其实可以直接使用watch就可以了：

```javascript
value: {
    immediate: true,
    handler(val) {
        this.currentValue = val;
    }
}
```


### elementUI里的table，template里不要使用ref

elementUI里的table，template里不要使用ref，引用的结果会与预期有差距，暂时无法找出什么原因

<!-- more -->

### 使用v-model进行双向绑定时，oninput可以立即修改数据

其实v-model就是emit一个input事件的语法糖，根据这个我们可以通过监听input事件，在修改之前就将它拦截修改就可以了，不用根据watch这个绑定值然后再手动修改一次，因为这样会有一个闪烁的问题，直接拦截input事件就不会出现这个问题，具体实现：

```html
<components v-model="test" @input="value=value.replace(/[^\d]/g, '')"></components>
```

这样绑定的test值就是经过执行函数后的值


### fixed定位的浮动框，在滚动时依然能跟随屏幕移动

参考elementUI在处理pop组件，这些组件一般都是放在body下，然后使用fixed定位的，如果不进行处理，在进行滚动的时候会一直定在同一个地方，很奇怪。

参考popper.js 227行左右的监听滚动函数


### elementUI的table固定高度时，如何将里面滚动内容跳到顶部

可以看一下源码，里面存了dom

```javascript
this.$refs.table.bodyWrapper.scrollTop = 0
```


### 父元素和子元素的渲染时机和顺序

父子组件在加载的时候，执行的先后顺序为父beforeCreate->父created->父beforeMount->子beforeCreate->子created->子beforeMount->子mounted->父mounted


### UI组件二次封装时传值的问题

前端可能有这样的需求，使用第三方UI组件时，如ElementUI时，里面的钩子函数等不能满足业务需求，这时候就需要在外面再套一层。这时候由于里面有很多props，如果一个一个对应地去赋值，就会很烦，而且有可能会漏，以下是为了解决这个问题的

```html
<template>
  <el-select v-bind="$props" @change="changeEmit" @visible-change='visibleChangeEmit'>
    <el-option
      v-for="item in options"
      :key="item[propsAlias.value]"
      :label="item[propsAlias.label]"
      :value="item[propsAlias.label] + '·' + item[propsAlias.value]">
    </el-option>
  </el-select>
</template>

<script>
import { Select } from 'element-ui'
export default {
  name: 'em-select',
  props: {
    ...Select.props, // 这里继承原 UI 组件的 props
    // 配置
    options: {
      type: Array,
      default: () => [
        {
          value: '选项1',
          label: '黄金糕'
        },
        {
          value: '选项2',
          label: '双皮奶'
        }
      ]
    },
    // 数据项属性别名
    propsAlias: {
      type: Object,
      default: () => {
        return {
          value: 'value',
          label: 'label'
        }
      }
    }
  },
  data() {
    return {}
  },
  methods: {
    changeEmit(val){
      this.$emit('change', val);    // 选中值发生变化时触发
    },
    visibleChangeEmit(isVisible){
      this.$emit('visible-change', isVisible);  // 下拉框出现/隐藏时触发
    }
  }
}
</script>
```

这样就可以实现一次二次封装，在二次封装的组件里进行props的注册和传值。里面传什么，都会传到ElementUI的原组件里，注意$props的用法，官网给出的demo：

```html
<!-- 通过 $props 将父组件的 props 一起传给子组件 -->
<child-component v-bind="$props"></child-component>
```

bind也可以一次性绑定多个属性：

```html
<!-- 绑定一个有属性的对象 -->
<div v-bind="{ id: someProp, 'other-attr': otherProp }"></div>
```

如果不使用额外的prop传入，可以直接传入attrs和listeners，这样就可以传入不确定的属性和绑定函数

```html
<child-component v-bind="$attrs" v-on="$listeners"></child-component>
```

### 当ElementUI的form里面只有一个input元素，使用@keyup.enter.native会导致刷新页面的问题

由于ElementUI在定义组件的时候，遵循以下规则：

> 当一个 form 元素中只有一个输入框时，在该输入框中按下回车应提交该表单。如果希望阻止这一默认行为，可以在 `<el-form>` 标签上添加 `@submit.native.prevent`。

所以会出现第一次回车就会刷新页面，再次回车，才出发回车事件。

当一个 form 元素中只有一个输入框时，在该输入框中按下回车应提交该表单。如果希望阻止这一默认行为，可以在 标签上添加 @submit.native.prevent。

```html
<el-form @submit.native.prevent>
  <el-input v-model="inpulValue" @keyup.enter.native="searchKey"></el-input>
</el-form>
```

### ElementUI的table高度自适应问题

之前一直做了一件蠢事，为了解决ElementUI的table自适应问题，一直使用了resize事件，然后重新计算了当前剩余高度，然后赋值给table的height。其实不用这么干，只需要利用flex，在table加一个垂直方向的`flex: 1 0 auto`即可

### ElementUI的table二次封装，支持配置render定制化

这个技巧比较重要，利用了之前一直没用过的scopedSlots。由于ElementUI本来的table配置定制化全部是使用template来实现的。在这里完成的组件里，可以直接通过配置定制render，支持jsx和h()

table.vue

```html
<el-table :data="tableData" v-bind="tableConfig" v-on="tableEvent">
    <table-column v-for="(item, index) in columnConfigComputed" :key="index" :config="item" />
</el-table>
```

```javascript
watch: {
  columnConfig: {
    deep: true,
    immediate: true,
    handler(nVal, oVal) {
      // 对特殊的type进行改造，避免多次重复写代码
      this.columnConfigComputed = nVal.map((item, index) => {
        const SELECTION_WIDTH = 40; // 固定选择的宽度
        if (item.type === 'selection') {
          item.width = SELECTION_WIDTH;
        }
        // 官方没有单选的type，只有多选的type（selection），所以单选需要额外改造
        if (item.type === 'radio') {
          item.width = SELECTION_WIDTH;
          item.render = (scoped) => {
            return this.$createElement('el-checkbox', {
              props: {
                value: scoped.row.id === this.currentRow.id
              },
              nativeOn: {
                // 点击checkbox的时候，如果有定义点击行事件，会导致触发行事件，这里禁止冒泡
                click: (e) => {
                  if (this.currentRow.id) {
                    this.currentRow = {};
                  } else {
                    this.currentRow = _.cloneDeep(scoped.row);
                  }
                  e.stopImmediatePropagation();
                  e.preventDefault();
                }
              }
            })
          }
        }
        return item;
      });
    }
  }
}
```

table-column.vue

```javascript
<script>
export default {
  name: 'table-column',
  functional: true,
  props: {
    config: {
      type: Object,
      default: () => {}
    }
  },
  render: (h, context) => {
    return h('el-table-column', {
      props: context.props.config,
      scopedSlots: {
        default: context.props.config.render // 使用scopedSlots，这里会传入本来的props，在这里也就是scoped，可以通过scoped.row.xx拿到数据
      }
    })
  }
}
</script>
```

使用的时候，这样配置即可定制column的内容，就可以利用render属性，返回一个jsx，CLI3的本来配置就有支持jsx的transformer，可以直接使用，如果不是使用CLI3启动的项目，需要额外配置babel：

```html
<list-table :column-config="columnConfig" />
```

```javascript
export default {
  data() {
    return {
      columnConfig: [
        {
          type: 'radio' // 额外定义的type
        },
        {
          type: 'index'
        },
        {
          prop: 'date', // 支持本来的直接传入prop渲染数据的配置
          label: '日期'
        },
        {
          label: '姓名',
          render: (scoped) => {
            return <span style='color: red;'>{ scoped.row.name }</span>
          }
        }
      ]
    }
  }
}
```

### v-bind和v-on绑定一个对象，一次性将属性传入

v-bind和v-on绑定一个对象，二次封装时可以一下子将所有需要传入的属性传入，不用一个一个定义

```html
<el-table :data="tableData" v-bind="tableConfig" v-on="tableEvent">
    <table-column v-for="(item, index) in columnConfigComputed" :key="index" :config="item" />
</el-table>
```

### v-model后面可以加一个修饰符.trim，防止仅输入空格

具体的情况有：

element ui 中自带的表单必填项校验输入空格时，依然能逃过验证（required: true还是可以通过），

需要再在 v-model 加上 .trim 来禁止输入空格字符，加上之后则不能只输入空格。

### vue项目的env文件配置

在vue-cli3的项目中，
npm run serve时会把process.env.NODE_ENV设置为development；
npm run build 时会把process.env.NODE_ENV设置为production；

其实通过改变process.env.NODE_ENV值区分打包环境是有问题的，因为webpack打包时针对process.env.NODE_ENV===production和其他情况打出来的包结构和大小都不一样；

如果需要设置env文件，例如.env.sit，然后npm run sit
务必在文件里添加NODE_ENV=production，不然cli会以development模式打包，打出来的结构和大小都不一样

### 使用render的时候，绑定带有修饰符native的事件时，需要写在nativeOn的对象里

```javascript
return this.$createElement('el-checkbox', {
  props: {
    value: scoped.row.id === this.currentRow.id
  },
  nativeOn: {
    // 点击checkbox的时候，如果有定义点击行事件，会导致触发行事件，这里禁止冒泡
    click: (e) => {
      if (this.currentRow.id) {
        this.currentRow = {};
      } else {
        this.currentRow = _.cloneDeep(scoped.row);
      }
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  }
})
```

### el-radio,el-checkbox，关于ElementUI组件使用@click.native时，绑定的事件会触发2次的问题

解决方法：在click.native中执行e.preventDefault();
原因：原因是阻止了element组件里的radio里的label的默认事件，就不会触发两次了

### 如何使用computed的值去作为v-model的值

首先computed的原理：computed如果只写函数，只会在get这个属性的时候才会触发函数，然后return一个值。如果在任何情况都不获取这个值，这个函数是永远不会执行的

如果想使用computed的返回值作为v-model，要同时设定get()和set()

但一般不会这么写，一般会使用watch去监听这个属性，然后在里面对真正的值进行赋值

```javascript
computed: {
  currentValue: {
    get: function() {
      return this.value;
    },
    set: function(newValue) {
      this.$emit("input", newValue); // 通过 input 事件更新 model
    }
  }
}
```

### 如何使用fonts-size去控制svg的大小

svg本身添加css：

```scss
width: 1em;
height: 1em;
font-size: 23px;
```

这样才能够通过font-size控制大小

填充svg使用fill css，如果里面没有指定颜色的话就可以生效

### 关于项目发布后，第一次加载项目会白屏，清除缓存后才可以的问题

打包后，js的hash更改，仍然有缓存的原因是，服务器缓存了html文件，导致即使打包后，html引用的还是缓存里的文件，加载了不存在的js文件，导致白屏。解决方案：服务器里配置html文件永不缓存

### 使用axios(ajax)的post方式下载文件

```javascript
this.httpPost({
  url: '/download',
  responseType: 'blob', // important
  data: params,
  onSuccess: (res) => {
    const url = window.URL.createObjectURL(new Blob([res]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '自定义文件名');
    document.body.appendChild(link);
    link.click();
  }
});
```

### 路由对象不可进行深复制的问题

路由中的component属性必须保留render函数和name，才能正确地被keep-alive缓存下来，千万不要对路由本身进行深复制，会将函数给过滤掉

### 关于ElementUI的Form组件的多行list进行表单验证的方法

首先看Form组件系列的源码，原理是使用Form组件的model传入的对象，然后利用FormItem的prop进行属性的查找。属性值的查找ElementUI进行了一个函数封装，源码如下：

```javascript
export function getPropByPath(obj, path, strict) {
  let tempObj = obj;
  path = path.replace(/\[(\w+)\]/g, '.$1');
  path = path.replace(/^\./, '');

  let keyArr = path.split('.');
  let i = 0;
  for (let len = keyArr.length; i < len - 1; ++i) {
    if (!tempObj && !strict) break;
    let key = keyArr[i];
    if (key in tempObj) {
      tempObj = tempObj[key];
    } else {
      if (strict) {
        throw new Error('please transfer a valid prop path to form item!');
      }
      break;
    }
  }
  return {
    o: tempObj,
    k: keyArr[i],
    v: tempObj ? tempObj[keyArr[i]] : null
  };
};
```

其中传入的obj就是model的属性，path是传入的prop属性，使用查找到之后对本身进行赋值，一层一层地找下去，使得这一的写法也可以进行找到属性：

```javascript
// model => { list: [{ a: 1 }] }
// prop => "list.0.a"
```

注意，in操作符也能判断元素在不在这个数组里，和indexOf一样可以判断，但这里的in不仅能判断元素在不在数组，还能判断元素在不在对象，所以`lisy.0.a`能够查找成功

那么既然这样，在list进行遍历的时候，将index作为拼接传入prop，就能找到对应的属性，进行表单验证：

```html
<el-form class="form" ref="form" :model="form" :rules="rules" label-width="100px" style="width: 700px;">
  <el-row>
    <el-col>
      <el-form-item label="申请原因" prop="remark">
        <el-input type="textarea" :placeholder="inputPlaceHolder()" resize="none" :autosize="{ minRows: 5, maxRows: 5}" v-model="form.remark" :disabled="!editable"></el-input>
      </el-form-item>
    </el-col>
  </el-row>
  <!-- 列表的表单验证方法 -->
  <template v-for="(item, index) in form.purchaseItems">
    <el-row :key="`${index}-0`">
      <el-col>
        <el-form-item label="类别" :rules="rules.typeName" :prop="`purchaseItems.${index}.typeName`">
          <el-input v-model="item.typeName" :disabled="true"></el-input>
        </el-form-item>
      </el-col>
    </el-row>
  </template>
</el-form>
```

```javascript
data() {
  return {
    form: {
      remark: '',
      purchaseItems: []
    }
  }
}
```

小知识，传入的prop，与进行表单验证的时候，自定义规则validator，传入的函数，rule的参数，与rule.field是一样的，灵活利用这些属性，可以进行一些比较复杂的表单验证方法，看源码是比较直接的方法

如果有通过v-if进行显示el-form-item的，需要在el-form-item上加上key值，否则会出现一些奇怪的bug，例如表单校验不成功

小知识2，element-ui是利用prop属性找到值，vant则是利用传入value

```javascript
formValue: function formValue() {
  if (this.children && (this.$scopedSlots.input || this.$slots.input)) {
    return this.children.value;
  }

  return this.value;
}
```

### vuex带有命名空间的属性的取法

```javascript
computed: {
  // 重新进行命名
  ...mapGetters('user', {
    name: 'userName'
  }),
  ...mapGetters('user', ['userName'])
}
```

### vue-router获得完整路径的方法

使用router自带的resolve的方法，可以获得绝对地址

```javascript
let routeData = this.$router.resolve({ path: '/home', query: {  id: 1 } });
window.open(routeData.href, '_blank');
```

### 在vue里使用lodash的防抖功能

```javascript
methods: {
 remoteMethod: _.debounce(function(query) {
  // do something
  // 不要传入箭头函数
  // 这里可以使用this访问vue里面的属性，this指向vm
 }, 500),
}
```

注意，lodash的debounce的callback，最好用function，不要使用箭头函数，原因是他绑定了调用方法的那个this，在里面的this就是vm实例本身。传入
箭头函数后，箭头函数绑定this的优先度最高，这时候的this是指向全局，在严格模式时是undefined。所以传入箭头函数后，如果要访问vm实例本身，只能另外定义一个变量储存this，然后使用这个变量去访问实例的属性

### v-bind里也可以使用filter

```
:value="form.usesCarType | useCarTypeFilter"
```

### 关于vue-admin类的页面缓存方法

单页面admin有一种比较容易的方法，就是实际上就算维护了多级的路由，在addRoutes的时候弄成平级就可以了，这样不管是多少级路由，始终只有一个router-view，不是多级router-view了。只是要从后台进行一个路由树的配置，来渲染菜单栏，然后弄成平面的数组，放到addRouters里




