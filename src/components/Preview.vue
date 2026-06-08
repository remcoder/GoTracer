<template>
  <div class="preview">
    <canvas ref="previewCanvas" id="preview" width="200" height="200"></canvas>
  </div>
</template>

<script setup>
import { ref, unref, watch, onMounted } from 'vue';
import { Preview } from '../lib/preview.js';
import { DEFAULT_BOARD_SIZE, SUPPORTED_BOARD_SIZES } from '../lib/board-size.js';


const props = defineProps({
  stones: {
    type: Object,
    required: true
  },
  boardSize: {
    type: Number,
    default: DEFAULT_BOARD_SIZE,
    validator: (value) => typeof value === 'number' && SUPPORTED_BOARD_SIZES.includes(value)
  }
});

const previewCanvas = ref(null);
let preview;
onMounted(() => {
  // console.log('Preview component mounted');
  // console.log('Initial stones:', props.stones);
  preview = new Preview(previewCanvas.value, props.boardSize);
  preview.update(unref(props.stones));
  window['stones'] = props.stones; // Expose stones for debugging
});

// Watch for changes in stones and update the preview
watch([() => props.stones, () => props.boardSize], ([newStones, newBoardSize]) => {

  // console.log('Stones updated:', newStones);
  preview.setBoardSize(newBoardSize);
  preview.update(unref(newStones));
}, { deep: true });

</script>

<style scoped>
.preview {
  display: grid;
  place-items: center;
}
</style>
