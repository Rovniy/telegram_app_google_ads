<!-- src/App.vue -->
<template>
  <header class="header">
    <h1 class="title">Points: {{ points }}</h1>
  </header>

  <main class="main">
    <Interstitial/>
    <Rewarded/>
  </main>

  <!--    <Instream />-->
</template>

<script lang="ts" setup>
import Interstitial from "./components/Interstitial.vue"
import Rewarded from "./components/Rewarded.vue"
import {ref} from 'vue'
import Instream from './components/Instream.vue';

const points = ref(0)
</script>

<style scoped lang="scss">
.header {
  background-color: #3b9c61;
  padding: 10px;
  text-align: center;

  .title {
    margin: 0;
    font-size: 28px;
    line-height: 1;
    color: #fff;
  }
}

.main {
  margin: 50px auto;
  text-align: center;
}

button {
  padding: 15px 30px;
  margin: 20px;
  font-size: 16px;
  cursor: pointer;
}

iframe {
  width: 640px;
  height: 480px;
  max-width: 100%;
}
</style>
