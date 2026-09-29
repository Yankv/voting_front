import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

function getSocketUrl() {
  const configuredUrl = import.meta.env.VITE_WS_URL
  if (configuredUrl) return configuredUrl

  const apiUrl = new URL(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api')
  return `${apiUrl.origin}/ws`
}

export function createResultsConnection({ onMessage, onStatus, onError }) {
  const client = new Client({
    webSocketFactory: () => new SockJS(getSocketUrl()),
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      onStatus('connected')
      client.subscribe('/topic/resultados', (message) => {
        try {
          onMessage(JSON.parse(message.body))
        } catch (error) {
          onError(
            new Error('Se recibió una actualización de resultados no válida.', { cause: error }),
          )
        }
      })
    },
    onStompError: (frame) => {
      onError(
        new Error(frame.headers.message || 'Error en la conexión de resultados en tiempo real.'),
      )
    },
    onWebSocketClose: () => onStatus('reconnecting'),
    onWebSocketError: () => onStatus('reconnecting'),
  })

  return {
    activate() {
      onStatus('connecting')
      client.activate()
    },
    deactivate() {
      return client.deactivate()
    },
  }
}
