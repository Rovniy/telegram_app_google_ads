<script setup lang="ts">
import GoogleAds from '../libs/google_ads.ts'

function rewardCallback() {
  console.log('rewardCallback');
}

function showRewardedAd() {
  GoogleAds.rewarded.show(rewardCallback)
}
</script>

<template>
  <button @click="showRewardedAd">Show Rewarded Ads</button>
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