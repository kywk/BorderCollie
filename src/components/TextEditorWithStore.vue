<!--
  TextEditorWithStore.vue
  Store wrapper for TextEditor — used internally by border-collie's EditorPanel.
  This keeps border-collie independently runnable while TextEditor itself is props-based.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import TextEditor from './TextEditor.vue'

const store = useProjectStore()

const modelValue = computed(() => store.rawText)

function onUpdate(value: string) {
    store.updateText(value)
}
</script>

<template>
  <TextEditor :model-value="modelValue" @update:model-value="onUpdate" />
</template>
