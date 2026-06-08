<script setup>
import Preview from './Preview.vue';
import { GoTracer } from '../lib/gotracer.js';
import { DEFAULT_BOARD_SIZE, SUPPORTED_BOARD_SIZES } from '../lib/board-size.js';
import ColorPlot from './ColorPlot.vue';
import { onMounted, ref } from 'vue';
let goTracer;
const imageCanvas = ref(null);
const isReady = ref(false);
const scanError = ref('');

const props = defineProps({
  imageUrl: {
    type: String,
    required: true
  },
  boardSize: {
    type: Number,
    default: DEFAULT_BOARD_SIZE,
    validator: (value) => typeof value === 'number' && SUPPORTED_BOARD_SIZES.includes(value)
  }
});

const emit = defineEmits(['back']);


const stones = ref ({
  blackSet: {
    points: [],
  },
  whiteSet: {
    points: [],
  },
  boardSet: {
    points: [],
  },
});

onMounted(() => {
  goTracer = new GoTracer(props.imageUrl, imageCanvas.value, undefined, props.boardSize);
  goTracer.onScanStart(() => {
    isReady.value = false;
    scanError.value = '';
  });
  goTracer.onScan((data) => {
    stones.value.blackSet = data.blackSet;
    stones.value.whiteSet = data.whiteSet;
    stones.value.boardSet = data.boardSet;
    isReady.value = true;
  });
  goTracer.onError((error) => {
    isReady.value = false;
    scanError.value = error.message || 'The board scan failed.';
  });
});

const handleMove = (event) => {
  if (goTracer) {
    goTracer.handleMove(event);
  }
};
const handleDown = (event) => {
  if (goTracer) {
    event.currentTarget.setPointerCapture(event.pointerId);
    goTracer.handleDown(event);
  }
};
const handleUp = (event) => {
  if (goTracer) {
    goTracer.handleUp(event);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }
};


  const downloadSGF = () => {
    if (!isReady.value || !goTracer) {
      return;
    }

    const sgfContent = goTracer.getSGF();
    if (!sgfContent) {
      alert('Could not generate SGF. Ensure corners are positioned correctly.');
      return;
    }

    const blob = new Blob([sgfContent], { type: 'application/x-go-sgf;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'game.sgf';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href); // Clean up
  };
</script>

<template>
  <table id="canvases" cellpadding="5" class="canvases" style="">
    <tbody>
    <tr>
      <td rowspan="3">
        <h2 class="step"><span class="number">2. </span>Position the 4 corners <span id="match"></span></h2>
        <canvas ref="imageCanvas" id="image" width="900" height="600"
          @pointerdown="handleDown"
          @pointermove="handleMove"
          @pointerup="handleUp"
          @pointercancel="handleUp"
        ></canvas>
      </td>
      <td>

        <h2 class="step"><span class="number">3. </span>Download</h2>
        <Preview v-if="stones" :stones="stones" :board-size="boardSize" />

        <p v-if="scanError" class="scan-error" role="alert">{{ scanError }}</p>
        <button
          @click="downloadSGF"
          :disabled="!isReady"
          :aria-busy="!isReady && !scanError"
          class="download"
        >
          download
        </button>
        <button @click="emit('back')" class="change-image">change image</button>

      </td>
    </tr>
    <tr>
      <td>
        <div class="plotContainer">
          <h3 class="plotHeader">sample points</h3>
          <p class="plotExplanation">
            <ColorPlot :stones="stones"/>
            This plot shows each of the {{ boardSize * boardSize }} sample points of the superimposed grid in color space. The x-axis represents intensity while the y-axis
            represents saturation.
            The darkest points, to the left, are interpreted as black stones whereas the lightest points, to the right, are taken to be  white stones.
            The third group of points at the bottom, which have the most color, must be vacant points.
            If each group is nicely separated from the other groups, the trace will contain no errors.
          </p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="vertical-align: bottom;">
        <p class="version">v0.30-static &ndash; Apr 13 2025</p>
      </td>
    </tr>
    </tbody>
  </table>
</template>

<style scoped>
</style>
