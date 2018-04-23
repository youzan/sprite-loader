'use strict';
const path = require('path');
const css = require('css');
const Spritesmith = require('spritesmith');
const _ = require('lodash');
const co = require('co');
const loaderUtils = require('loader-utils');
const fs = require('fs');
const jimp = require('jimp');
const BG_URL_REG = /url\((.+\.(png|jpg|jpeg|gif))(.*)\)/i;
const SPRITE_IGNORE = /#spriteignore/i;
const BG_REPEAT_REG = /repeat-(x|y)/;
const PADDING = 20;
const MEDIA2X = 'only screen and (-webkit-min-device-pixel-ratio: 2),'
    + 'only screen and (min--moz-device-pixel-ratio: 2),'
    + 'only screen and (-o-min-device-pixel-ratio: 2/1),'
    + 'only screen and (min-device-pixel-ratio: 2),'
    + 'only screen and ( min-resolution: 192dpi),'
    + 'only screen and (min-resolution: 2dppx)';

const PixelRatio = {
    X1: 1,
    X2: 2
};

const RepeatType = {
    X: 'repeat-x',
    Y: 'repeat-y',
    NONE: 'no-repeat'
};

function grouping(rules) {
    let groups = [];
    rules.forEach(rule => {
        let bgImgDef = getBgImgDef(rule);
        if (bgImgDef && !bgImgDef.url.startsWith('http') && isNeedSprite(rule)) {
            let groupType = {
                ratio: is2x(bgImgDef.url) ? PixelRatio.X2 : PixelRatio.X1,
                repeat: getRepeatType(rule)
            };
            let group = _.find(groups, groupType);
            if (group) {
                group.defs.push(bgImgDef);
            } else {
                groups.push(Object.assign({defs: [bgImgDef]}, groupType));
            }
        }
    });
    return groups.filter(g => g.defs.length);
}

