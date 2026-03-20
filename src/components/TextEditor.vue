<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'

const props = withDefaults(defineProps<{
    modelValue: string
}>(), {
    modelValue: ''
})

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>()

// 本地狀態：即時顯示用戶輸入
const localText = ref('')

// Debounce 更新：延遲 300ms 觸發解析和儲存
const debouncedUpdate = useDebounceFn((value: string) => {
    emit('update:modelValue', value)
}, 300)

// 監聽 prop 變化（切換 workspace 時同步）
watch(() => props.modelValue, (newValue) => {
    if (newValue !== localText.value) {
        localText.value = newValue
    }
}, { immediate: true })

// 處理輸入
function onInput(event: Event) {
    const value = (event.target as HTMLTextAreaElement).value
    localText.value = value
    debouncedUpdate(value)
}
</script>

<template>
  <div class="text-editor">
    <textarea
      :value="localText"
      @input="onInput"
      class="editor-textarea"
      placeholder="輸入專案資料...

格式範例:
AI OCR:
- BA, 2025-10-01, 2025-11-30: Andy 0.3, Ben 0.8
- SA, --, 2026-02: Andy 0.3, Danny 0.6"
      spellcheck="false"
    ></textarea>
  </div>
</template>

<style scoped>
.text-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-textarea {
  flex: 1;
  font-size: 13px;
  line-height: 1.8;
  tab-size: 2;
}

.editor-textarea::placeholder {
  color: var(--color-text-muted);
  opacity: 0.6;
}
</style>
