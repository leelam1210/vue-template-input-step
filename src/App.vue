<script lang="ts" setup>
import { ref } from 'vue';
import InputStepper from './components/InputStepper.vue';

const value = ref(0);
const unit = ref('%');
</script>

<template>
  <div
    class="w-screen h-screen bg-neutral-800 flex items-center justify-center text-neutral-100"
  >
    <div class="bg-neutral-950">
      <InputStepper
        v-model:value="value"
        v-model:unit="unit"
        :unitOptions="['%', 'px']"
        :min="0"
        :max="10000"
      />
    </div>
  </div>
</template>
