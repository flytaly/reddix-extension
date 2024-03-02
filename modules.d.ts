declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $app: {
      context: string
      version: string
    }
  }
}

// https://stackoverflow.com/a/64189046/479957
export {}
