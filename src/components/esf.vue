<!-- InterstitialAd.vue -->
<template>
  <div>
    <!-- Контейнер для interstitial объявления -->
    <div id="gpt-interstitial-slot2"></div>
    <!-- Кнопка, по нажатию на которую показывается реклама -->
    <button @click="showInterstitial">Показать рекламу</button>
  </div>
</template>

<script>
export default {
  name: 'InterstitialAd',
  mounted() {
    // Инициализация GPT и определение interstitial-слота при монтировании компонента
    window.googletag = window.googletag || { cmd: [] };
    googletag.cmd.push(() => {
      // Определяем out-of-page слот для interstitial рекламы
      const interstitialSlot = googletag.defineOutOfPageSlot(
          '/1234567/telegram_app_interstitial',  // пример ID рекламного блока Ad Manager
          googletag.enums.OutOfPageFormat.INTERSTITIAL
      );
      if (interstitialSlot) {
        interstitialSlot.addService(googletag.pubads());
      }
      // Включаем одиночный запрос и сервисы показа
      googletag.pubads().enableSingleRequest();
      googletag.enableServices();

      // (Необязательно) Регистрируем событие для отслеживания закрытия рекламы
      googletag.pubads().addEventListener('slotVisibilityChanged', event => {
        if (event.slot === interstitialSlot && event.inViewPercentage === 0) {
          console.log('Interstitial ad closed');
          // Здесь можно выполнить действия после закрытия рекламы
        }
      });
    });
  },
  methods: {
    showInterstitial() {
      // Запрашиваем показ interstitial-рекламы по нажатию кнопки
      googletag.cmd.push(() => {
        googletag.display('gpt-interstitial-slot2');
      });
    }
  }
}
</script>
