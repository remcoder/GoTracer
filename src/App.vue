<template>
  <ExampleImage v-if="!imageUrl" @select="imageUrl = $event" />
  <GoTracer v-else :imageUrl="imageUrl" @back="imageUrl = ''" />
</template>

<script setup>
import { ref } from 'vue';
import GoTracer from './components/GoTracer.vue';
import ExampleImage from './components/ExampleImage.vue';

const imageUrl = ref('');
</script>
