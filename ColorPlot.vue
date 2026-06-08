<template>
  <canvas ref="colorPlotCanvas" id="colorPlot" width="128" height="256"></canvas>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
const colorPlotCanvas = ref(null);
let ctx;

const props = defineProps({
  stones: {
    type: Object,
    required: true
  }
});

onMounted(() => {
  ctx = colorPlotCanvas.value.getContext('2d');
  
  draw(stones);

  watch(() => props.stones, (newStones) => {
    console.debug('Stones updated:', newStones);
    draw(newStones);
  }, { deep: true });
});



function drawDebug(points, color) {
  console.debug('Drawing debug points:', points, 'with color:', color);
  ctx.fillStyle = color;
  for (let j = 0; j < points.length; j++) {
    console.debug('Drawing point:', points[j]);
    const p = points[j];
    ctx.fillRect(p.y / 2 - 1, p.x / 2 + 128 - 2, 2, 4);
  }
  // ctx.fillStyle = "green";
  // ctx.fillRect(this.y/2 - 1, this.x/2 + 128 - 2, 2, 4);
}

function draw(newStones) {
  console.debug('Drawing color plot with stones:', newStones,);
  ctx.clearRect(0, 0, colorPlotCanvas.value.width, colorPlotCanvas.value.height);
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, colorPlotCanvas.value.width, colorPlotCanvas.value.height);

  drawDebug(newStones.blackSet.points, 'rgb(0,0,0)');
  drawDebug(newStones.whiteSet.points, 'rgb(160,160,160)');
  drawDebug(newStones.boardSet.points, 'rgb(255,160,64)');
}

</script>