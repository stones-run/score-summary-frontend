import {createStore} from 'vuex'

const store = createStore({
    state() {
        return {
            scoreDataPath: localStorage.getItem("scoreDataPath")
        }
    },
    getters: {
        scoreDataPath: state => state.scoreDataPath,
    },
    mutations: {
        scoreDataPath(state, value) {
            state.scoreDataPath = value
            localStorage.setItem("scoreDataPath", value)
        }
    }
})

export default store
