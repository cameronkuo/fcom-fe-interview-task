<template>
  <div>
    <h1 class="text-2xl font-bold">Q1</h1>
    <code-section code="Click button to show data after 10 seconds" />
    <VideoCard :source="vQ1" />

    <Separator />

    <h2 class="text-lg">Show Data here: {{ data }}</h2>
    <button @click="setData">Set Data</button>
  </div>
</template>

<script lang="ts" setup>
import vQ1 from '@/assets/q1.mov'

defineOptions({
  name: 'Q1',
})

const data = ref('')
const setData = async () => {
  data.value = 'Loading...'
  await new Promise((resolve) => setTimeout(resolve, 10000))
  data.value = 'Get Data Success'
}

</script>

<style>

</style>