---
title: 从4个方面重新梳理webpack
author: muyudou
date: '2023-10-30'
---

> 我们始终被外在的东西所折磨，但只要活在当下，专注此时此刻做的每一件事情，把它做到极致，则就是那滴蜜糖。抓住这一点，我们就不再焦虑。

# 背景

本文内容来自于小册[webpack5核心原理与应用实现](https://juejin.cn/book/7115598540721618944/), 总结一下对自己有帮助的点，这本小册总体写的不错，比较大的收获有：

1. 对webpack的配置文件的理解
2. js、css、图片 常用loader配置以及比较
3. webpack优化方案
4. webpack原理（后续单独总结）

写文章不易，写了几天，辛苦大家多多支持和指正~

# 一、重新理解webpack配置项

由于webpack的配置项众多，之前在脑海里都是一个一个的点，根本没有串起来，而且也记不住，但是换一种理解方法的话，就容易理解了。如果我们按照webpack的构建流程可以将配置项划分为两类来理解：

1. 流程类：主要是干预打包编译规则，直接影响打包结果。
2. 工具类：打包流程外，提供工程化的配置项。

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4b211c7ce4514c0e80f5895eecc27d63~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2190&h=807&s=316838&e=png&b=ffffff)

### 1. 流程类

根据webpack编译流程来看构建项，这样的话就明白为什么会有这个配置项了。所以先来回顾下webpack的构建流程：

**webpack编译流程**

+ **输入**：webpack从文件系统的读取入口
+ **模块递归处理**：读取分析entry模块，调用Loader转译Module内容，并转换为AST，找到模块依赖，递归处理依赖，直到所有模块都处理完毕。
+ **后处理**：所有模块处理完成后，根据Entry配置将模块封装进不同的Chunk对象，经过模块合并、注入运行时、产物优化，将模块按照chunk合并成最终产物，写入文件系统。

按照以上流程划分配置项有：

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/95212fd4440b4111bdb1e1601ab3c8c2~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1574&h=754&s=181241&e=png&b=ffffff)

总结起来：

1. webpack首先根据输入配置entry找到项目入口文件
2. 按照模块配置相关的内容（`module/resolve/externals`）配置的规则处理模块，包括对各种类型文件利用loader转换为js类型、依赖分析等。
3. 最后根据后处理相关的配置（`optimization/target`）合并模块资源、注入运行时依赖、优化产物等。

比较重要的点：
1. resolve：告诉webpack怎么去找模块，这一步是webpack常用的优化点（考点），
    + 可以通过设置resolve的`extensions`缩小文件后缀的遍历路径，
    + 或者resolve的`modules`设置import的路径，一般设置为当前目录下的node_modules
2. module：可以理解为loader配置，js、css、img等的loader配置
3. optimization：splitChunk的分包配置等在这里，属于chunk生成阶段使用的。

### 2. 工具类配置

用于解决某一工程类问题，可以划分为以下三类：

1. 开发效率类：watch、devtool、devServer
2. 性能优化类：cache、performance
3. 日志类：stats、infrastructureLogging

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c0411b15f94c496faec6d119c17cae9b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1522&h=646&s=173244&e=png&b=ffffff)

# 二、 js、css、img常用loader梳理

这块的话js比较熟悉，css插件不少，有时候记不住，需要梳理下，还有img的，也容易迷糊😓。

> 注意：loader执行顺序从右到左。

### 1. js loader

js的loader最常用就是babel-loader，ts的话是ts-loader或者，还有一般会加eslint插件，eslint插件一般会加扩展包。不多说了，直接脑图总结：

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9e0a19a34ca144b8875dccf247d6d8ac~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1088&h=786&s=178755&e=png&b=ffffff)

配置示例

```js
const path = require('path')
const ESLintPlugin = require('eslint-webpack-plugin')

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  devtool: false,
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['@babel/preset-typescript'] }
        }
      }
    ]
  },
  plugins: [new ESLintPlugin({ extensions: ['.js', '.ts'] })]
}

```

### 2. css

webpack不能处理css，所以需要借助css-loader插件将它转换为js格式使它可以处理。然后再通过style-loader或者mini-css-extract-plugin插入到页面中。

+ css-loader：将css翻译为module.exports = "${css}"的js代码
+ 插入页面，以下二选一：
    + style-loader创建一个style标签插入
    + mini-css-extract-plugin抽离成单独的css文件，通过link标签的方式插入到页面中

除去以上基础的，还有css预处理器以及post-css：

