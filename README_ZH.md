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
	
## 协议
MIT