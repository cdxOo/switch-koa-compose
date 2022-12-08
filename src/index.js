'use strict';
var compose = require('koa-compose');
var jsonpointer = require('jsonpointer');

var switchComposition = (bag) => {
    var {
        by: pointer,
        branches = {},
        fallback,
    } = bag;

    return async (context, next) => {
        var value = jsonpointer.get(context, pointer);
        var branch = branches[value] || fallback;
        if (!branch) {
            throw new Error(`no branch found for ${pointer} = "${value}"`);
        }
        await compose(branch)(context, next);
    }
}

module.exports = switchKoaCompositon;
