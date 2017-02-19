# sprite-loader
## Introduction
[中文文档](https://github.com/youzan/sprite-loader/blob/master/README_ZH.md)

Image sprite is a basic optimization approach for web developer. By the help of modern browser, svg is widely well supported now. Although icon font and svg sprite have similar outcome, sprite sheet has its own distinguish advantage. Such as:

1. Don't need vector graph. (for complicate graphic, drawing vector graph is quite difficult)
2. Good compatibility.
3. Good performance, especially when there are massive amount of images
4. Smaller size for small image comparing to sag.

It’s very tedious to generate sprite sheet manually, and hard to update too. This kind of work is well fit for computer programs. There are quite many tools for generating sprite sheet in community, like compass, sprite, posts-sprites and ispriter. But none of them is perfect match with webpack. Most of them need to specify a directory to generate the sprite sheet, which violate the modular concept of webpack. Additionally, images that might never be used would be included too if just simply specify a working directory, which needs more bandwidth to download the sprite sheet.  In webpack, loader is suitable for this kind of work. Loader is modular processing by nature and very easy to extend. That’s why we create sprite-loader.

## Installation
```
	npm install sprite-loader --save
```

## Configuration
Add sprite-loader configuration in webpack loaders.

```
loaders: [
    {
        test: /\.css/,
        loader: 'style!sprite!css'
    },
    {
        test: /\.scss$/,
        loader: 'style!sprite!css!sass'
    }
]
```
## Usage
### 1.Basic Usage
First of all, add a comment in the first line of css file to enable auto combination, sprite-loader-enable. Then use the traditional way to introduce image.

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
Sprite-loader will collect the images in css files to combine and caculate backgroud position. The css after compilation is as follow:

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
	
## Licence
MIT
