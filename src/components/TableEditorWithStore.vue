<!--
  TableEditorWithStore.vue
  Store wrapper for TableEditor — used internally by border-collie's EditorPanel.
  This keeps border-collie independently runnable while TableEditor itself is props-based.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { serializeToText } from '@/shared/parser/serializer'
import type { Project } from '@/shared/types'
import TableEditor from './TableEditor.vue'

const store = useProjectStore()

const projects = computed(() => store.projects)

function onUpdateProjects(updated: Project[]) {
    // Serialize back to text and update store (triggers all reactive updates)
    const text = serializeToText(updated)
    store.updateText(text)
}
</script>

<template>
  <TableEditor :projects="projects" @update:projects="onUpdateProjects" />
</template>
