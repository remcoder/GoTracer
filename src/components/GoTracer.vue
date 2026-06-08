<script setup>
import Preview from './Preview.vue';
import { GoTracer } from '../lib/gotracer.js';
import { DEFAULT_BOARD_SIZE, SUPPORTED_BOARD_SIZES } from '../lib/board-size.js';
import ColorPlot from './ColorPlot.vue';
import { onMounted, ref } from 'vue';
let goTracer;

const props = defineProps({
  imageUrl: {
    type: String,
    required: true
  },
  boardSize: {
    type: Number,
    default: DEFAULT_BOARD_SIZE,
    validator: (value) => SUPPORTED_BOARD_SIZES.includes(value)
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
  const image = document.getElementById('image');
  const colorPlot = document.getElementById('colorPlot');

  goTracer = new GoTracer(props.imageUrl, image, undefined, props.boardSize);
  goTracer.onScan((data) => {
    stones.value.blackSet = data.blackSet;
    stones.value.whiteSet = data.whiteSet;
    stones.value.boardSet = data.boardSet;
  });
});

const handleMove = (event) => {
  if (goTracer) {
    goTracer.handleMove(event);
  }
};
const handleDown = (event) => {
  if (goTracer) {
    goTracer.handleDown(event);
  }
};
const handleUp = (event) => {
  if (goTracer) {
    goTracer.handleUp(event);
  }
};


  const downloadSGF = () => {
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
        <canvas   id="image" width="900" height="600"
          @mousedown="handleDown"
          @mousemove="handleMove"
          @mouseup="handleUp"
        ></canvas>
      </td>
      <td>

        <h2 class="step"><span class="number">3. </span>Download</h2>
        <Preview v-if="stones" :stones="stones" :board-size="boardSize" />

        <button @click="downloadSGF" class="download">download</button>
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
