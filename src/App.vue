<template>
  <ExampleImage v-if="!selection" @select="selection = $event" />
  <GoTracer
    v-else
    :image-url="selection.imageUrl"
    :board-size="selection.boardSize"
    @back="selection = null"
  />
</template>

<script setup>
import { ref } from 'vue';
import GoTracer from './components/GoTracer.vue';
import ExampleImage from './components/ExampleImage.vue';

const selection = ref(null);
</script>
