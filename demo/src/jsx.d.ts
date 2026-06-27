import 'vue/types/jsx'

declare module 'vue/types/jsx' {
  interface HTMLAttributes {
    vFocus?: unknown
    vColor?: unknown
    vShow?: unknown
    'vColor:background_bold'?: unknown
  }
}
