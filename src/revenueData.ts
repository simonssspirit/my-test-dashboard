export const revenueStorageKey = 'my-test-dashboard:revenue:v1'

export const defaultRevenueData = {
  week: [42, 64, 51, 82, 67, 94, 76],
  month: [54, 72, 65, 92],
}

export type RevenueData = typeof defaultRevenueData
export type ReportPeriod = keyof RevenueData

export function isRevenueValue(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100
}

function isRevenueSeries(value: unknown, length: number): value is number[] {
  return Array.isArray(value) && value.length === length && value.every(isRevenueValue)
}

export function loadRevenueData(): { data: RevenueData; storageFailed: boolean } {
  let raw: string | null
  try {
    raw = localStorage.getItem(revenueStorageKey)
  } catch {
    return { data: defaultRevenueData, storageFailed: true }
  }

  try {
    const stored: unknown = JSON.parse(raw ?? 'null')
    if (
      stored !== null && typeof stored === 'object' &&
      'version' in stored && stored.version === 1 &&
      'week' in stored && isRevenueSeries(stored.week, defaultRevenueData.week.length) &&
      'month' in stored && isRevenueSeries(stored.month, defaultRevenueData.month.length)
    ) {
      return { data: { week: stored.week, month: stored.month }, storageFailed: false }
    }
  } catch {
    // Invalid saved data must not prevent the dashboard from loading.
  }
  return { data: defaultRevenueData, storageFailed: false }
}

export function saveRevenueData(data: RevenueData): boolean {
  try {
    localStorage.setItem(revenueStorageKey, JSON.stringify({ version: 1, ...data }))
    return true
  } catch {
    return false
  }
}
