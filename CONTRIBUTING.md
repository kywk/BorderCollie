# Contributing to BorderCollie

BorderCollie 是可獨立運作的甘特圖工具，同時也被 Sheltie 等外部專案以 submodule 方式引用。
本文件說明共用元件的抽象化規範，確保內部開發與外部整合的一致性。

---

## 架構概覽

```
src/
├── components/          # Vue 元件（可被外部直接引用）
├── shared/              # ★ 共用模組（外部整合的主要介面）
│   ├── types/           #   型別定義
│   ├── parser/          #   解析器（textParser, frontmatterParser, serializer）
│   ├── composables/     #   Vue composables（useGanttScale, useGanttData）
│   └── styles/          #   CSS 變數（variables.css）
├── stores/              # Pinia stores（僅供 BorderCollie 內部使用）
├── composables/         # 內部 composables（依賴 store，不對外）
├── parser/              # 內部 parser（可能含 store 耦合邏輯）
└── utils/               # 內部工具函式
```

核心原則：**`src/shared/` 是對外的公開 API，其餘為內部實作。**

---

## 規則

### 1. shared 模組不得依賴 store

`src/shared/` 下的所有程式碼不可 import `src/stores/` 的任何東西。

```typescript
// ✅ shared composable — 接受 Ref 參數
export function useGanttData(projects: Ref<Project[]>) { ... }

// ❌ 不可在 shared 中直接使用 store
import { useProjectStore } from '@/stores/projectStore'  // 禁止
```

外部專案無法也不應該使用 BorderCollie 的 store。shared composable 必須透過參數接收資料。

### 2. 元件支援 props 傳入，store 作為 fallback

所有可被外部引用的元件（如 `ProjectGantt`、`PersonGantt`）必須同時支援：
- **Props 模式**：外部專案傳入資料
- **Store 模式**：BorderCollie 內部使用時從 store 讀取

```typescript
// 元件 props 定義
const props = withDefaults(defineProps<{
  computedPhases?: ComputedPhase[]   // 外部傳入
  projects?: Project[]               // 外部傳入
  scale?: GanttScale
  barStyle?: 'block' | 'arrow'
  timeRange?: TimeRange
}>(), { ... })

// 資料來源：props 優先，store fallback
const phases = computed(() => props.computedPhases ?? store.computedPhases)
```

### 3. 型別定義集中在 shared/types

所有會被外部使用的 interface 必須定義在 `src/shared/types/index.ts` 並 export。

新增型別時：
- 加到 `shared/types/index.ts`
- 確保 `shared/index.ts` 有 re-export

### 4. CSS 變數定義在 shared/styles/variables.css

所有主題相關的 CSS 變數（顏色、間距、圓角、陰影等）統一定義在 `src/shared/styles/variables.css`。

- 元件的 scoped CSS 使用 `var(--xxx)` 引用，不可寫死色碼
- 外部專案透過 `@import` 引入此檔案即可統一主題
- 新增 CSS 變數時同時維護 `:root`（dark）和 `[data-theme="light"]` 兩組

### 5. 計算邏輯抽到 shared composable，不要在外部 inline

如果某段計算邏輯同時存在於 store 和外部專案，必須抽成 shared composable。

```typescript
// ✅ 外部專案引用 shared composable
import { useGanttData } from 'border-collie/src/shared/composables/useGanttData'
const { computedPhases, personAssignments, allPersons, timeRange } = useGanttData(projects)

// ❌ 外部專案自己 inline 重寫計算邏輯
const computedPhases = computed(() => { /* 手動計算... */ })  // 容易與 store 不一致
```

### 6. shared/index.ts 作為統一入口

外部專案應從 `src/shared` 或其子模組 import，不要直接引用內部路徑。

```typescript
// ✅ 推薦
import { parseText, serializeToText } from 'border-collie/src/shared/parser'
import { useGanttData } from 'border-collie/src/shared/composables/useGanttData'
import type { Project, ComputedPhase } from 'border-collie/src/shared/types'

// ❌ 避免直接引用內部模組
import { parseText } from 'border-collie/src/parser/textParser'
```

---

## Checklist：新增或修改功能時

- [ ] 新型別是否加到 `shared/types/index.ts`？
- [ ] 新 composable 是否放在 `shared/composables/` 且不依賴 store？
- [ ] 元件是否支援 props 傳入（不強制依賴 store）？
- [ ] 新 CSS 變數是否加到 `shared/styles/variables.css` 的 dark + light 兩組？
- [ ] `shared/composables/index.ts` 和 `shared/index.ts` 是否有 export 新模組？
- [ ] store 中的計算邏輯如果也被外部需要，是否已抽到 shared composable？
