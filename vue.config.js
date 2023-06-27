const {defineConfig} = require('@vue/cli-service')
module.exports = defineConfig({
    transpileDependencies: true,
    devServer: {
        proxy: {  //配置跨域
            '/api': {
                target: 'http://39.106.39.86:8000/',
                // target: 'http://127.0.0.1:8888/',
                changOrigin: true,
                pathRewrite: {
                    '^/api': ''
                }
            },
        }
    }
})
