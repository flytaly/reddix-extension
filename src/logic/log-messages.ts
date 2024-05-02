import { ref } from 'vue'

export interface LogEntry {
  id: number
  date: Date
  type?: 'info' | 'error'
  message: string
}

export const messages = ref<LogEntry[]>([])

export function addMessage(message: string, type?: 'info' | 'error') {
  messages.value.push({ id: messages.value.at(-1)?.id || 0 + 1, date: new Date(), type, message })
  messages.value = messages.value.slice(-50)
}
