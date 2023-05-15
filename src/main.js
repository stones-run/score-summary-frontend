import {createApp} from 'vue'
import store from "@/store";
import App from './App.vue'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import axios from 'axios'


const app = createApp(App)
const axiosPlugin = {
    install(app) {
        app.config.globalProperties.$axios = axios
    }
}
app.use(axiosPlugin)
app.use(store)
app.use(Antd).mount("#app");

