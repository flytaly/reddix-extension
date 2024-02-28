export default function () {
  // only on dev mode
  if (import.meta.hot) {
    // @ts-expect-error for background HMR
    import('/@vite/client')
  }

  if (__DEV__) {
    void browser.runtime.openOptionsPage()
  }
}
