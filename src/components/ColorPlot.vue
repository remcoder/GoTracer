<template>
  <canvas ref="colorPlotCanvas" id="colorPlot" width="128" height="256"></canvas>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

interface PlotPoint {
  x: number;
  y: number;
}

interface StoneSet {
  points: PlotPoint[];
}

interface Stones {
  blackSet: StoneSet;
  whiteSet: StoneSet;
  boardSet: StoneSet;
}

const colorPlotCanvas = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;

const props = defineProps<{
  stones: Stones;
}>();

onMounted(() => {
  const canvas = colorPlotCanvas.value;
  if (!canvas) {
    return;
  }

  ctx = canvas.getContext('2d');
  if (ctx) {
    draw(props.stones, canvas);
  }
});

watch(() => props.stones, (newStones) => {
  const canvas = colorPlotCanvas.value;
  if (ctx && canvas) {
    draw(newStones, canvas);
  }
}, { deep: true });

function drawDebug(points: PlotPoint[], color: string) {
  if (!ctx) {
    return;
  }

  ctx.fillStyle = color;
  for (let j = 0; j < points.length; j++) {
    const p = points[j];
    if (!p) {
      continue;
    }
    ctx.fillRect(p.y / 2 - 1, p.x / 2 + 128 - 2, 2, 4);
  }
}

function draw(newStones: Stones, canvas: HTMLCanvasElement) {
  if (!ctx) {
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawDebug(newStones.blackSet.points, 'rgb(0,0,0)');
  drawDebug(newStones.whiteSet.points, 'rgb(160,160,160)');
  drawDebug(newStones.boardSet.points, 'rgb(255,160,64)');
}

</script>
