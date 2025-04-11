<template>
  <div class="start_overlay">
    <h1 class="title">Rock, Paper, Scissors</h1>

    <button @click="play">▶️ Play</button>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits([ 'play' ])

const play = () => {
  emit('play')
}
</script>

<style scoped lang="scss">
.start_overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 50px;

  .title {
    font: 700 34px/42px Arial, Helvetica, sans-serif;
  }
}
</style>
