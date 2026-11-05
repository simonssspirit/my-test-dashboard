import { useState } from 'react'
import { isRevenueValue } from './revenueData'

type RevenueGridProps = {
  labels: string[]
  values: number[]
  onUpdate: (index: number, value: number) => void
}

function RevenueGrid({ labels, values, onUpdate }: RevenueGridProps) {
  const [drafts, setDrafts] = useState(() => values.map(String))

  return (
    <div className="revenue-grid">
      <p id="revenue-grid-help" className="muted">Edit a value from 0 to 100 to update the chart immediately. Invalid edits keep the last valid chart value.</p>
      <table>
        <caption className="sr-only">Editable relative revenue data</caption>
        <thead><tr><th scope="col">Period</th><th scope="col">Relative revenue (0–100)</th></tr></thead>
        <tbody>
          {labels.map((label, index) => {
            const draft = drafts[index]
            const invalid = draft.trim() === '' || !isRevenueValue(Number(draft))
            const errorId = `revenue-error-${index}`

            return (
              <tr key={label}>
                <th scope="row">{label}</th>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="any"
                    required
                    aria-label={`${label} relative revenue`}
                    aria-invalid={invalid}
                    aria-describedby={`revenue-grid-help${invalid ? ` ${errorId}` : ''}`}
                    value={draft}
                    onChange={(event) => {
                      const next = event.target.value
                      setDrafts((current) => current.map((value, row) => row === index ? next : value))
                      const value = Number(next)
                      if (next.trim() !== '' && isRevenueValue(value)) onUpdate(index, value)
                    }}
                  />
                  {invalid && <p id={errorId} className="input-error" role="alert">Enter a number from 0 to 100.</p>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default RevenueGrid
