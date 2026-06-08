<template>
  <ExampleImage v-if="!selection" @select="selection = $event" />
  <GoTracer
    v-else
    :image-url="selection.imageUrl"
    :board-size="selection.boardSize"
    @back="selection = null"
  />
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
