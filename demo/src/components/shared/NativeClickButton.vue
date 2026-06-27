<template>
  <button class="button secondary" @click="$emit('activate')">
    <slot>组件按钮</slot>
  </button>
</template>

<script>
export default { name: 'NativeClickButton' }
</script>
