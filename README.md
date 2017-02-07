# sprite-loader
## 介绍
精灵图（图片合并）是一种基本的前端优化手段。随着浏览器对svg支持得越来越好，icon font、svg sprite等技术也可以达到类似效果。相对于svg，精灵图还是有自己的适用场景和优势。

1. 不需要矢量源（一些较复杂的图，画成矢量是非常麻烦的）。
2. 兼容性非常好。
3. 当页面有大量的图标时，图片的性能好过svg。
4. 小图的图片比svg小。

手动制作精灵图繁琐且后期维护麻烦，这种重复性的工作当然最适合交给机器去做。目前社区有很多自动合并精灵图的工具，如：compass、sprity、postcss-sprites、ispriter等。但是在webpack生态里，还没找到一个比较满意的工具。它们大多需要全局指定一个目录进行合并，这不符合webpack模块化的哲学，且笼统的合并会将当前用不到的图片合并进来，反而增加了网络请求。在webpack里应该用loader来做这个事情，天生模块化并且好扩展，于是有了sprite-loader。

## 安装
```
	yarn add @youzan/sprite-loader
```

## 配置
在webpack loaders配置项添加@youzan/sprite-loader。

```
loaders: [
    {
        test: /\.css/,
        loader: 'style!@youzan/sprite-loader!css'
    },
    {
        test: /\.scss$/,
        loader: 'style!@youzan/sprite-loader!css!sass'
    }
]
```
## 使用
### 1.基本用法
首先需要在样式文件前加一行注释sprite-loader-enable启用自动合并。然后按照最原始的方法引用图片即可。如下：

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
sprite-loader会收集样式表中的图片进行合并，计算background-positon。编译后的样式如下：

```
.flip_flops,
.tram,
.pie {
  background: url(e277f090d7cacbdbeb37976d3b322582.png) no-repeat -9999px -9999px;
}
.flip_flops {
  width: 16px;
  height: 16px;
  background-position: -110px -74px;
}
.tram {
  width: 50px;
  height: 50px;
  background-position: 0 -110px;
}
.pie {
  width: 100px;
  height: 100px;
  background-position: 0 0;
}
@media only screen and (-webkit-min-device-pixel-ratio: 2),only screen and (min--moz-device-pixel-ratio: 2),only screen and (-o-min-device-pixel-ratio: 2/1),only screen and (min-device-pixel-ratio: 2),only screen and ( min-resolution: 192dpi),only screen and (min-resolution: 2dppx) {
  .flip_flops,
  .tram,
  .pie {
    background-image: url(c87a9917f393771e83dfaec907056c80.png);
    background-size: 174px 160px;
  }
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