<template>
  <StartOverlay @play="startPlay" v-if="!isPlaying" />

  <template v-else>
    <header class="header">
      <h1 class="title">Hello, {{ userName }}! Your score: {{ score }}</h1>
    </header>

    <main class="main">
      <Game @lose="playerLose" @win="addReward" />

      <Interstitial v-if="isLosing" @end="resumeGame" />

      <Rewarded @rewarded="addReward"/>
    </main>

    <Instream />
  </template>
</template>

<script lang="ts" setup>
import Game from "./components/Game.vue"
import StartOverlay from "./components/StartOverlay.vue"
import Interstitial from "./components/Interstitial.vue"
import Rewarded from "./components/Rewarded.vue"
import {onMounted, ref} from 'vue'
import Instream from './components/Instream.vue';

const score = ref(0)
const isPlaying = ref(false)
const isLosing = ref(false)
const userName = ref('Anonymous');

function startPlay() {
  isPlaying.value = true
}
function playerLose() {
  isLosing.value = true
}
function resumeGame() {
  isLosing.value = false
}
function addReward() {
  score.value++
}
function getUsername() {
  if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.expand();

    setTimeout(() => {
      if (window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
        userName.value = window.Telegram.WebApp.initDataUnsafe.user.username ||
            window.Telegram.WebApp.initDataUnsafe.user.first_name || 'Anonymous';
      }
    }, 2000)
  }
}

onMounted(getUsername)
</script>

<style scoped lang="scss">
.header {
  background-color: #3b9c61;
  border-radius: 8px;
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
</style>
