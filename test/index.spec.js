'use strict';
var { expect } = require('chai');
var compose = require('koa-compose');

var switchComposition = require('../src/');
var noop = async () => {};


var addFoo = async (context, next) => {
    context.foo = 'FOO'; await next();
};
var addBar = async (context, next) => {
    context.bar = 'BAR'; await next();
};
var addFallback = async (context, next) => {
    context.fallback = 'FALLBACK'; await next();
}

var defaultBag = {
    by: '/switchProp',
    branches: {
        'foo': [ addFoo ],
        'bar': [ addBar ]
    }
}


describe('index.js', () => {
    it('throws when pointer is omitted', () => {
        var error;
        try {
            switchComposition({});
        } catch (e) { error = e }

        expect(error).to.be.an.instanceof(Error);
    });
    
    it('throws when pointer is non-string and non-function', () => {
        var error;
        try {
            switchComposition({ by: 1 });
        } catch (e) { error = e }

        expect(error).to.be.an.instanceof(Error);
    });
    
    it('throws when pointer is relative', () => {
        var error;
        try {
            switchComposition({ by: 'relative/pointer' });
        } catch (e) { error = e }

        expect(error).to.be.an.instanceof(Error);
    });

    it('throws when no middleware stack is found', async () => {
        var composition = switchComposition(defaultBag);

        var context = { switchProp: 'INVALID' }
        await composition(context, noop).then(
            () => { throw new Error('error wasnt thrown') },
            (e) => { expect(e).to.be.an.instanceof(Error) }
        );
    });


    it('does the stuff when switching by pointer', async () => {
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
    
    it('does the stuff when switching by lambda', async () => {
        var composition = switchComposition({
            ...defaultBag,
            by: (context) => context.switchProp
        });
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

        var context = { switchProp: 'foo' }
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

    it('can use factory to pass custom compose', async () => {
        var called = false;
        var next = () => { called = true };

        var customSwitchComposition = switchComposition.custom({
            compose: (middlewares) => async (context, next) => {
                called = true;
            }
        });

        var composition = customSwitchComposition(defaultBag);
        var context = { switchProp: 'foo' };
        await composition(context, next);
        
        expect(called).to.be.true;
    });
})
