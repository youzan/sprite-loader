# sprite-loader
## 介绍
sprite-loader是一款自动精灵图工具，帮你省去手动制作精灵图的麻烦。

## 安装
```
	npm install sprite-loader --save
```

## 配置
在webpack配置文件添加sprite-loader配置。

```
// for webpack 1
loaders: [
    {
        test: /\.css/,
        loader: 'style!css!sprite'
    },
    {
        test: /\.scss$/,
        loader: 'style!css!sprite!sass'
    }
]

// for webpack 2
rules: [
    {
        test: /\.css/,
        use: ['style-loader', 'css-loader', 'sprite-loader']
    },
    {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sprite-loader', 'sass-loader']
    }
]
```
## 使用
### 1.基本用法
请在样式文件添加sprite-loader-enable注释以启用合并，之后sprite-loader便会识别图片并生成精灵图。

```
/* sprite-loader-enable */
.flip_flops {
    width: 16px;
    height: 16px;
    background: url(./img/flip_flops@2x.png);
}
.tram {
    width: 50px;
    height: 50px;
    background: url(./img/tram@2x.png);
}
.pie {
    width: 100px;
    height: 100px;
    background: url(./img/pie@2x.png);
}
```

### 2.适配Retina屏
Retina屏适配非常简单，你只需将图片存为2倍大小，且命名为xxx@2x.png。sprite-loader将会自动生成1x图和media query。

### 3.禁用合并
sprite-loader会收集样式文件中所有的background,background-image属性的图片进行合并，但以下几种情况除外。

1. 设置了background-position，background-size的图片。

	```
	/* 忽略有background-position的图片 */
	.bg1{background: url(1.png) no-repeat -10px -10px;}
	/* 忽略有background-size的图片 */
	.bg2{background: url(2.png); background-size: 10px 10px;}
	```
2. url带#spriteignore参数的图片。

	```
	/* 忽略有#spriteignore的图片 */
	.bg3{background: url(3.png#spriteignore);}
	```

### 4.设置精灵图的输出路径
通过设置`outputPath`选项设置精灵图的输出路径。该选项可以是以`output.path`为根目录的绝对路径或者相对于`output.path`的相对路径。

设置的路径在内部会被转化为以`output.path`为根目录的绝对路径，同时在CSS中设置背景图的路径时，`output.publicPath`会被添加在路径的前面。

```javascript
const spriteLoader = {
  loader: 'sprite-loader',
  options: {
    outputPath: '/static/imgs/sprites/'
  }
}
```

为什么`outputPath`最终被解析为以`output.path`为根目录的绝对路径？

因为精灵图作为一种图片资源，部署时应该和其他图片位于同一个目录。

## 协议
MIT
