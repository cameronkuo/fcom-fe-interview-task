<template>
  <section>
    <ClientOnly>
      <VideoCard :source="vQ6" />
    </ClientOnly>

    <section>
      <form ref="formRef" action="" @submit.prevent class="grid grid-cols-3 gap-4 mt-4">
        <template v-for="row in matrix" :key="row.match">
          <p class="col-span-full text-center">{{ row.match }}</p>
          <label
            v-for="option in row.options"
            :key="option.label"
            :for="`${row.match}-${option.label}`"
            class="has-checked:bg-green-500 bg-white p-2 rounded cursor-pointer text-black text-center font-bold"
          >
            <input
              type="checkbox"
              :id="`${row.match}-${option.label}`"
              :name="row.match"
              :value="option.value"
              class="hidden"
              @change="onChange"
            />
            {{ option.label }}: {{ option.value.toFixed(2) }}
          </label>
        </template>
      </form>

      <p class="mt-4">
        Selected Odds:
        <span>{{ minOdds }}</span>
        <span v-if="minOdds !== maxOdds"> ~ {{ maxOdds }}</span>
      </p>
    </section>
  </section>
</template>

<script lang="ts" setup>
import vQ6 from "@/assets/q6.mov";

defineOptions({
  name: "Q6",
});

/**
 * Team A vs Team B
 * Home Odds: 1.25
 * Away Odds: 3.75
 * Draw Odds: 10.00
 *
 * Team C vs Team D
 * Home Odds: 1.50
 * Away Odds: 2.50
 * Draw Odds: 12.00
 *
 * Team E vs Team F
 * Home Odds: 1.75
 * Away Odds: 2.25
 * Draw Odds: 8.00
 *
 * 請根據以上資料完成下列事項
 * 1. UI 切版
 * 2. 選取賽事後顯示總 Odds 計算結果 (選取的 Odds 相乘)
 * 3. 需要考慮 "互斥" 的狀況, 當狀況發生, 總 Odds 會變成一個範圍 (min~max)
 *
 * ** 互斥表示同一隊伍選擇多個結果, 這些結果不會同時發生, 因此稱為互斥 **
 *
 * e.g.
 * 情境1,
 * User 選擇 Team A 贏, Team C 贏, Team E 贏
 * 總 Odds 為 1.25 * 1.50 * 1.75 = 3.28125
 *
 * 情境2,
 * User 選擇 Team A 贏, Team C 贏, Team F 贏
 * 總 Odds 為 1.25 * 12.00 * 2.25 = 33.75
 *
 * 情境3 (互斥)
 * User 選擇 Team A 贏, Team B 贏, Team E 贏
 * 總 Odds-1 為 TeamA (1.25) * TeamE (1.75) = 2.1875
 * 總 Odds-2 為 TeamB (3.75) * TeamE (1.75) = 6.5625
 */

const formRef = ref<HTMLFormElement | null>(null);
const minOdds = ref(0);
const maxOdds = ref(0);

const matrix = [
  {
    match: "Team A vs Team B",
    options: [
      { label: "Home", value: 1.25, team: "A" },
      { label: "Draw", value: 10.0, team: "AB" },
      { label: "Away", value: 3.75, team: "B" },
    ],
  },
  {
    match: "Team C vs Team D",
    options: [
      { label: "Home", value: 1.5, team: "C" },
      { label: "Draw", value: 12.0, team: "CD" },
      { label: "Away", value: 2.5, team: "D" },
    ],
  },
  {
    match: "Team E vs Team F",
    options: [
      { label: "Home", value: 1.75, team: "E" },
      { label: "Draw", value: 8.0, team: "EF" },
      { label: "Away", value: 2.25, team: "F" },
    ],
  },
];

const onChange = () => {
  if (!formRef.value) return;

  const formData = new FormData(formRef.value);
  const selectedOptionsMap = new Map<string, number[]>();
  formData.entries().forEach(([match, value]) => {
    if (!selectedOptionsMap.has(match)) {
      selectedOptionsMap.set(match, []);
    }
    selectedOptionsMap.get(match)?.push(parseFloat(value as string));
  });

  console.log("Selected Options Map:", selectedOptionsMap);

  minOdds.value = Array.from(selectedOptionsMap.values()).reduce((acc, curr) => acc * Math.min(...curr), 1);
  maxOdds.value = Array.from(selectedOptionsMap.values()).reduce((acc, curr) => acc * Math.max(...curr), 1);
};
</script>

<style></style>
