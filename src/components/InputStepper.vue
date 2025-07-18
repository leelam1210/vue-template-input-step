<template>
  <div class="bg-[#181818] p-4 w-full max-w-xl mx-auto">
    <div class="flex flex-col gap-6">
      <!-- Unit Row -->
      <div class="flex items-center justify-between">
        <span class="w-24 font-inter text-xs font-normal leading-5 text-[#AAAAAA]">Unit</span>
        <div class="flex items-center h-[36px] w-[140px] rounded-[6px] bg-[#212121] p-0.5 gap-1">
          <button
            v-for="opt in props.unitOptions"
            :key="opt"
            :class="[
              'flex-1 h-full flex items-center justify-center rounded-[6px] font-inter text-xs font-normal leading-5 transition-colors duration-150',
              props.unit === opt
                ? 'bg-[#3a3a3a] text-white'
                : 'bg-transparent text-[#AAAAAA] hover:bg-[#3b3b3b] hover:text-white cursor-pointer'
            ]"
            @click="setUnit(opt)"
          >
            {{ opt }}
          </button>
        </div>
      </div>
      <!-- Value Row -->
      <div class="flex items-center justify-between">
        <span class="w-24 font-inter text-xs font-normal leading-5 text-[#AAAAAA]">Value</span>
        <div :class="['flex items-center h-[36px] w-[140px] rounded-[6px] justify-between', inputFocused ? 'outline outline-1 outline-blue-500' : '', inputHovered ? 'bg-[#323232]' : 'bg-[#212121]']">
          <div class="relative flex items-center h-full">
            <button
              :class="[
                'h-full w-[36px] flex items-center justify-center rounded-l-[6px] font-inter text-xs font-normal leading-none transition-colors duration-150',
                'text-gray-200 disabled:text-gray-600',
                'hover:bg-[#3b3b3b] hover:text-white',
                'text-[18px]',
                isMinusDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
              ]"
              :disabled="isMinusDisabled"
              @click="decrement"
              @mouseenter="hoverMinus = true"
              @mouseleave="hoverMinus = false"
            >
              -
            </button>
            <transition name="fade">
              <div v-if="isMinusDisabled && hoverMinus" class="absolute -top-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
                <div class="px-3 py-1 rounded-lg bg-[#323232] text-white text-xs whitespace-nowrap shadow-md">Value must greater than 0</div>
                <div class="w-2 h-2 bg-[#323232] rotate-45 mt-[-4px]"></div>
              </div>
            </transition>
          </div>
          <input
            v-model="displayValue"
            @input="onInput"
            @focus="onInputFocus"
            @blur="onInputBlur"
            @mouseenter="inputHovered = true"
            @mouseleave="inputHovered = false"
            @keydown.enter="onInputBlur"
            class="h-full w-[36px] flex items-center justify-center text-center bg-transparent outline-none border-none rounded-none font-inter text-xs font-normal leading-none text-white focus:outline-none focus:ring-0 transition-colors duration-150"
            :step="1"
            :min="minValue"
            :max="maxValue"
            inputmode="decimal"
            autocomplete="off"
            type="text"
            @keydown.up="increment"
            @keydown.down="decrement"
          />
          <div class="relative flex items-center h-full">
            <button
              :class="[
                'h-full w-[36px] flex items-center justify-center rounded-r-[6px] font-inter text-xs font-normal leading-none transition-colors duration-150',
                'text-gray-200 disabled:text-gray-600',
                'hover:bg-[#3b3b3b] hover:text-white',
                'text-[18px]',
                isPlusDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
              ]"
              :disabled="isPlusDisabled"
              @click="increment"
              @mouseenter="hoverPlus = true"
              @mouseleave="hoverPlus = false"
            >
              +
            </button>
            <transition name="fade">
              <div v-if="isPlusDisabled && hoverPlus" class="absolute -top-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
                <div class="px-3 py-1 rounded-lg bg-[#323232] text-white text-xs whitespace-nowrap shadow-md">Value must smaller than 100</div>
                <div class="w-2 h-2 bg-[#323232] rotate-45 mt-[-4px]"></div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const emit = defineEmits(['update:value', 'update:unit']);

const props = withDefaults(defineProps<{
  value: number,
  unit: string,
  unitOptions?: string[],
  min?: number,
  max?: number
}>(), {
  unitOptions: () => ['%', 'px'],
  min: 0
});

const displayValue = ref(props.value.toString());
const inputFocused = ref(false);
const inputHovered = ref(false);
const hoverMinus = ref(false);
const hoverPlus = ref(false);
const lastDecimalLength = ref(0);
const lastValidValueBeforeEdit = ref(props.value);

watch(() => props.value, (val) => {
  displayValue.value = Number(val).toString();
});
watch(() => props.unit, () => {
  displayValue.value = Number(props.value).toString();
});

const minValue = computed(() => props.min ?? 0);
const maxValue = computed(() => {
  if (typeof props.max === 'number') return props.max;
  if (props.unit === '%') return 100;
  return undefined;
});

const isMinusDisabled = computed(() => props.value <= minValue.value);
const isPlusDisabled = computed(() =>
  props.unit === '%' ? Number(props.value) >= 100 : (typeof maxValue.value === 'number' ? props.value >= maxValue.value : false)
);

const setUnit = (newUnit: string) => {
  if (props.unit === newUnit) return;
  let newValue = props.value;
  if (newUnit === '%' && newValue > 100) {
    newValue = 100
  }
  emit('update:unit', newUnit);
  emit('update:value', Number(newValue));
}

const onInput = (e: Event) => {
  let val = (e.target as HTMLInputElement).value;
  val = val.replace(/,/g, '.');
  displayValue.value = val;
}

const onInputFocus = () => {
  inputFocused.value = true;
  lastValidValueBeforeEdit.value = props.value;
}

const onInputBlur = () => {
  let val = displayValue.value;
  val = val.replace(/,/g, '.');
  // Get the first valid real number
  const match = val.match(/\d+(\.\d+)?/);
  let num = match ? parseFloat(match[0]) : minValue.value;
  if (isNaN(num)) num = minValue.value;
  let decimalLength = match && match[0].includes('.') ? match[0].split('.')[1].length : 0;
  // If input < 0, set to 0
  if (num < 0) num = 0;
  // If unit is % and input > 100, revert to valid value before input
  if (props.unit === '%' && num > 100) {
    num = lastValidValueBeforeEdit.value;
    decimalLength = lastDecimalLength.value;
  } else if (typeof maxValue.value === 'number' && num > maxValue.value) {
    num = maxValue.value;
  }
  emit('update:value', Number(num));
  lastDecimalLength.value = decimalLength;
  displayValue.value = decimalLength > 0 ? num.toFixed(decimalLength) : num.toString();
  inputFocused.value = false;
}

const increment = () => {
  let newValue = props.value;
  if (typeof maxValue.value === 'number') {
    if (props.value < maxValue.value) {
      newValue = Math.min(maxValue.value, props.value + 1);
    }
  } else {
    newValue = props.value + 1;
  }
  // If unit is % and after increase > 100, set to 100
  if (props.unit === '%' && newValue > 100) {
    newValue = 100;
  }
  emit('update:value', Number(newValue));
}

const decrement = () => {
  let newValue = props.value;
  if (props.value > minValue.value) {
    newValue = Math.max(minValue.value, props.value - 1);
  }
  emit('update:value', Number(newValue));
}
</script> 