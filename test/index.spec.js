'use strict';
var { expect } = require('chai');
var compose = require('koa-compose');

var switchComposition = require('../src/');
var noop = async () => {};


var addFoo = (context, next) => { context.foo = 'FOO' };
var addBar = (context, next) => { context.bar = 'BAR' };
var addFallback = (context, next) => { context.fallback = 'FALLBACK' }

var defaultBag = {
    by: '/switchProp',
    branches: {
        'A': [ addFoo ],
        'B': [ addBar ]
    }
}


describe('index.js', () => {
    it('throws when no middleware stack is found', async () => {
        var composition = switchComposition(defaultBag);

        var context = { switchProp: 'INVALID' }
        await composition(context, noop).then(
            () => { throw new Error('error wasnt thrown') }
            (e) => { expect(e).to.be.an.instanceof(Error) }
        );
    });


    it('does the stuff', async () => {
        var composition = switchComposition(defaultBag);
        var context;

        context = { switchProp: 'foo' }
        await composition(context, noop);
        expect(context.foo).to.equal('FOO');
        expect(context.bar).to.not.exist;

        context = { switchProp: 'bar' }
        await composition(context, noop);
        expect(context.foo).to.not.exist;
        expect(context.bar).to.equal('BAR');
    });

    it('uses fallback when present and required', async () => {
        var composition = switchComposition({
            ...defaultBag,
            fallback: [ addFallback ]
        });
        
        var context = { switchProp: 'INVALID' }
        await composition(context, noop);
        expect(context.foo).to.not.exist;
        expect(context.bar).to.not.exist;
        expect(context.fallback).to.equal('FALLBACK');
    });

    it('calls next', async () => {
        var composition = switchComposition(defaultBag);
        var called = false;
        var next = () => { called = true };

        var context = {}
        await composition(context, next);

        expect(called).to.be.true;
    });

    it('plays nicely with koa-compose', async () => {
        var middleware = compose([
            switchComposition(defaultBag)
        ]);

        var context = { switchProp: 'foo' };
        await middleware(context);
        expect(context.foo).to.equal('FOO');
    });
})
