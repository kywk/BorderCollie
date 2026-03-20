/**
 * BorderCollie - useGanttScale Composable
 * 時間軸計算邏輯
 * 
 * 這是 BorderCollie 內部使用的包裝器，從 projectStore 取得資料
 */

import { computed } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { useGanttScaleShared } from '@/shared/composables/useGanttScale'

export function useGanttScale() {
    const store = useProjectStore()

    // 使用 shared composable，傳入從 store 取得的資料
    return useGanttScaleShared({
        timeRange: computed(() => store.timeRange),
        scale: computed(() => store.scale)
    })
}
