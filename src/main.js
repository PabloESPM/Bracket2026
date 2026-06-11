import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

try {
  const app = createApp(App)

  app.config.errorHandler = (err, instance, info) => {
    console.error('Vue Error:', err, info)
    const errDiv = document.createElement('div')
    errDiv.style.cssText = 'position: fixed; bottom: 0; left: 0; right: 0; background: purple; color: white; padding: 15px; z-index: 99999; font-family: monospace; font-size: 14px; word-break: break-all;'
    errDiv.innerHTML = `<strong>Vue Error:</strong> ${err.message}<br>Info: ${info}<br><pre>${err.stack || ''}</pre>`
    document.body.appendChild(errDiv)
  }

  app.mount('#app')
} catch (e) {
  console.error('Mount Exception:', e)
  const errDiv = document.createElement('div')
  errDiv.style.cssText = 'position: fixed; top: 160px; left: 0; right: 0; background: darkred; color: white; padding: 15px; z-index: 99999; font-family: monospace; font-size: 14px; word-break: break-all;'
  errDiv.innerHTML = `<strong>Mount Exception:</strong> ${e.message}<br><pre>${e.stack || ''}</pre>`
  document.body.appendChild(errDiv)
}
