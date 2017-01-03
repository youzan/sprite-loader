'use strict';
const css = require('css');
const assert = require('assert');
const path = require('path');
const loader = require('../lib/loader');

describe('sprite-loader', function () {
    it('should getBgImgDef', function () {
        let def1 = loader.getBgImgDef({declarations: [{property: 'background', value: 'url(../test.png)'}]});
        let def2 = loader.getBgImgDef({declarations: [{property: 'background-image', value: 'url("../test.png")'}]});
        let def3 = loader.getBgImgDef({
            declarations: [{
                property: 'background',
                value: 'url( ../test.png) no-repeat top left'
            }]
        });
        assert.equal(def1.url, '../test.png');
        assert.equal(def2.url, '../test.png');
        assert.equal(def3.url, '../test.png');
    });

    it('should getRepeatType', function () {
        let val1 = loader.getRepeatType({
            declarations: [{
                property: 'background',
                value: 'url(../test.png) repeat-x top left'
            }]
        });
        let val2 = loader.getRepeatType({
            declarations: [{
                property: 'background-repeat',
                value: 'repeat-y'
            }]
        });
        assert.equal(val1, 'repeat-x');
        assert.equal(val2, 'repeat-y');
    });

    it('should group', function () {
        let cssText = '.class1 {background: url(http://a.cdn.cn/pic1.png) repeat-x;}\
                    .class2 {background: url(http://a.cdn.cn/pic2.png) repeat-x;}\
                    .class3 {background-image: url(http://a.cdn.cn/pic3@2x.png);}\
                    .class4 {background: url(http://a.cdn.cn/pic4@2x.png);}\
                    .class5 {background: url(http://a.cdn.cn/pic5@2x.png); background-position: top left}';
        let ast = css.parse(cssText);
        let groups = loader.grouping(ast.stylesheet.rules);
        assert.equal(groups.length, 2);
        assert.equal(groups[0].repeat, 'repeat-x');
        assert.equal(groups[0].defs.length, 2);
        assert.equal(groups[1].ratio, 2);
        assert.equal(groups[1].defs.length, 2);
    });

    it('should createSpriteImage', function (done) {
        loader.createSpriteImage(['christmas_gift.png', 'christmas_mitten.png',
                'cookies.png', 'pie.png'].map(join))
            .then(meta => {
                assert(meta.coordinates);
                done();
            })
            .catch(e => done(e));

        function join(name) {
            return path.join(__dirname, 'createSprite', name)
        }
    });
});