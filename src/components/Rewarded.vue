<template>
  <button @click="showRewardedAd" :disabled="isDisabled">💵 Show Rewarded Ads</button>
</template>

<script setup lang="ts">
import {RewardedAd} from '../libs/google_ads.ts'
import {config} from "../config.ts";
import {ref} from "vue";

const isDisabled = ref(false)

const emit = defineEmits(['rewarded'])

const rewardedAd = new RewardedAd({
  id: config.ads.rewarded.id
})

function callback() {
  isDisabled.value = false
  emit('rewarded')
}

function fallback() {
  isDisabled.value = false
}

function showRewardedAd() {
  isDisabled.value = true

  rewardedAd.show(callback, fallback)
}
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
  }
}
</style>
