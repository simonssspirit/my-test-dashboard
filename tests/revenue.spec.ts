import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const storageKey = 'my-test-dashboard:revenue:v1'
const week = [42, 64, 51, 82, 67, 94, 76]
const month = [54, 72, 65, 92]
const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const monthLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4']

async function expectChart(page: Page, labels: string[], values: number[]) {
  const chart = page.getByRole('img', { name: /relative revenue/ })
  for (const [index, value] of values.entries()) {
    await expect(chart).toHaveAccessibleName(new RegExp(`${labels[index]}: ${value} out of 100`))
    const trackHeight = await chart.locator('.bar-track').nth(index).evaluate((track) => track.clientHeight)
    const bounds = await chart.locator('.bar').nth(index).boundingBox()
    expect(bounds!.height).toBeCloseTo(trackHeight * value / 100, 1)
  }
}

test('shows the existing sample data in an editable grid and matching chart', async ({ page }) => {
  await page.goto('/')
  const table = page.getByRole('table', { name: 'Editable relative revenue data' })
  await expect(table.getByRole('spinbutton')).toHaveCount(7)
  for (const [index, value] of week.entries()) {
    await expect(page.getByRole('spinbutton', { name: `${weekLabels[index]} relative revenue`, exact: true })).toHaveValue(String(value))
  }
  await expectChart(page, weekLabels, week)
})

test('updates every weekly row immediately, saves each edit, and restores after reload', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.setItem('unrelated-setting', 'keep-me'))
  const edited = [0, 100, 12.5, 25, 75, 50, 99]
  for (const [index, value] of edited.entries()) {
    await page.getByRole('spinbutton', { name: `${weekLabels[index]} relative revenue`, exact: true }).fill(String(value))
    await expectChart(page, weekLabels.slice(0, index + 1), edited.slice(0, index + 1))
    expect(await page.evaluate(({ key, row }) => JSON.parse(localStorage.getItem(key)!).week[row], { key: storageKey, row: index })).toBe(value)
  }
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), storageKey)).toEqual({
    version: 1, week: edited, month,
  })
  await page.reload()
  await expectChart(page, weekLabels, edited)
  for (const [index, value] of edited.entries()) {
    await expect(page.getByRole('spinbutton', { name: `${weekLabels[index]} relative revenue`, exact: true })).toHaveValue(String(value))
  }
  expect(await page.evaluate(() => localStorage.getItem('unrelated-setting'))).toBe('keep-me')
})

test('keeps weekly and monthly edits independent across repeated switches and reloads', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('spinbutton', { name: 'Mon relative revenue', exact: true }).fill('23')
  await page.getByLabel('Report period').selectOption('month')
  await expectChart(page, monthLabels, month)
  const editedMonth = [10, 20, 30, 40]
  for (const [index, value] of editedMonth.entries()) {
    await page.getByRole('spinbutton', { name: `${monthLabels[index]} relative revenue`, exact: true }).fill(String(value))
  }
  await expectChart(page, monthLabels, editedMonth)
  await page.getByLabel('Report period').selectOption('week')
  await expect(page.getByRole('spinbutton', { name: 'Mon relative revenue', exact: true })).toHaveValue('23')
  await page.getByRole('spinbutton', { name: 'Mon relative revenue', exact: true }).fill('24')
  await page.reload()
  await expectChart(page, weekLabels, [24, ...week.slice(1)])
  await page.getByLabel('Report period').selectOption('month')
  await expectChart(page, monthLabels, editedMonth)
})

test('retains valid data while cells are empty or out of range, then accepts corrections', async ({ page }) => {
  await page.goto('/')
  const monday = page.getByRole('spinbutton', { name: 'Mon relative revenue', exact: true })
  const tuesday = page.getByRole('spinbutton', { name: 'Tue relative revenue', exact: true })
  await monday.fill('60')
  for (const invalid of ['', '-1', '101']) {
    await monday.fill(invalid)
    await expect(monday).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByRole('alert')).toContainText('Enter a number from 0 to 100.')
    await expectChart(page, weekLabels, [60, ...week.slice(1)])
    expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).week[0], storageKey)).toBe(60)
  }
  await tuesday.fill('')
  await expect(page.getByRole('alert')).toHaveCount(2)
  await monday.fill('0')
  await expect(monday).toHaveAttribute('aria-invalid', 'false')
  await expect(page.getByRole('alert')).toHaveCount(1)
  await page.getByLabel('Report period').selectOption('month')
  await page.getByLabel('Report period').selectOption('week')
  await expect(tuesday).toHaveValue('64')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await monday.fill('')
  await page.reload()
  await expect(monday).toHaveValue('0')
  await expectChart(page, weekLabels, [0, ...week.slice(1)])
})

