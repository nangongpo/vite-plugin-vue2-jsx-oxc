<template>
  <section :id="id" class="demo-section">
    <header class="section-heading">
      <p class="section-index">{{ id }}</p>
      <div>
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
      </div>
    </header>
    <div class="demo-grid">
      <slot />
    </div>
  </section>
</template>

<script>
export default {
  name: 'DemoSection',
  props: {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' }
  }
}
</script>
