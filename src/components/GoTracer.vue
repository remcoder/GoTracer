<script setup>
import Preview from './Preview.vue';
import { GoTracer } from '../lib/gotracer.js';
import { DEFAULT_BOARD_SIZE, SUPPORTED_BOARD_SIZES } from '../lib/board-size.js';
import ColorPlot from './ColorPlot.vue';
import { computed, onMounted, ref } from 'vue';

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

const statusLabel = computed(() => {
  if (scanError.value) {
    return 'Needs attention';
  }
  return isReady.value ? 'Ready to download' : 'Analyzing board';
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
  URL.revokeObjectURL(link.href);
};
</script>

<template>
  <section class="tracer-page" aria-labelledby="tracer-title">
    <div class="tracer-heading">
      <div>
        <span class="eyebrow">Step 2 of 3</span>
        <h1 id="tracer-title">Position the four corners</h1>
        <p>Drag each marker onto an outer board intersection. The preview updates automatically.</p>
      </div>
      <button type="button" class="button button-secondary back-button" @click="emit('back')">
        <svg aria-hidden="true" viewBox="0 0 20 20">
          <path d="M12.5 4.5 7 10l5.5 5.5" />
        </svg>
        Change image
      </button>
    </div>

    <div class="workspace">
      <div class="canvas-card">
        <div class="canvas-toolbar">
          <span>{{ boardSize }} × {{ boardSize }} board</span>
          <span class="drag-hint">Drag the corner markers</span>
        </div>
        <canvas ref="imageCanvas" id="image" width="900" height="600"
          aria-label="Selected Go board image with draggable corner markers"
          @pointerdown="handleDown"
          @pointermove="handleMove"
          @pointerup="handleUp"
          @pointercancel="handleUp"
        ></canvas>
      </div>

      <aside class="results-panel" aria-labelledby="results-title">
        <div class="results-heading">
          <div>
            <span class="eyebrow">Step 3 of 3</span>
            <h2 id="results-title">Review and export</h2>
          </div>
          <span
            class="status"
            :class="{ 'status-ready': isReady, 'status-error': scanError }"
            aria-live="polite"
          >
            <span class="status-dot" aria-hidden="true"></span>
            {{ statusLabel }}
          </span>
        </div>

        <div class="preview-frame">
          <Preview v-if="stones" :stones="stones" :board-size="boardSize" />
        </div>

        <p v-if="scanError" class="scan-error" role="alert">{{ scanError }}</p>
        <p v-else class="results-note">Check the preview, then save the detected position as an SGF file.</p>

        <button
          type="button"
          @click="downloadSGF"
          :disabled="!isReady"
          :aria-busy="!isReady && !scanError"
          class="button button-primary download"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20">
            <path d="M10 3v9m0 0 3.5-3.5M10 12 6.5 8.5M4 15.5h12" />
          </svg>
          Download SGF
        </button>

        <details class="diagnostics">
          <summary>Detection details</summary>
          <div class="diagnostics-content">
            <ColorPlot :stones="stones"/>
            <p>
              Each dot represents one of {{ boardSize * boardSize }} intersections. Clear separation
              between dark, light, and amber groups generally means a more accurate trace.
            </p>
          </div>
        </details>
      </aside>
    </div>
  </section>
</template>
