<template>
  <section class="selection-page" aria-labelledby="selection-title">
    <div class="page-intro">
      <span class="eyebrow">Step 1 of 3</span>
      <h1 id="selection-title">Choose a board photo</h1>
      <p>Select an example to trace. You will position the four board corners on the next screen.</p>
    </div>

    <div
      v-for="group in imageGroups"
      :key="group.boardSize"
      class="image-group"
    >
      <div class="group-heading">
        <h2>{{ group.boardSize }} × {{ group.boardSize }} boards</h2>
        <span>{{ group.images.length }} {{ group.images.length === 1 ? 'example' : 'examples' }}</span>
      </div>
      <div class="image-grid">
        <button
          v-for="(image, index) in group.images"
          :key="image.url"
          type="button"
          class="image-card"
          :aria-label="`Select ${group.boardSize} by ${group.boardSize} board example ${index + 1}`"
          @click="selectImage(image)"
        >
          <img
            :src="image.url"
            :alt="`${image.boardSize}x${image.boardSize} Go board example ${index + 1}`"
            class="thumbnail"
          />
          <span class="image-card-label">Example {{ index + 1 }}</span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const emit = defineEmits(['select']);

const exampleImages = [
  { url: '/images/examples/goban1.jpg', boardSize: 19 },
  { url: '/images/examples/goban2.jpg', boardSize: 19 },
  { url: '/images/examples/goban3.jpg', boardSize: 19 },
  { url: '/images/examples/goban4.jpg', boardSize: 19 },
  { url: '/images/examples/goban5.jpg', boardSize: 19 },
  { url: '/images/examples/goban6.jpg', boardSize: 19 },
  { url: '/images/examples/goban7.jpg', boardSize: 19 },
  { url: '/images/examples/goban8.jpg', boardSize: 19 },
  { url: '/images/examples/goban9.jpg', boardSize: 19 },
  { url: '/images/examples/goban10.jpg', boardSize: 19 },
  { url: '/images/examples/goban11.jpg', boardSize: 19 },
  { url: '/images/examples/goban12.jpg', boardSize: 19 },
  { url: '/images/examples/goban13.jpg', boardSize: 19 },
  { url: '/images/examples/goban14.png', boardSize: 19 },
  { url: '/images/examples/13x13/5.jpeg', boardSize: 13 },
  { url: '/images/examples/9x9/1.jpeg', boardSize: 9 },
  { url: '/images/examples/9x9/2.jpeg', boardSize: 9 },
  { url: '/images/examples/9x9/3.jpeg', boardSize: 9 },
  { url: '/images/examples/9x9/4.jpeg', boardSize: 9 },
];

const imageGroups = computed(() => [19, 13, 9].map((boardSize) => ({
  boardSize,
  images: exampleImages.filter((image) => image.boardSize === boardSize)
})));

function selectImage(image) {
  emit('select', {
    imageUrl: image.url,
    boardSize: image.boardSize
  });
}
</script>
