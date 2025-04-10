<!-- src/components/AdModal.vue -->
<template>
  <div class="modal-overlay">
    <div class="modal-container" :style="modalStyles">
      <iframe :src="adUrl" frameborder="0" style="width:100%; height:100%;"></iframe>
      <button class="close-btn" @click="closeAd">Закрыть</button>
      <button v-if="adType === 'rewarded'" class="reward-btn" @click="completeReward">
        Завершить просмотр
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'AdModal',
  props: {
    adUrl: {
      type: String,
      required: true
    },
    adType: {
      type: String,
      required: true
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const modalStyles = computed(() => {
      if (props.adType === 'interstitial') {
        return { width: '300px', height: '250px' };
      } else if (props.adType === 'rewarded') {
        return { width: '320px', height: '480px' };
      }
      return {};
    });

    const closeAd = () => {
      emit('close', { rewarded: false });
    };

    const completeReward = () => {
      emit('close', { rewarded: true });
    };

    return { modalStyles, closeAd, completeReward };
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-container {
  position: relative;
  background: #fff;
  padding: 10px;
  border-radius: 8px;
}
.close-btn {
  position: absolute;
  top: 5px;
  right: 5px;
}
.reward-btn {
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
}
</style>