+ less-loader、sass-loader，预处理器定义了一套css之上的超集，如Ts与js的关系。
+ post-css：增强原生css的能力，没有定义一门新的语言，而是将css解析为ast结构，并传入postcss插件做处理，具体功能都由插件实现，就像babel和js。

脑图总结：

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6a17aa47353e42998c716780d8506fa5~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1592&h=848&s=238788&e=png&b=ffffff)

这里要注意的就是loader的顺序，实际处理顺序是从右到左，所以css的执行的流程:

> less-loader=> post-css=> css-loader => style-loader，

style-loader一定要在最后面css-loader后面，因为被解析为js后才能插入页面。

示例demo如下：

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          "style-loader", 
          {
            loader: "css-loader",            
            options: {
              importLoaders: 1
            }
          }, 
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                // 添加 autoprefixer 插件
                plugins: [require("autoprefixer")],
              },
            },
          },
          "less-loader"
        ],
      },
    ],
  }
};

```

### 3. 图片处理

这一块webpack4和5有区别了，因为相关的loader，webpack5基本内置了处理流程，等同于将img、文本等也升级为webpack的一等公民了。

图片分两部分，一部分是加载图片时使用的loader，一个是图片相关优化的loader。

##### 图片加载相关

| loader | 作用 |webpack5 |
| --- | --- |--- |
| file-loader | 图片引用转换为url并生成相应图片  |`type = "asset/resource"'`|
| url-loader | 对于小于阈值 `limit` 的图像直接转化为 base64 编码，大于阈值用file-loader转换，看起来是file-loader升级版  |`type = "asset/inline"`|
| raw-loader | 不做任何转移，只是简单将文件内容复制到产物中，适用于svg  |`type = "asset/source"`|

以上loader不仅可以处理图片，还可以加载任意类型的多媒体和文本文件。

##### 图片优化相关

| 优化方法 | loader | 说明 |
| --- | --- |--- |
| 图像压缩 | [image-webpack-loader](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Ftcoopman%2Fimage-webpack-loader "https://github.com/tcoopman/image-webpack-loader") 组件  |底层依赖于 [imagemin](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fimagemin%2Fimagemin "https://github.com/imagemin/imagemin") 及一系列的图像优化工具|
| 响应式图片 | [responsive-loader](https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fresponsive-loader "https://www.npmjs.com/package/responsive-loader") 等  |生成不同尺寸的图片|
| 雪碧图 | [webpack-spritesmith](https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fwebpack-spritesmith "https://www.npmjs.com/package/webpack-spritesmith") 插件 |目前使用场景减少，iconfont和base64图片处理了小图标相关的功能|

**脑图总结**

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3a80db6d9ff44db58763011efe5ef882~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1382&h=854&s=230452&e=png&b=ffffff)

**示例代码**

```js
  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      use: [{
        loader: 'babel-loader',
        options: {
          presets: [
            ['@babel/preset-env'],
            ['@babel/preset-react']
          ]
        }
      }]
    }, {
      test: /\.less$/i,
      use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
    }, {
      test: /\.svg$/i,
      use: ['svg-url-loader']
    }, {
      test: /\.(png|jpg)$/,
      type: "asset/resource",
      use: [{
        loader: 'image-webpack-loader',

        options: {
          disable: true,
          mozjpeg: {
            quality: 10
          },
        }
      }]
    }],
  }
```
# 三、webpack优化方案

我们通常遇到性能分析问题，都要按照以下三个步骤来走：

1. 度量
2. 分析卡点
3. 解决问题

### 性能度量工具

那有哪些性能度量工具呢？

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b53b33b7f43b4f57a871886d4e534371~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1498&h=896&s=272534&e=png&b=ffffff)

以上这些工具可以用于webpack打包结果分析。

### 为什么会慢

为什么webpack在大型项目中性能不佳？

+ 一方面是js的单线程架构，无法并行执行，不像rust、go是支持多线程的，这也就是esbuild为啥优于webpack，因为语言层面就区别挺大。
+ 另一方面从webpack的流程看，它要完成大量的文件读写、代码转译等操作。

### 性能优化方法

关于性能优化，有没有觉得如果不实际操作，直接看那些优化方法，在面试的时候总是容易忘?为了让自己梳理清楚，可以将webpack的常用优化方法分为两个方向：

| 方面 | 目的 | 方法 |
| --- | --- | --- |
| 优化构建速度 | 提升开发效率 | 1. 持久化缓存<br> 2. 并行构建<br> 3. 缩小编译范围<br> 4. 使用最新版本的webpack5、node|
| 优化运行时性能 | 提升网页运行时性能 | 1. 动态加载，减少首屏资源加载量<br> 2. 代码压缩<br> 3.tree-shaking、scope hoisting减少应用体积|


