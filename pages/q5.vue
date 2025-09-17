<template>
  <div>
    <h1 class="text-2xl font-bold">
      <span>Q5</span>
      <ClientOnly>
        <CurrentTime />
      </ClientOnly>
    </h1>

    <UCollapsible class="rounded-lg border border-gray-200 p-4">
      <h2 class="text-4">Click to see some hints</h2>
      <template #content>
        <VideoCard :source="vQ5" />
        <ul>
          <li>1. 但可以看出 CurrentTime 有明顯卡頓, 有什麼優化方式?</li>
          <li>2. 解法不只一種, 可以提供更多想法</li>
        </ul>
      </template>
    </UCollapsible>
    <Separator />

    <h2 class="text-lg">Show Data here:</h2>
    <ul v-for="item in data" :key="item.id">
      <li class="flex gap-1 text-sm rounded-lg">
        <div>id: {{ item.id }}</div>
        <div>name: {{ item.name }}</div>
        <div>ans: {{ item.ans }}</div>
      </li>
    </ul>

    <div class="flex gap-2 mt-4">
      <button
        @click="run()"
        :disabled="isRunning"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isRunning ? 'Running...' : 'Run (No Batching)' }}
      </button>
      <button
        @click="runWithBatch()"
        :disabled="isBatchRunning"
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isBatchRunning ? `Batch ${batchProgress}` : 'Run (With Batching)' }}
      </button>
      <button
        @click="runOneByOne()"
        :disabled="isOneByOneRunning"
        class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isOneByOneRunning ? `Progress ${oneByOneProgress}` : 'Run (One by One)' }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useQ5 } from "@/composables/useQ5";
import vQ5 from "@/assets/q5.mov";

/**
 * 請取得 list 中的每一筆資料的 detail, 並且將結果寫入 data
 * Please get the detail of each item in list, and write the result to data
 *
 * Note:
 * - fetchList 與 fetchDetail 都是模擬 API 請求的函數
 * - 如何避免瞬間大量請求
 * - 如何避免畫面卡頓: 可觀察畫面上的 CurrentTime 來判斷畫面是否有卡頓
 *
 * === 為什麼 CurrentTime 會卡住 & 怎麼修好的 ===
 *
 * 問題：
 * 時鐘會凍結是因為 mockHeavy() 在主線程做很重的計算（遞迴費波納契數列）
 * 當主線程忙著算數學時，UI 就沒辦法更新了
 *
 * 解決方案：
 * 1. 把重計算搬到 Web Worker（background thread）
 * 2. 做了兩種不同的方法來比較
 *
 * 藍色按鈕 - "衝很快" 模式：
 * - 一次發射全部 20 個請求
 * - 比較快但吃比較多系統資源
 * - 適合：電腦不錯且想要速度時
 *
 * 綠色按鈕 - "溫和一點" 模式：
 * - 一次處理 3 個，分批進行
 * - 比較慢但對系統比較友善
 * - 會顯示進度
 * - 適合：電腦比較弱或想對伺服器友善時
 *
 * 橘色按鈕 - "慢慢來" 模式：
 * - 一次只處理 1 個，完全序列化
 * - 最慢但資源用量最少
 * - 即時顯示每個項目的進度
 * - 適合：很弱的電腦或網路不穩定時
 *
 * 修改的檔案：
 * - /public/heavy-calculation-worker.js - 在背景做重計算
 * - useQ5.ts - 加了 calculateHeavy() 使用 Web Worker
 * - 這個檔案 - 兩種不同的 run 函數來比較
 *
 * 為什麼有效：
 * Web Worker 在背景跑計算，主線程（UI 線程）就可以繼續更新畫面
 * 就像請別人算數學，你可以繼續更新畫面一樣
 */

defineOptions({
  name: "Q5",
});

const data = ref<{ id: string; name: string; ans: number }[]>([]);

// Progress tracking states
const isRunning = ref(false);
const isBatchRunning = ref(false);
const isOneByOneRunning = ref(false);
const batchProgress = ref('');
const oneByOneProgress = ref('');

