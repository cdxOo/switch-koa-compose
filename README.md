# @cdxoo/switch-koa-composition

```javascript
const switchComposition = require('switch-koa-compose');

const middleware = switchComposition({
    by: '/pointer/to/value/in/context',
    branches: {
        'foo': [ barMiddleware, anotherBarMiddleware ],
        'bar': [ fooMiddleware, anotherFooMiddleware ],
    },

    // optional; will throw when omitted and no branch was found
    fallback: [ someFallbackMiddlware ]
});
```
