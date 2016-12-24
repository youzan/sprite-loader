'use strict';
const css = require('css');
const _ = require('lodash');
const BG_URL_REG = /url\((.+\.png).*\)/;

const PixelRatio = {
    X1: 1,
    X2: 2
};

const RepeatType = {
    X: 'x',
    Y: 'y',
    NONE: 'none'
};

function grouping(rules) {
    let groups = [];
    rules.forEach(rule => {
        let bgImgDef = getBgImgDef(rule);
        if (bgImgDef && isNeedSprite(rule)) {
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
    return groups;
}

function getBgImgDef(rule) {
    let arr = rule.declarations.slice(0);
    while (arr.length) {
        let d = arr.pop();
        if (d.property == 'background' || d.property == 'background-image') {
            let match = BG_URL_REG.exec(d.value);
            if (match) {
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

function getBackgroundUrl() {

}

function is2x(url) {
    return url && url.endsWith('2x.png');
}

function getRepeatType(rule) {
    let arr = rule.declarations.slice(0);
    while (arr.length) {
        let d = arr.pop();
        if (d.property == 'background' || d.property == 'background-repeat') {
            let match = /repeat-(x|y)/.exec(d.value);
            if (match) return match[1];
        }
    }
    return RepeatType.NONE;
}

function doSprite(group) {
    let spriteMeta = createSpriteImage(group, group.type);
    group.rules.forEach(rule => {

    });
}

function createSpriteImage(images, repeatType) {

}

module.exports.getBgImgDef = getBgImgDef;
module.exports.getRepeatType = getRepeatType;
module.exports.grouping = grouping;

module.exports.loader = function (content) {
    this.cacheable();
    let ast = css.parse(content);
    let groups = grouping(ast.stylesheet.rules);
    let mediaQuery = groups.map(doSprite).filter(x => x);
};