import {createStore} from 'vuex'

const store = createStore({
    state() {
        return {
            exam: [],
            isLogin: sessionStorage.getItem("isLogin")
        }
    },
    getters: {
        exam: state => state.exam,
        isLogin: state => state.isLogin,
    },
    mutations: {
        exam(state, value) {
            state.exam = value
        },
        isLogin(state, value) {
            state.isLogin = value
            sessionStorage.setItem("isLogin", value)
        }
    }
})

export default store
