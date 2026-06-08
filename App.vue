<template>
  <ExampleImage v-if="!imageUrl" @select="imageUrl = $event" />
  <GoTracer v-else :imageUrl="imageUrl" @back="imageUrl = ''" />
</template>

<script setup>
import { ref } from 'vue';
import GoTracer from './GoTracer.vue';
import ExampleImage from './ExampleImage.vue';

const imageUrl = ref('');
</script>