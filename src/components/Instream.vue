<template>
  <footer class="instream">
    <h2 class="title">Rewarded Instream Ads:</h2>

    <iframe
        id="rewarded-instream-ad"
        :src="instreamAdUrl"
        frameborder="0"
        scrolling="no"
    ></iframe>
  </footer>
</template>

<script setup lang="ts">
import {ref} from "vue";

const instreamAdUrl = ref('');

</script>

<style scoped>
.instream {
  margin-top: 50px;
  padding: 20px;
  background-color: #f0f0f0;
  text-align: center;
}
</style>
