module.exports = {
    env: {
        cjs: {
            ignore: [ '**/*.spec.js' ],
            presets: [
                [ '@babel/preset-env', { modules: 'cjs' } ],
            ]
        }
    }
};
