---
title: table高度自适应方案
author: muyudou
date: '2023-10-30'
---

# 背景
这两天有个需求，本来系统是一个普通的b端系统，表格很多，现在希望可以实现一个需求是希望表格的pager组件可以固定在页面底部，表格内容区自适应，在一屏内显示所有内容，无论大小屏，放大缩小窗口也会自适应。

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b5f928aba94144449a58b9cc16bac942~tplv-k3u1fbpfcp-watermark.image?)

说一下我们的技术栈，vue2.7+公司内部组件库(基于elementui封装)+vuex+vuerouter四件套，而table用的是公司又封装了一层的组件库，暂且称之为customTable吧，所以customTable是在el-table的基础上做的，实现了配置化表单的功能。

# 开工

接到需求的我，说：“好的”（内心os：要啥自行车啊，一个后台系统能用就行，还要自适应😄），好吧，说归说，咱还是做吧，经过一点思考加一顿搜索得到了几种方案：

## 方案一  css样式

css媒体查询复写el-table样式，因为不管怎样，底层还是el-table，这样我要根据不同的屏幕大写写css样式，这个方案有点low，而且还有其他异常bug，就不说了，正经的应该用calc啊，行，咱先试试

```css
.el-table {
  // 屏幕高度减去除去表格区域以外的高度
  height: calc(100vh - 118px);
}
```

设置好后，表格高度是设置成功了，内容超过这个区域的表格滑动不了了==，看了下样式发现，内部的`el-table__body-wrapper`被动态设置了高度，似乎css设置的高度，不会触发它的计算，导致内容区域没有滚动。那我设置成可以滚动吧。
```css
.el-table {
  // 屏幕高度减去除去表格区域以外的高度
  height: calc(100vh - 118px);
  .el-table__body-wrapper {
      overflow-y: auto
  }
}
```
加上这个之后，可以滚动了，但是出现了其他诡异的问题，后面没有继续看了，而且css设置的问题是calc减去的内容高度无法动态计算，这样每个页面都需要写这个样式，没法实现写一次所有生效的效果，然后就准备换方案。

我又试了下纯`el-table`写的组件，按照以下css就实现了高度自适应，但同样每个都需要设置。

```css
.el-table {
  height: calc(100vh - 290px);
  overflow-y: auto;
}
```

## 方案二  js动态设置高度

**思路**：同样是设置表格的高度，表格高度计算公式= `window.innerHeight - 表格距离视口顶部的距离top（计算出来） - 底部pager的高度（固定）`，所以按照以上思路先写了一个简单的代码试验了一下，但在设置表格高度的方式上又遇到了问题，试了三种：

1. `$table.style.height = tableHeight`：无法设置成功
2. `$table.layout.setHeight(tableHeight);$table.doLayout()`：高度设置成功了，但是表格又滚动不了了，还是内部的body的高度不对，咱就是说对el-table的封装到底做了啥？不给源代码，烦死了，给了代码咱还能看下它到底搞了什么鬼。只想说开源万岁，真是想吐槽。
3. 修改表格配置文件的height值：生效了，那如果这个生效的话，我猜测是内部对height做了监听，然后设置了body的高度？

好，以上起码验证了方案是可行的，那这么多页面如何写一份代码都生效？因为直接用的封装的表格，内部没有再包装一层，所以没有公共的组件代码给我写一份代码都生效，那怎么办呢，想到的方案有2种：

1. useTableHeight：需要传入table ref，以及表格的配置文件option，并且在onMounted钩子函数中调用，传的参数有点多啊，不太好，侵入性太强
2. 自定义指令，这样每个table需要加上指令就好，这样要好一些，所以还是选定按照自定义指令的方式来实现。代码如下：


```js
const doResize = (el,binding,vnode) => {
    // 因为这是对el-table又封装了一层的table，所以不是我们最终要用的的el-table，所以要向下取一层，
    // 而且el也不了，需要从$table再取出来真正的el-table的dom
    const { componentInstance: $customTable } = vnode
    const $table = $customTable.refs.table;
    const { value } = binding
  
    if (!$table) {
      return;
    }
    const bottomOffset = (value && value.bottomOffset) || 30
    const $el = $table.$el; // 取出el-table的dom
    const tableHeight = window.innerHeight - $el.getBoundingClientRect().top - bottomOffset
    // 以下对纯el-table的表格是生效的，但我们这个不行
    // $table.layout.setHeight(height)
    // $table.doLayout()
    // 取出表格配置的options
    const options = $customTable.$data.options;
    options.height = tableHeight;
  }
  
 Vue.directive("table-adaptive", {
     bind(el, binding, vnode) {
      el.resizeListener = () => {
        doResize(el,binding,vnode)
      }
      window.addEventListener('resize', el.resizeListener)
    },
    update(el,binding,vnode){
      doResize(el,binding,vnode)
    },
    unbind(el) {
      window.removeEventListener('resize',el.resizeListener)
    }
  })
  
```

