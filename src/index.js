'use strict';
var koaCompose = require('koa-compose');
var jsonpointer = require('jsonpointer');

var switchKoaCompositionFactory = (options = {}) => {
    var { compose = koaCompose } = options;

    return (bag) => {
        var {
            by: pointerOrLambda,
            branches = {},
            fallback,
        } = bag;

        var lambda = undefined;
        if (!pointerOrLambda) {
            throw new Error('property "by" must be string or function');
        }
        else {
            switch (typeof pointerOrLambda) {
                case 'string':
                    var pointer = pointerOrLambda;
                    if (!pointer.startsWith('/')) {
                        throw new Error('can not handle relative json pointers');
                    }
                    lambda = (context) => jsonpointer.get(context, pointer);
                    break;
                case 'function':
                    lambda = pointerOrLambda;
                    break;
                default:
                    throw new Error('property "by" must be string or function');
            }
        }

        return async (context, next) => {
            var value = lambda(context);
            var branch = branches[value] || fallback;
            if (!branch) {
                throw new Error(`no branch found for "${pointerOrLambda}" = "${value}"`);
            }
            await compose(branch)(context, next);
        }
    }
}

var switchKoaComposition = switchKoaCompositionFactory();
switchKoaComposition.custom = switchKoaCompositionFactory;

module.exports = switchKoaComposition;
