<template>
  <div class="app-shell">
    <header class="site-header">
      <button
        v-if="selection"
        class="brand brand-button"
        type="button"
        aria-label="Return to image selection"
        @click="selection = null"
      >
        <span class="brand-mark" aria-hidden="true"></span>
        <span>Go Tracer</span>
      </button>
      <div v-else class="brand">
        <span class="brand-mark" aria-hidden="true"></span>
        <span>Go Tracer</span>
      </div>
      <p class="site-tagline">Turn a board photo into an SGF file</p>
    </header>

    <main>
      <ExampleImage v-if="!selection" @select="selection = $event" />
      <GoTracer
        v-else
        :image-url="selection.imageUrl"
        :board-size="selection.boardSize"
        @back="selection = null"
      />
    </main>

    <footer class="site-footer">
      <span>Runs entirely in your browser</span>
      <span aria-hidden="true">·</span>
      <span>No images are uploaded</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import GoTracer from './components/GoTracer.vue';
import ExampleImage from './components/ExampleImage.vue';

interface ImageSelection {
  imageUrl: string;
  boardSize: number;
}

const selection = ref<ImageSelection | null>(null);
</script>
