import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

try {
  const app = createApp(App)

  app.config.errorHandler = (err, instance, info) => {
    console.error('Vue Error:', err, info)
    if (import.meta.env.DEV) {
      const errDiv = document.createElement('div')
      errDiv.style.cssText = 'position: fixed; bottom: 0; left: 0; right: 0; background: purple; color: white; padding: 15px; z-index: 99999; font-family: monospace; font-size: 14px; word-break: break-all;'
      errDiv.textContent = `Vue Error: ${err.message} | Info: ${info}`
      document.body.appendChild(errDiv)
    }
  }

  app.mount('#app')
} catch (e) {
  console.error('Mount Exception:', e)
  if (import.meta.env.DEV) {
    const errDiv = document.createElement('div')
    errDiv.style.cssText = 'position: fixed; top: 160px; left: 0; right: 0; background: darkred; color: white; padding: 15px; z-index: 99999; font-family: monospace; font-size: 14px; word-break: break-all;'
    errDiv.textContent = `Mount Exception: ${e.message}`
    document.body.appendChild(errDiv)
  }
}
