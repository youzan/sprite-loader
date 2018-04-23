<p>
<a href="https://github.com/youzan/"><img alt="有赞logo" width="36px" src="https://img.yzcdn.cn/public_files/2017/02/09/e84aa8cbbf7852688c86218c1f3bbf17.png" alt="youzan"></a>
</p>
<p align="center">sprite-loader</p>

## Introduction
[中文版](https://github.com/youzan/sprite-loader/blob/master/README_ZH.md)

sprite-loader is an image sprite generate tool.It helps you to resolve the troublesome of make sprite manually.

## Installation
```
npm install sprite-loader --save
```

## Configuration
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
## Usage
### 1.Basic Usage
First of all, add a comment in the first line of the file to enable sprite-loader.Then the loader will identify images and make sprites.

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
### 2.Adapt Retina Screen
It's very easy to adapt Retina screen. You just need to use double size images and name them as xxx@2x.png. sprite-loader will generate 1x images and media query automatically.

### 3.Disable Combination
sprite-loader will collect all the background and background-image attributes in css files to combine. Except for following circumstance:

1. Images that set the background-position and background-size.

	```
	/* ignore images that set background-position */
	.bg1{background: url(1.png) no-repeat -10px -10px;}
	/* ignore images that set background-size的 */
	.bg2{background: url(2.png); background-size: 10px 10px;}
	```
2. Image url that contain #spriteignore string.

	```
	/* ignore all images that contain #spriteignore */
	.bg3{background: url(3.png#spriteignore);}
	```
### 4.Set the output path of the sprite
You can set the output path of the sprite through configure the `outputPath` option, which can be an absolute path with `output.path` as the root or a relative path relative to the `output.path`.

The path setted will be transformed to an absolute path with `output.path` as the root, and the `output.publicPath` will be prepended when set the background image url in CSS.

```javascript
const spriteLoader = {
  loader: 'sprite-loader',
  options: {
    outputPath: '/static/imgs/sprites/'
  }
}
```

Why transform the path to an absolute path with `output.path` as the root?

Because sprite is one kind of image resource, it should be inside the image directory when deployed.

## Licence
MIT
