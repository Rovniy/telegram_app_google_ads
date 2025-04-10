<script setup lang="ts">
import GoogleAds from '../libs/google_ads.ts'
import {ref} from "vue";

const isShowing = ref(false)

function showInterstitialAd() {
  GoogleAds.interstitial.show()
  isShowing.value = true
}

function hideInterstitialAd() {
  GoogleAds.interstitial.hide()
  isShowing.value = false
}
</script>

<template>
  <button @click="showInterstitialAd">Show Interstitial Ads</button>

  <div class="ads_container" v-show="isShowing">
    <div id="gpt-interstitial-slot" />

    <button class="closer" @click="hideInterstitialAd">Close</button>
  </div>
</template>

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