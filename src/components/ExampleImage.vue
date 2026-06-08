<template>
  <div class="example-image">
    <h3>Select an Example Image</h3>
    <div class="image-grid">
      <img
        v-for="image in exampleImages"
        :key="image.url"
        :src="image.url"
        @click="selectImage(image)"
        :alt="`${image.label} Go board example`"
        :title="image.label"
        class="thumbnail"
      />
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['select']);

const exampleImages = [
  { url: '/images/examples/goban1.jpg', label: '19x19 #1', boardSize: 19 },
  { url: '/images/examples/goban2.jpg', label: '19x19 #2', boardSize: 19 },
  { url: '/images/examples/goban3.jpg', label: '19x19 #3', boardSize: 19 },
  { url: '/images/examples/goban4.jpg', label: '19x19 #4', boardSize: 19 },
  { url: '/images/examples/goban5.jpg', label: '19x19 #5', boardSize: 19 },
  { url: '/images/examples/goban6.jpg', label: '19x19 #6', boardSize: 19 },
  { url: '/images/examples/goban7.jpg', label: '19x19 #7', boardSize: 19 },
  { url: '/images/examples/goban8.jpg', label: '19x19 #8', boardSize: 19 },
  { url: '/images/examples/goban9.jpg', label: '19x19 #9', boardSize: 19 },
  { url: '/images/examples/goban10.jpg', label: '19x19 #10', boardSize: 19 },
  { url: '/images/examples/goban11.jpg', label: '19x19 #11', boardSize: 19 },
  { url: '/images/examples/goban12.jpg', label: '19x19 #12', boardSize: 19 },
  { url: '/images/examples/goban13.jpg', label: '19x19 #13', boardSize: 19 },
  { url: '/images/examples/goban14.png', label: '19x19 #14', boardSize: 19 },
  { url: '/images/examples/13x13/5.jpeg', label: '13x13', boardSize: 13 },
  { url: '/images/examples/9x9/1.jpeg', label: '9x9 #1', boardSize: 9 },
  { url: '/images/examples/9x9/2.jpeg', label: '9x9 #2', boardSize: 9 },
  { url: '/images/examples/9x9/3.jpeg', label: '9x9 #3', boardSize: 9 },
  { url: '/images/examples/9x9/4.jpeg', label: '9x9 #4', boardSize: 9 },
];

function selectImage(image) {
  emit('select', {
    imageUrl: image.url,
    boardSize: image.boardSize
  });
}
</script>

<style scoped>
.example-image {
  margin: 1rem;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  margin-top: 15px;
}

.thumbnail {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s ease-in-out, border-color 0.2s ease-in-out;
}

.thumbnail:hover {
  transform: scale(1.05);
  border-color: #007bff;
}
</style>
