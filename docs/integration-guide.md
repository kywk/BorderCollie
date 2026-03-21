# 共用元件引用指南

本文件說明如何在外部專案中引用 BorderCollie 的共用元件、composables 和 CSS 變數。

---

## 前置設定

### 1. 加入 submodule

```bash
git submodule add <border-collie-repo-url> border-collie
```

### 2. Vite alias 設定

BorderCollie 元件內部使用 `@/` 路徑引用自身模組，外部專案需要處理這些 import。

**方式 A：Vite plugin（推薦）**

```typescript
// vite.config.ts
import { fileURLToPath, URL } from 'node:url'

const borderCollieRoot = fileURLToPath(new URL('../border-collie/src', import.meta.url))
const frontendSrc = fileURLToPath(new URL('./src', import.meta.url))

function borderCollieAliasPlugin() {
  return {
    name: 'border-collie-alias',
    enforce: 'pre' as const,
    transform(code: string, id: string) {
      if (!id.includes('/border-collie/src/')) return null
      const rewritten = code.replace(/from\s+['"]@\//g, `from '${borderCollieRoot}/`)
      return rewritten !== code ? { code: rewritten, map: null } : null
    }
  }
}

export default defineConfig({
  plugins: [vue(), borderCollieAliasPlugin()],
  resolve: {
    alias: { '@': frontendSrc }
  }
})
```

**方式 B：明確 alias 列表**

```typescript
// vite.config.ts
resolve: {
  alias: [
    { find: '@/stores/projectStore', replacement: `${borderCollieRoot}/stores/projectStore` },
    { find: '@/composables/useGanttScale', replacement: `${borderCollieRoot}/composables/useGanttScale` },
    { find: '@/shared/composables/useGanttScale', replacement: `${borderCollieRoot}/shared/composables/useGanttScale` },
    { find: '@/parser/textParser', replacement: `${borderCollieRoot}/parser/textParser` },
    { find: /^@\/types(.*)$/, replacement: `${borderCollieRoot}/types$1` },
    { find: '@', replacement: frontendSrc }
  ]
}
```

### 3. 引入 CSS 變數

在你的全域 CSS 最上方加入：

```css
@import '../border-collie/src/shared/styles/variables.css';
```

這會提供所有主題色彩、間距、圓角等 CSS 變數，支援 dark/light 主題切換。

---

## 引用範例

### 甘特圖元件（完整範例）

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import ProjectGantt from 'border-collie/src/components/ProjectGantt.vue'
import PersonGantt from 'border-collie/src/components/PersonGantt.vue'
import { parseText } from 'border-collie/src/shared/parser'
import { useGanttData } from 'border-collie/src/shared/composables/useGanttData'
import type { Project, GanttScale } from 'border-collie/src/shared/types'

const rawText = ref(`My Project:
- BA, 2025-10-01, 2025-11-30: Andy 0.3, Ben 0.8
- Dev, --, 2026-02: Andy 0.6, Cat 0.5`)

// 解析文字 → Project[]
const projects = computed<Project[]>(() => {
  try { return parseText(rawText.value) }
  catch { return [] }
})

// 計算甘特圖所需資料（一行搞定）
const { computedPhases, personAssignments, allPersons, timeRange } = useGanttData(projects)

// UI 控制
const scale = ref<GanttScale>({ monthWidth: 80, rowHeight: 40 })
const barStyle = ref<'block' | 'arrow'>('block')
</script>

<template>
  <!-- 專案甘特圖 -->
  <ProjectGantt
    :computed-phases="computedPhases"
    :projects="projects"
    :scale="scale"
    :bar-style="barStyle"
    :time-range="timeRange"
  />

  <!-- 人力甘特圖 -->
  <PersonGantt
    :person-assignments="personAssignments"
    :all-persons="allPersons"
    :scale="scale"
    :bar-style="barStyle"
    :time-range="timeRange"
  />
</template>
```

### 編輯器元件

