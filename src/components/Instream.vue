<template>
  <div id="video-ad-container" class="video_container" ref="adContainerElement">
    <video id="videoPlayer" width="100%" height="250" playsinline muted ref="videoElement"></video>
  </div>
</template>

<script setup lang="ts">
import {InstreamAd} from '../libs/google_ads.ts'
import {onMounted, type Ref, ref} from "vue";
import {config} from "../config.ts";

const adContainerElement: Ref<HTMLElement | null> = ref(null)
const videoElement: Ref<HTMLElement | null> = ref(null)

function init() {
  if (adContainerElement.value && videoElement.value) {
    const instream = new InstreamAd(
        adContainerElement.value,
        videoElement.value,
        config.ads.instream
    )

    instream.start()
  }
}

onMounted(init)
</script>

<style scoped>
.video_container {
  position: relative;
  width: 100%;
  height: 250px;
}
</style>