const { fetchList, fetchDetail } = useQ5();

/**
 * Simple approach: Process all requests concurrently without batching
 * Uses Web Workers for heavy calculations to prevent UI blocking
 * All requests are fired simultaneously for maximum speed
 */
const run = async () => {
  if (isRunning.value) return;

  try {
    isRunning.value = true;
    // Reset data
    data.value = [];

    // Step 1: Fetch the list of items
    console.log("Fetching list...");
    const list = await fetchList();
    console.log("List fetched:", list.length, "items");

    // Step 2: Process all details concurrently (no batching)
    console.log("Processing all items concurrently...");
    const promises = list.map(async (item) => {
      const detail = await fetchDetail(item.id);
      return detail;
    });

    // Wait for all requests to complete
    const results = await Promise.all(promises);
    data.value = results;

    console.log("All data processed successfully (no batching)");
  } catch (error) {
    console.error("Error in run function:", error);
  } finally {
    isRunning.value = false;
  }
};

/**
 * Sequential processing: Process requests one by one
 * Most conservative approach - only one request at a time
 * Slowest but uses minimal resources and shows real-time progress
 */
const runOneByOne = async () => {
  if (isOneByOneRunning.value) return;

  try {
    isOneByOneRunning.value = true;
    oneByOneProgress.value = '';
    // Reset data
    data.value = [];

    // Step 1: Fetch the list of items
    console.log("Fetching list...");
    const list = await fetchList();
    console.log("List fetched:", list.length, "items");

    // Step 2: Process details one by one
    console.log("Processing items one by one...");
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      oneByOneProgress.value = `${i + 1}/${list.length}`;
      console.log(`Processing item ${i + 1}/${list.length}: ${item!.id}`);

      const detail = await fetchDetail(item!.id);
      data.value.push(detail);

      console.log(`Completed item ${i + 1}/${list.length}`);
    }

    console.log("All data processed successfully (one by one)");
  } catch (error) {
    console.error("Error in runOneByOne function:", error);
  } finally {
    isOneByOneRunning.value = false;
    oneByOneProgress.value = '';
  }
};

/**
 * Batch processing approach: Process requests in controlled batches
 * 1. Uses Web Workers for heavy calculations (prevents UI blocking)
 * 2. Implements concurrency control to avoid overwhelming the system
 * 3. Updates UI progressively as data becomes available
 */
const runWithBatch = async () => {
  if (isBatchRunning.value) return;

  try {
    isBatchRunning.value = true;
    batchProgress.value = '';
    // Reset data
    data.value = [];

    // Step 1: Fetch the list of items
    console.log("Fetching list...");
    const list = await fetchList();
    console.log("List fetched:", list.length, "items");

    // Step 2: Process details with controlled concurrency
    // Limit concurrent requests to prevent overwhelming the system
    const CONCURRENCY_LIMIT = 3;
    const results: { id: string; name: string; ans: number }[] = [];
    const totalBatches = Math.ceil(list.length / CONCURRENCY_LIMIT);

    // Process items in batches to control concurrency
    for (let i = 0; i < list.length; i += CONCURRENCY_LIMIT) {
      const batch = list.slice(i, i + CONCURRENCY_LIMIT);
      const currentBatch = Math.floor(i / CONCURRENCY_LIMIT) + 1;

      batchProgress.value = `${currentBatch}/${totalBatches}`;

      // Process current batch concurrently
      const batchPromises = batch.map(async (item) => {
        const detail = await fetchDetail(item.id);
        return detail;
      });

      // Wait for current batch to complete
      const batchResults = await Promise.all(batchPromises);

      // Add results to data array progressively
      results.push(...batchResults);
      data.value = [...results];

      console.log(`Processed batch ${currentBatch}/${totalBatches}`);
    }

    console.log("All data processed successfully (with batching)");
  } catch (error) {
    console.error("Error in runWithBatch function:", error);
  } finally {
    isBatchRunning.value = false;
    batchProgress.value = '';
  }
};
</script>

<style></style>
