/**
 * BorderCollie - Shared Gantt Data Composable
 *
 * 從 Project[] 計算甘特圖所需的衍生資料
 * 可被 Sheltie 等外部專案引用
 */

import { computed, type Ref, type ComputedRef } from 'vue'
import type { Project, ComputedPhase, PersonAssignment, TimeRange } from '../types'
import { normalizeDate } from '../parser/textParser'

function getNextDay(date: string): string {
  const d = new Date(normalizeDate(date, true))
  d.setDate(d.getDate() + 1)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function useGanttData(projects: Ref<Project[]> | ComputedRef<Project[]>) {
  const computedPhases = computed<ComputedPhase[]>(() => {
    const result: ComputedPhase[] = []
    const activeProjects = projects.value.filter(p => !p.pending)

    activeProjects.forEach((project, projectIndex) => {
      let previousEndDate: string | null = null

      project.phases.forEach((phase) => {
        let startDate: string
        if (phase.startDate) {
          startDate = phase.startDate
        } else if (previousEndDate) {
          startDate = getNextDay(previousEndDate)
        } else {
          startDate = phase.endDate
        }

        const totalAssignment = phase.assignments.reduce(
          (sum, a) => sum + a.percentage, 0
        )
        const isContinuation = !phase.startDate && !!previousEndDate

        result.push({
          ...phase,
          projectName: project.name,
          projectIndex,
          startDate,
          totalAssignment,
          isContinuation
        })

        previousEndDate = phase.endDate
      })
    })

    return result
  })

  const personAssignments = computed<PersonAssignment[]>(() => {
    const result: PersonAssignment[] = []
    computedPhases.value.forEach(phase => {
      phase.assignments.forEach(a => {
        result.push({
          person: a.person,
          projectName: phase.projectName,
          projectIndex: phase.projectIndex,
          phaseName: phase.name,
          startDate: phase.startDate,
          endDate: phase.endDate,
          percentage: a.percentage,
          isContinuation: phase.isContinuation
        })
      })
    })
    return result
  })

  const allPersons = computed<string[]>(() => {
    const s = new Set<string>()
    projects.value.forEach(p =>
      p.phases.forEach(ph =>
        ph.assignments.forEach(a => s.add(a.person))
      )
    )
    return Array.from(s).sort()
  })

  const timeRange = computed<TimeRange>(() => {
    if (computedPhases.value.length === 0) {
      const now = new Date()
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 12, 0)
      }
    }
    let min = new Date('2099-12-31'), max = new Date('2000-01-01')
    computedPhases.value.forEach(p => {
      const s = new Date(normalizeDate(p.startDate))
      const e = new Date(normalizeDate(p.endDate, true))
      if (s < min) min = s
      if (e > max) max = e
    })
    min.setMonth(min.getMonth() - 1)
    max.setMonth(max.getMonth() + 1)
    return { start: min, end: max }
  })

  return { computedPhases, personAssignments, allPersons, timeRange }
}
