<template>
  <div class="preview">
    <div id="preview-background"></div>
    <canvas ref="previewCanvas" id="preview" width="200" height="200"></canvas>
  </div>
</template>

<script setup>
import { ref, unref, watch, onMounted } from 'vue';
import { Preview } from './js/preview.js';


const props = defineProps({
  stones: {
    type: Object,
    required: true
  }
});

const previewCanvas = ref(null);
let preview;
onMounted(() => {
  // console.log('Preview component mounted');
  // console.log('Initial stones:', props.stones);
  preview = new Preview(previewCanvas.value);
  preview.update(unref(props.stones));
  window['stones'] = props.stones; // Expose stones for debugging
});

// Watch for changes in stones and update the preview
watch(() => props.stones, (newStones) => {

  // console.log('Stones updated:', newStones);
  preview.update(unref(newStones));
}, { deep: true });

</script>

<style scoped>
.preview {
  border: 1px solid #ccc;
}
</style>