```vue
<script setup lang="ts">
import { ref } from 'vue'
import BCTextEditor from 'border-collie/src/components/TextEditor.vue'
import BCTableEditor from 'border-collie/src/components/TableEditor.vue'
import { serializeToText } from 'border-collie/src/shared/parser'
import type { Project } from 'border-collie/src/shared/types'

const rawText = ref('')

// TableEditor 回傳 Project[]，需序列化回文字
function onTableUpdate(updated: Project[]) {
  rawText.value = serializeToText(updated)
}
</script>

<template>
  <!-- 純文字編輯 -->
  <BCTextEditor v-model="rawText" />

  <!-- 表格編輯 -->
  <BCTableEditor :projects="projects" @update:projects="onTableUpdate" />
</template>
```

### 僅使用 parser（不需元件）

```typescript
import { parseText } from 'border-collie/src/shared/parser'
import { serializeToText } from 'border-collie/src/shared/parser'
import type { Project } from 'border-collie/src/shared/types'

const projects: Project[] = parseText(rawText)
const text: string = serializeToText(projects)
```

---

## 可用的共用資源一覽

### Types (`shared/types`)

| 型別 | 說明 |
|------|------|
| `Project` | 專案（name, phases, pending?） |
| `Phase` | 階段（name, startDate, endDate, assignments） |
| `Assignment` | 人員指派（person, percentage） |
| `ComputedPhase` | 計算後的階段（含實際日期、totalAssignment） |
| `PersonAssignment` | 人員投入記錄（給人力甘特圖用） |
| `TimeRange` | 時間範圍（start, end） |
| `GanttScale` | 縮放設定（monthWidth, rowHeight） |

### Parsers (`shared/parser`)

| 函式 | 說明 |
|------|------|
| `parseText(text)` | 純文字 → `Project[]` |
| `serializeToText(projects)` | `Project[]` → 純文字 |
| `normalizeDate(date, isEnd?)` | 日期正規化（`2025-03` → `2025-03-01` 或月底） |
| `parseFrontmatter(text)` | 解析 frontmatter 區塊 |

### Composables (`shared/composables`)

| Composable | 輸入 | 輸出 |
|------------|------|------|
| `useGanttData(projects)` | `Ref<Project[]>` | `{ computedPhases, personAssignments, allPersons, timeRange }` |
| `useGanttScaleShared({ timeRange, scale })` | `Ref<TimeRange>`, `Ref<GanttScale>` | `{ months, totalWidth, getXPosition, getWidth, ... }` |

### CSS 變數 (`shared/styles/variables.css`)

| 類別 | 範例 |
|------|------|
| 背景色 | `--color-bg-primary`, `--color-bg-secondary` |
| 文字色 | `--color-text-primary`, `--color-text-secondary` |
| 強調色 | `--color-accent`, `--color-success`, `--color-error` |
| 甘特圖色 | `--gantt-color-1` ~ `--gantt-color-8`（含 `-light` 變體） |
| 間距 | `--spacing-xs` ~ `--spacing-2xl` |
| 圓角 | `--radius-sm` ~ `--radius-pill` |
| 陰影 | `--shadow-sm`, `--shadow-md`, `--shadow-lg` |
| 動畫 | `--transition-fast`, `--transition-normal`, `--transition-slow` |

### 元件

| 元件 | Props 模式 | Store 模式 |
|------|-----------|-----------|
| `ProjectGantt` | ✅ 傳入 computedPhases, projects, scale, barStyle, timeRange | ✅ 自動讀取 projectStore |
| `PersonGantt` | ✅ 傳入 personAssignments, allPersons, scale, barStyle, timeRange | ✅ 自動讀取 projectStore |
| `TextEditor` | ✅ v-model 雙向綁定 | — |
| `TableEditor` | ✅ :projects + @update:projects | — |

---

## 注意事項

- 元件的 scoped CSS 依賴 `shared/styles/variables.css` 中的 CSS 變數，務必確保已 import
- `ProjectGantt` 和 `PersonGantt` 的 `.month-header.year-even` / `.year-first` 樣式為非 scoped，外部專案需在全域 CSS 補上（參考 `border-collie/src/assets/main.css`）
- 外部專案不應直接使用 `src/stores/`，改用 shared composables 取得計算資料
