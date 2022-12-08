'use strict';
var compose = require('koa-compose');
var jsonpointer = require('jsonpointer');

var switchKoaComposition = (bag) => {
    var {
        by: pointer,
        branches = {},
        fallback,
    } = bag;

    if (!pointer || typeof pointer !== 'string') {
        throw new Error('property "by" must be a json pointer');
    }
    if (!pointer.startsWith('/')) {
        throw new Error('can not handle relative json pointers');
    }

    return async (context, next) => {
        var value = jsonpointer.get(context, pointer);
        var branch = branches[value] || fallback;
        if (!branch) {
            throw new Error(`no branch found for ${pointer} = "${value}"`);
        }
        await compose(branch)(context, next);
    }
}

module.exports = switchKoaComposition;
