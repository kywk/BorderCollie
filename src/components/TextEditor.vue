<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'

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

// 手動 debounce（可 cancel）
let timer: ReturnType<typeof setTimeout> | null = null
function cancelPending() { if (timer) { clearTimeout(timer); timer = null } }
function scheduleEmit(value: string) {
    cancelPending()
    timer = setTimeout(() => { timer = null; emit('update:modelValue', value) }, 300)
}
onUnmounted(cancelPending)

// 監聽 prop 變化（外部更新時同步，cancel pending 避免舊值覆蓋）
watch(() => props.modelValue, (newValue) => {
    if (newValue !== localText.value) {
        cancelPending()
        localText.value = newValue
    }
}, { immediate: true })

// 處理輸入
function onInput(event: Event) {
    const value = (event.target as HTMLTextAreaElement).value
    localText.value = value
    scheduleEmit(value)
}

// blur 時立刻 flush pending 變更（避免切換 tab 後資料不同步）
function onBlur() {
    cancelPending()
    if (localText.value !== props.modelValue) {
        emit('update:modelValue', localText.value)
    }
}
</script>

<template>
  <div class="text-editor">
    <textarea
      :value="localText"
      @input="onInput"
      @blur="onBlur"
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
