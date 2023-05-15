const {defineConfig} = require('@vue/cli-service')
module.exports = defineConfig({
    transpileDependencies: true,
    devServer: {
        proxy: {  //配置跨域
            '/api': {
                target: 'http://127.0.0.1:8888/',
                changOrigin: true,
                pathRewrite: {
                    '^/api': ''
                }
            },
        }
    }
})