for (const [name, raw] of [
  ['malformed JSON', '{broken'],
  ['null', 'null'],
  ['wrong version', JSON.stringify({ version: 2, week, month })],
  ['missing period', JSON.stringify({ version: 1, week })],
  ['short series', JSON.stringify({ version: 1, week: [1], month })],
  ['long series', JSON.stringify({ version: 1, week: [...week, 1], month })],
  ['numeric string', JSON.stringify({ version: 1, week: ['42', ...week.slice(1)], month })],
  ['null cell', JSON.stringify({ version: 1, week, month: [null, ...month.slice(1)] })],
  ['negative value', JSON.stringify({ version: 1, week: [-1, ...week.slice(1)], month })],
  ['value above scale', JSON.stringify({ version: 1, week, month: [101, ...month.slice(1)] })],
  ['non-finite value', '{"version":1,"week":[1e400,64,51,82,67,94,76],"month":[54,72,65,92]}'],
]) {
  test(`recovers safely from saved ${name}`, async ({ page }) => {
    await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: storageKey, value: raw })
    await page.goto('/')
    await expectChart(page, weekLabels, week)
    await page.getByLabel('Report period').selectOption('month')
    await expectChart(page, monthLabels, month)
    await page.getByRole('spinbutton', { name: 'Week 1 relative revenue', exact: true }).fill('55')
    expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), storageKey)).toEqual({
      version: 1, week, month: [55, ...month.slice(1)],
    })
  })
}

test('keeps editing usable when reading and writing local storage are blocked', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() { throw new DOMException('Storage blocked', 'SecurityError') },
    })
  })
  await page.goto('/')
  await expect(page.getByRole('status')).toContainText('Local storage is unavailable')
  await page.getByRole('spinbutton', { name: 'Mon relative revenue', exact: true }).fill('15')
  await expectChart(page, weekLabels, [15, ...week.slice(1)])
  await expect(page.getByRole('status')).toContainText('will not be saved after a reload')
  await page.reload()
  await expectChart(page, weekLabels, week)
})

test('retains loaded data and reports write failures, then resumes saving if storage recovers', async ({ page }) => {
  await page.addInitScript(({ key, data }) => {
    localStorage.setItem(key, JSON.stringify(data))
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (key === 'my-test-dashboard:revenue:v1' && !sessionStorage.getItem('allow-revenue-save')) {
        throw new DOMException('Quota exceeded', 'QuotaExceededError')
      }
      original.call(this, key, value)
    }
  }, { key: storageKey, data: { version: 1, week: [35, ...week.slice(1)], month } })
  await page.goto('/')
  await expectChart(page, weekLabels, [35, ...week.slice(1)])
  await page.getByRole('spinbutton', { name: 'Mon relative revenue', exact: true }).fill('36')
  await expectChart(page, weekLabels, [36, ...week.slice(1)])
  await expect(page.getByRole('status')).toContainText('Local storage is unavailable')
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).week[0], storageKey)).toBe(35)
  await page.evaluate(() => sessionStorage.setItem('allow-revenue-save', 'yes'))
  await page.getByRole('spinbutton', { name: 'Tue relative revenue', exact: true }).fill('37')
  await expect(page.getByRole('status')).toContainText('saved automatically')
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).week, storageKey)).toEqual([36, 37, ...week.slice(2)])
})

test('supports keyboard editing and keeps the grid within a narrow mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto('/')
  const monday = page.getByRole('spinbutton', { name: 'Mon relative revenue', exact: true })
  await monday.focus()
  await monday.press('ArrowUp')
  await expect(monday).toHaveValue('43')
  await monday.press('Tab')
  await expect(page.getByRole('spinbutton', { name: 'Tue relative revenue', exact: true })).toBeFocused()
  await expectChart(page, weekLabels, [43, ...week.slice(1)])
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
})

test('preserves summary cards and the existing selected-period CSV export', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Report period').selectOption('month')
  await page.getByRole('spinbutton', { name: 'Week 1 relative revenue', exact: true }).fill('80')
  await expect(page.getByText('$48,620', { exact: true })).toBeVisible()
  const downloaded = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export report' }).click()
  const download = await downloaded
  expect(download.suggestedFilename()).toBe('dashboard-month.csv')
  const stream = await download.createReadStream()
  const chunks: Buffer[] = []
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk))
  const csv = Buffer.concat(chunks).toString()
  expect(csv).toContain('"Last 30 days","Total revenue","$48,620"')
  expect(csv).toContain('"Last 30 days","Orders","742"')
})
