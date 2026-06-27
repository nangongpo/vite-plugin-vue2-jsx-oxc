<template>
  <label class="field-row">
    <span>{{ label }}</span>
    <input
      class="control"
      :value="value"
      v-bind="$attrs"
      @input="$emit('input', $event.target.value)"
    >
  </label>
</template>

<script>
export default {
  name: 'ModelInput',
  inheritAttrs: false,
  props: {
    value: { type: String, default: '' },
    label: { type: String, default: '组件输入' }
  }
}
</script>
