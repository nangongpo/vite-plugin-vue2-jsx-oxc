import Vue from 'vue'
import App from './App.vue'
import { registerGlobalComponents } from './register-global-components'
import './style.css'

Vue.config.productionTip = false
registerGlobalComponents()

new Vue({
  render: h => h(App)
}).$mount('#app')
