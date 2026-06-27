import Vue from 'vue'

export function registerGlobalComponents(): void {
  Vue.component('global-badge', {
    functional: true,
    props: {
      text: {
        type: String,
        default: ''
      }
    },
    render(h, context) {
      return h('span', { class: 'badge badge-global' }, context.props.text)
    }
  })
}