写完上面的发现一个问题，update会触发很多次，有点浪费，因此又加了debounce，当然在一个项目里一般不需要手写debounce，一般都有对应的代码，但咱还是手写一次, 最简单的。

```js
function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(args);
        }, delay);
    }
}
```
加上debounce后，主要是注册指令部分修改一下：

```js
 const debounceDoResize = debounce(doResize, 200);
 
 Vue.directive("table-adaptive", {
     bind(el, binding, vnode) {
      el.resizeListener = () => {
        debounceDoResize(el,binding,vnode)
      }
      window.addEventListener('resize', el.resizeListener)
    },
    update(el,binding,vnode){
      debounceDoResize(el,binding,vnode)
    },
    unbind(el) {
      window.removeEventListener('resize',el.resizeListener)
    }
  })
```
完成以上之后，觉得大功告成了。。。。然后

又去看了内部组件table的文档的height，写了xxx可以根据calcHeight来设置高度？？内心一堆问号，这写的啥意思，不清不楚，也没有任何demo，难道可以加calcHeight属性来动态设置表格？设置了一下，并不好使啊？？

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/da1e373cc6c24bf496071b53d3d1df23~tplv-k3u1fbpfcp-watermark.image?)

后来又去问对应的库开发人员，反复沟通了几个来回，才明白，原来height支持设置calc(100vh-118px)这种写法。合着直接配置出来就可以了？？那也挺简洁的，说明这个组件本身支持了这个功能，但demo么有写清楚。但是我想一下，也许他们认为这样写大家应该能看懂，也许是我太low了，没看懂文字。

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4751e01e7801453c945c70ea42ff7ede~tplv-k3u1fbpfcp-watermark.image?)

# el-table高度自适应

我又转念一想，`el-table`支持这种写法吗？然后去官网看了一下:

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/35ad288c3c904bad88512e587eaa3551~tplv-k3u1fbpfcp-watermark.image?)

说那意思好像支持，但也不没明说，那试一试吧，竟然也支持===，使用的版本是element-ui@2.13.2那这就挺方便了啊

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a113fad382ad4b44ad119c5bb2482d06~tplv-k3u1fbpfcp-watermark.image?)

然后看了下element-ui的table的源码：
https://github.com/ElemeFE/element/blob/dev/packages/table/src/table.vue#L607
https://github.com/ElemeFE/element/blob/dev/packages/table/src/table-layout.js#L60
https://github.com/ElemeFE/element/blob/dev/packages/table/src/util.js#L173

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1da64bf7b64e415eb6159fa8f469a89c~tplv-k3u1fbpfcp-watermark.image?)

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5541067369ec46e08da4ff68940b7777~tplv-k3u1fbpfcp-watermark.image?)

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ec66418bfe7f426db1cd28ff6f0bea57~tplv-k3u1fbpfcp-watermark.image?)

从源码看是支持的，好吧，原来是这么简单的事情，竟然绕了这么一大圈。。。。

然后又去查了下elementui的issue，搜出来一条
https://github.com/ElemeFE/element/issues/15806
https://github.com/ElemeFE/element/pull/16013/commits/1717fb15458699a4428eee229a217f4b3918396a

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/23c49f3a3bad46ddb2a9c94135553833~tplv-k3u1fbpfcp-watermark.image?)

看起来之前2.9.0还出过bug，2.9.1又修复了。

# 总结

经历了一圈，发现原来是那么简单的一件事情😒，所以其实如果单个表格，就直接设置height为`calc(100vh-xxx)`就好了, 最后我们也采用了这个方案。似乎指令方式并没有必要，但是怎么说呢，熟悉了指令的写法吧😄。

为什么一开始没有想到这种写法？直观原因是官网没写清楚，没有demo，然后网上一顿搜索就出现了js设置的方法以及css设置方法，自己又一顿摸索，好使了，但后来发现原来height直接设置也可以。

但背后的原因，暴露了几个问题：

1. css不够熟练
2. todo：自适应布局方案总结

且行且努力吧，继续加油💪🏻