function getBgImgDef(rule) {
    let arr = rule.declarations && rule.declarations.slice(0);
    while (arr && arr.length) {
        let d = arr.pop();
        if (d.property == 'background' || d.property == 'background-image') {
            let match = BG_URL_REG.exec(d.value);
            if (match && !SPRITE_IGNORE.test(match[3])) {
                return {
                    url: match[1].replace(/['"]/g, '').trim(),
                    declaration: d,
                    rule: rule
                };
            }
        }
    }
}

function isNeedSprite(rule) {
    return !_.find(rule.declarations, d => {
        return d.property == 'background-position' || d.property == 'background-size';
    })
}

function is2x(url) {
    return url && url.endsWith('2x.png');
}

function getRepeatType(rule) {
    let arr = rule.declarations.slice(0);
    while (arr.length) {
        let d = arr.pop();
        if (d.property == 'background' || d.property == 'background-repeat') {
            let match = BG_REPEAT_REG.exec(d.value);
            if (match) return 'repeat-' + match[1];
        }
    }
    return RepeatType.NONE;
}

function createSpriteImage(images, repeatType, query) {
    let padding = query.hasOwnProperty('padding') ? query.padding : PADDING;
    let algMap = {'repeat-x': 'top-down', 'repeat-y': 'left-right'};
    return new Promise(function (resolve, reject) {
        Spritesmith.run({
            src: images,
            algorithm: algMap[repeatType] || 'binary-tree',
            padding: padding
        }, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

function emitSprite(name, buffer) {
  const options = (loaderUtils.getOptions ? loaderUtils.getOptions(this) : loaderUtils.parseQuery(this.query)) || {};
  const outputPath = options.outputPath || '';
  const projectkOutputOptions = this._compiler.options.output;
  const projectPublicPath = projectkOutputOptions.publicPath;
  const nameTpl = name || '[hash].png';
  const url = loaderUtils.interpolateName(this, nameTpl, {content: buffer});
  const normalizedOutputPath = outputPath.replace(/^\.?\/?/, '');
  const theSpriteFilePath = `${normalizedOutputPath}/${url}`.replace(/\/\//g, '/');
  const theImageUrlInCSS = (projectPublicPath + normalizedOutputPath + url).replace(/\/\//g, '/');

  this.emitFile(theSpriteFilePath, buffer);

  return theImageUrlInCSS;
}

function toPx(num) {
    return !num ? 0 : num + 'px';
}

function safeCut(num) {
    return Math.ceil(num / 2);
}

function create1x(meta) {
    let properties = {
        width: safeCut(meta.properties.width),
        height: safeCut(meta.properties.height)
    };
    let coordinates = {};
    Object.keys(meta.coordinates)
        .forEach(key => {
            let coordinate = meta.coordinates[key];
            coordinates[key] = {
                x: safeCut(coordinate.x),
                y: safeCut(coordinate.y),
                width: safeCut(coordinate.width),
                height: safeCut(coordinate.height)
            };
        });
    return new Promise(function (resolve, reject) {
        jimp.read(meta.image, function (err, image) {
            if (err) {
                reject(err);
            } else {
                image.resize(properties.width, properties.height).getBuffer(jimp.MIME_PNG, function (err, buffer) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            image: buffer,
                            properties: properties,
                            coordinates: coordinates
                        });
                    }
                });
            }
        });
    });
}

function isNeedProcess(rules) {
    let confComment = _.find(rules, r => r.type == 'comment' && r.comment.indexOf('sprite-loader') > -1);
    if (confComment) {
        let value = confComment.comment.trim();
        return value == 'sprite-loader-enable';
    } else {
        return false;
    }
}

module.exports.getBgImgDef = getBgImgDef;
module.exports.getRepeatType = getRepeatType;
module.exports.grouping = grouping;
module.exports.createSpriteImage = createSpriteImage;

module.exports.loader = function (content) {
    this.cacheable();
    let loader = this;
    let callback = this.async();
    let query = (loaderUtils.getOptions ? loaderUtils.getOptions(this) : loaderUtils.parseQuery(this.query)) || {};
    let ast = css.parse(content);
    if (!isNeedProcess(ast.stylesheet.rules, query)) {
        callback(null, content);
        return;
    }
    let groups = grouping(ast.stylesheet.rules);
    let context = this.context;
    if (query.debug && groups.length) {
        console.log('sprite-loader:', this.resourcePath);
    }
    co(function* () {
        let extraRule = [];
        let mq2x = {rules: [], type: 'media', media: MEDIA2X};
        while (groups.length) {
            let group = groups.pop();
            let meta = yield createSpriteImage(group.defs.map(x => path.resolve(context, x.url)), group.repeat, query);
            let rule2x;
            if (group.ratio == PixelRatio.X2) {
                let meta2x = meta;
                meta = yield create1x(meta2x);
                let file2x = emitSprite.call(loader, query.name, meta2x.image);
                rule2x = {
                    type: 'rule',
                    declarations: [{
                        type: 'declaration',
                        property: 'background-image',
                        value: `url(${file2x})`
                    }, {
                        type: 'declaration',
                        property: 'background-size',
                        value: `${toPx(meta.properties.width)} ${toPx(meta.properties.height)}`
                    }]
                }
            }
            let coordinates = meta.coordinates;
            let file = emitSprite.call(loader, query.name, meta.image);
            let groupSelectors = [];
            group.defs.forEach(def => {
                let coordinate = coordinates[path.resolve(context, def.url)];
                if (coordinate) {
                    Array.prototype.push.apply(groupSelectors, def.rule.selectors);
                    if (def.declaration.property == 'background') {
                        let match = BG_REPEAT_REG.test(def.declaration.value);
                        if (match) {
                            def.rule.declarations.push({
                                property: 'background-repeat',
                                value: def.repeat
                            });
                        }
                    }
                    def.declaration.property = 'background-position';
                    def.declaration.value = `${toPx(-coordinate.x)} ${toPx(-coordinate.y)}`;
                }
            });
            if (rule2x) {
                rule2x.selectors = groupSelectors;
                mq2x.rules.push(rule2x);
            }
            extraRule.push({
                type: 'rule',
                selectors: groupSelectors,
                declarations: [{
                    type: 'declaration',
                    property: 'background',
                    value: `url(${file}) no-repeat -9999px -9999px`
                }]
            });
        }
        if (mq2x.rules.length) {
            ast.media = mq2x;
            ast.stylesheet.rules.push(mq2x);
        }
        ast.stylesheet.rules = extraRule.concat(ast.stylesheet.rules);
        return css.stringify(ast);
    })
        .then(cssText => callback(null, cssText))
        .catch(e => callback(e));
};
