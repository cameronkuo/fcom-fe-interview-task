<template>
  <div>
    <h1 class="text-2xl font-bold">Q3</h1>
    <code-section code="Please review the code and provide any suggestions for improvement. Just like a code review you used to do." />

    <pre class="bg-gray-50/10 border border-[#00DC42]/50 dark:bg-white/5 flex flex-col gap-1 p-2 rounded-lg sm:col-span-2 my-4">
      <code>
        {{ getGiftTips }}
      </code>
    </pre>
  </div>
</template>

<script lang="ts" setup>
/**
 * q3:
 * @description 請 review 這段程式碼，並提供任何改進的建議。就像你過去做過的程式碼審查一樣。
 * @description Please review the code and provide any suggestions for improvement. Just like a code review you used to do.
 *
 * @hint 請提供任何改進的建議，包括但不限於程式碼結構、可讀性、效能、安全性、可維護性等。
 * @hint Please provide any suggestions for improvement, including but not limited to code structure, readability, performance, security, etc.
 *
 * 原始函數分析：
 * 根據設備範圍產生平台專屬訊息，使用數字代表不同設備(1=App, 2=手機網頁, 3=PC)
 * 主要問題：魔術數字(意義不明的數字)、複雜數值計算、缺乏型別檢查、無輸入驗證、缺少說明文件
 *
 * 重構改善：
 * 1. 新增 TypeScript Enum - 取代數字，提升可讀性和型別安全
 * 2. 新增函數說明 - 描述參數用途和回傳值
 * 3. 新增型別註解 - 修正 TS 錯誤，加強型別安全
 * 4. 改用布林邏輯 - 取代數值運算，邏輯更直觀
 * 5. 簡化條件判斷 - 移除 switch，改用清楚的 if-else
 * 6. 新增輸入檢查 - 處理空值情況，提高穩定性
 * 7. 使用枚舉比較 - 保持程式碼一致性
 * 8. 增加程式註解 - 說明業務邏輯，方便維護
 **/

defineOptions({
  name: 'Q3',
})

/**
 * Device type enum for better type safety and readability
 */
enum DeviceType {
  APP = 1,
  MOBILE_WEB = 2,
  PC = 3
}


/**
 * Generates appropriate gift tips message based on supported device scope
 *
 * @param deviceScope Array of device type numbers indicating which devices are supported
 * @returns String message indicating platform exclusivity or empty string if no specific exclusivity
 *
 * Logic explanation:
 * - DeviceType.APP (1): Mobile app support
 * - DeviceType.MOBILE_WEB (2): Mobile web browser support (overrides other settings when present)
 * - DeviceType.PC (3): Desktop/PC support
 *
 * Priority: Mobile web (2) takes precedence and resets all other flags when present
 */
function getGiftTips(deviceScope: DeviceType[]): string {
  // Early return for empty scope
  if (!deviceScope || deviceScope.length === 0) {
    return '';
  }

  // Check device support using enum values for better readability
  const hasAppSupport = deviceScope.includes(DeviceType.APP);
  const hasPcSupport = deviceScope.includes(DeviceType.PC);
  const hasMobileWebSupport = deviceScope.includes(DeviceType.MOBILE_WEB);

  // Mobile web support overrides all other settings (business rule)
  if (hasMobileWebSupport) {
    return '';
  }

  // Generate appropriate message based on supported platforms
  if (hasAppSupport && hasPcSupport) {
    return 'Exclusive to the App / Mobile Web';
  } else if (hasAppSupport) {
    return 'Exclusive to the App / PC';
  } else if (hasPcSupport) {
    return 'Exclusive to the Mobile Web';
  }

  return '';
}

</script>

<style>

</style>