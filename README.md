# @cdxoo/switch-koa-composition

Switches nested middleware stacks based on context value indicated by
given json pointer.

```javascript
const switchComposition = require('@cdxoo/switch-koa-compose');

const middleware = switchComposition({
    by: '/json/pointer/to/value/in/context',
    branches: {
        'foo': [ barMiddleware, anotherBarMiddleware ],
        'bar': [ fooMiddleware, anotherFooMiddleware ],
    },

    // optional; will throw when omitted and no branch was found
    fallback: [ someFallbackMiddlware ]
});

// "by" can also be a function
const middleware = switchComposition({
    by: (context) => context.someFunctionMaybe(),
    /* ... */
});
```
