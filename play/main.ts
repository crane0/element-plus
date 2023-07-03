import { createApp } from 'vue'
import '@element-plus/theme-chalk/src/dark/css-vars.scss'
;(async () => {
  /* 
    https://cn.vitejs.dev/guide/migration-from-v2.html#importmetaglob
    通过 vite 的语法获取组件后，实现自动化注册。
    apps 是一个 modules 组件对象，key 是路径，value 是一个函数（动态引入组件）。
    { 
      './src/App.vue': () => import("/src/App.vue")
    }
  */
  const apps = import.meta.glob('./src/*.vue')
  const name = location.pathname.replace(/^\//, '') || 'App'
  const file = apps[`./src/${name}.vue`]
  if (!file) {
    location.pathname = 'App'
    return
  }
  const App = (await file()).default
  const app = createApp(App)

  app.mount('#play')
})()