#### 一、构建速度优化

##### 1. 持久化缓存

这个就是空间换时间的思路了。因为webpack5自带了[持久化缓存](https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.js.org%2Fconfiguration%2Fcache%2F%23cache "https://webpack.js.org/configuration/cache/#cache")的功能，所以可以从webpack5和4区分来看。

+ webpack5的持久化缓存能够把首次构建结果保存到文件系统，下次构建就可以跳过解析、连接、编译，直接用上次编译好的对象。

+ webpack4可以借助插件实现类似的功能。例如[cache-loader](https://www.npmjs.com/package/cache-loader)、[hard-source-webpack-plugin](https://github.com/mzgoddard/hard-source-webpack-plugin)，这一点可以通过对vue-cli的内置的配置看出来，执行命令`vue inspect > output.js`或者`npx vue-cli-service inspect > output.js`来导出cli的默认配置，可以发现里面出现了2次cache-loader的影子。分别是在`vue-loader`和`babel-loader`前面，看吧，原来我们一直在使用cache-loader。

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/07cc8577986b40e584cdaeb91b1f0c39~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1702&h=936&s=175030&e=png&b=202020)
![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d4a99eb569f04be2a320cfb441120b3e~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1608&h=628&s=235959&e=png&b=202020)

脑图总结：

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/81094743a8ac4536837b6a9e3952e545~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1050&h=870&s=225146&e=png&b=ffffff)

##### 2. 并行构建

这一条是从单线程限制的方面优化，也是借助插件来实现。例如：

-   [HappyPack](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Famireh%2Fhappypack "https://github.com/amireh/happypack")：多进程方式运行资源加载(Loader)逻辑，webpack4可以使用；
-   [Thread-loader](https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.js.org%2Floaders%2Fthread-loader%2F "https://webpack.js.org/loaders/thread-loader/")：Webpack 官方出品，同样以多进程方式运行资源加载逻辑，推荐webpack5使用；
-   [Parallel-Webpack](https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fparallel-webpack "https://www.npmjs.com/package/parallel-webpack")：多进程方式运行多个 Webpack 构建实例；
-   [TerserWebpackPlugin](https://link.juejin.cn/?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fterser-webpack-plugin%23terseroptions "https://www.npmjs.com/package/terser-webpack-plugin#terseroptions")：支持多进程方式执行代码压缩、uglify 功能。

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9deb6c10979744739c48f7cc46631a36~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=764&h=418&s=97049&e=png&b=ffffff)

##### 3. 缩小编译范围

-   优化loader的执行范围
-   模块解析，配置 `resolve` 控制资源搜索范围；
-   针对 npm 包设置 `module.noParse` 跳过编译步骤；

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6419e60e34384e48b6d8ac7161473e19~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=864&h=488&s=95107&e=png&b=ffffff)

##### 4. 使用最新版本的webpack5、node

#### 二、运行时性能优化

##### 1. 动态加载，减少首屏资源加载量

[SplitChunksPlugin](https://link.juejin.cn/?target=https%3A%2F%2Fwebpack.docschina.org%2Fplugins%2Fsplit-chunks-plugin%2F "https://webpack.docschina.org/plugins/split-chunks-plugin/") 是 Webpack 4 之后内置实现的最新分包方案。常用分包方案

+ node_modules设置分组
+ 业务代码
    + 运行时代码单独抽离chunk
    + 设置common分组，通过minChunk设置使用多次的抽离为chunk
 
##### 2. 代码压缩

-   `terser-webpack-plugin`：用于压缩 JS 代码的插件；
-   `css-minimizer-webpack-plugin`：用于压缩 CSS 代码的插件；
-   `html-minifier-terser`：用于压缩 HTML 代码的插件。

插件都支持 `include/test/exclude` 配置项，用于控制压缩功能的应用范围；也都支持 `minify` 配置项，用于切换压缩器，借助这个配置我们可以使用性能更佳的工具，如 ESBuild 执行压缩。

##### 3. 利用tree-shaking、scope hoisting减少应用体积

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/72cb0680e9a447ac8f6e887cfd0e769a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1370&h=1190&s=262271&e=png&b=ffffff)


# 四、webpack5新特性

既然是webpack5，就把webpack5的升级点简单总结下吧。

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bc4b2fc90fde43e397f523babea8039f~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1502&h=808&s=214510&e=png&b=ffffff)

