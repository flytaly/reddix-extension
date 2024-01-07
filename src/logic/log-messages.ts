import { ref } from 'vue'

export type LogEntry = {
  id: number
  date: Date
  type?: 'info' | 'error'
  message: string
}

export let messages = ref<LogEntry[]>([{ id: 0, date: new Date(), message: 'Welcome!' }])

export function addMessage(message: string, type?: 'info' | 'error') {
  messages.value.push({ id: messages.value.at(-1)?.id || 0 + 1, date: new Date(), type, message })
  messages.value = messages.value.slice(-10)
}
