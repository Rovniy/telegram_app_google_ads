<template>
  <div class="ads_container" v-show="isShowing">
    <div :id="SLOT_ID"/>

    <button class="closer" @click="hideInterstitialAd" :disabled="buttonDisabled" v-text="buttonText"/>
  </div>
</template>

<script setup lang="ts">
import {InterstitialAd} from '../libs/google_ads.ts'
import {computed, onMounted, onUnmounted, ref} from "vue";
import {config} from "../config.ts";

const SLOT_ID = 'gpt-interstitial-slot'

const isShowing = ref(false)
const timeRemaining = ref(5)
const countdown = ref(0)

const emit = defineEmits(['end'])

const interstitial = new InterstitialAd(
    {
      id: config.ads.interstitial.id,
      sizes: config.ads.interstitial.sizes
    },
    SLOT_ID)

const buttonText = computed(() => {
  if (timeRemaining.value > 0) return `⌛ Close after ${timeRemaining.value} sec.`

  return '❌ Close'
})
const buttonDisabled = computed(() => timeRemaining.value > 0)

function startCountdown() {
  countdown.value = setInterval(() => {
    timeRemaining.value--
  }, 1000)
}
function showInterstitialAd() {
  interstitial.show()
  isShowing.value = true
}
function hideInterstitialAd() {
  interstitial.hide()
  isShowing.value = false
  emit('end')
}

onMounted(() => {
  showInterstitialAd()
  startCountdown()
})
onUnmounted(() => {
  hideInterstitialAd()
  clearInterval(countdown.value)
})
</script>

<style scoped lang="scss">
.ads_container {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  background: #1a1a1a;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .closer {
    position: absolute;
    left: 50%;
    bottom: 20px;
    transform: translateX(-50%);
    white-space: nowrap;
  }
}
</style>
