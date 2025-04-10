<!-- src/App.vue -->
<template>
  <div id="app">
    <header class="header">
      <h1 class="title">Points: {{ points }}</h1>
    </header>

    <main class="main">
      <button @click="showInterstitialAd">Show Interstitial Ads</button>
      <button @click="showRewardedAd">Show Rewarded Ads</button>

      <!-- Модальное окно для показа рекламы -->
      <AdModal
          v-if="modalVisible"
          :adUrl="currentAdUrl"
          :adType="currentAdType"
          @close="handleAdClose"
      />
    </main>

    <Instream />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import AdModal from './components/AdModal.vue';
import Instream from './components/Instream.vue';

export default defineComponent({
  name: 'App',
  components: { AdModal, Instream },
  setup() {
    // Константы для рекламных юнитов и начисления очков
    const AD_UNITS = {
      INTERSTITIAL: {
        tag: '/23211928466/ingame_interstitial_test',
        sizes: [
          [1, 1],
          [300, 250],
          [320, 480],
          [336, 280]
        ]
      },
      REWARDED: {
        tag: '/23211928466/ingame_rewarded_test',
        sizes: [1, 1]
      },
      REWARDED_INSTREAM:
          'https://pubads.g.doubleclick.net/gampad/ads?iu=/23211928466/ingame_video&description_url=https%3A%2F%2Fplaygama.com&sz=400x300%7C640x480&gdfp_req=1&unviewed_position_start=1&output=vast&env=vp&impl=s&correlator='
    };
    const POINTS_PER_REWARD = 150;

    const points = ref(0);
    const modalVisible = ref(false);
    const currentAdUrl = ref('');
    const currentAdType = ref('');
    const instreamAdUrl = ref('');

    const BASE_DFP_URL = 'https://pubads.g.doubleclick.net/gampad/ads';

    // Функция формирования URL рекламы с correlator
    function buildAdUrl(adUnitTag: string, sizes: any): string {
      let url = BASE_DFP_URL + '?iu=' + adUnitTag + '&gdfp_req=1&output=html&env=vp&impl=s&correlator=' + Date.now();
      let size;
      if (Array.isArray(sizes[0])) {
        size = sizes[0]; // выбираем первый размер, если это массив массивов
      } else {
        size = sizes;
      }
      url += '&sz=' + size[0] + 'x' + size[1];
      url += '&correlator=' + Date.now();
      return url;
    }

    // Функции для показа рекламы
    const showInterstitialAd = () => {
      currentAdUrl.value = buildAdUrl(AD_UNITS.INTERSTITIAL.tag, AD_UNITS.INTERSTITIAL.sizes);
      currentAdType.value = 'interstitial';
      modalVisible.value = true;
    };

    const showRewardedAd = () => {
      currentAdUrl.value = buildAdUrl(AD_UNITS.REWARDED.tag, AD_UNITS.REWARDED.sizes);
      currentAdType.value = 'rewarded';
      modalVisible.value = true;
    };

    // Обработка закрытия модального окна
    const handleAdClose = (payload: { rewarded: boolean }) => {
      modalVisible.value = false;
      if (payload.rewarded && currentAdType.value === 'rewarded') {
        points.value += POINTS_PER_REWARD;
      }
    };

    // Загрузка instream рекламы
    const loadInstreamAd = () => {
      instreamAdUrl.value = AD_UNITS.REWARDED_INSTREAM + Date.now();
    };

    onMounted(() => {
      loadInstreamAd();
    });

    return {
      points,
      modalVisible,
      currentAdUrl,
      currentAdType,
      instreamAdUrl,
      showInterstitialAd,
      showRewardedAd,
      handleAdClose
    };
  },
  mounted() {
    // const game = new Game();
    // console.log('game', game);
  }
});
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
