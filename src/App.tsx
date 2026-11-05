import { useState } from 'react'
import RevenueGrid from './RevenueGrid'
import { loadRevenueData, saveRevenueData } from './revenueData'
import type { ReportPeriod } from './revenueData'
import './App.css'

const reports = {
  week: {
    label: 'Last 7 days',
    revenue: '$12,840',
    orders: '186',
    customers: '124',
    conversion: '3.6%',
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  month: {
    label: 'Last 30 days',
    revenue: '$48,620',
    orders: '742',
    customers: '518',
    conversion: '3.8%',
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  },
}

const activity = [
  { name: 'Alex Morgan', initials: 'AM', action: 'Purchased the Pro plan', amount: '$49.00', time: '2 minutes ago' },
  { name: 'Jordan Lee', initials: 'JL', action: 'Purchased the Team plan', amount: '$129.00', time: '18 minutes ago' },
  { name: 'Sam Taylor', initials: 'ST', action: 'Purchased the Pro plan', amount: '$49.00', time: '42 minutes ago' },
  { name: 'Casey Chen', initials: 'CC', action: 'Purchased the Starter plan', amount: '$19.00', time: '1 hour ago' },
]

function App() {
  const [period, setPeriod] = useState<ReportPeriod>('week')
  const [revenueState, setRevenueState] = useState(loadRevenueData)
  const report = reports[period]
  const chart = revenueState.data[period]

  function updateRevenue(index: number, value: number) {
    const data = {
      ...revenueState.data,
      [period]: chart.map((existing, row) => row === index ? value : existing),
    }
    setRevenueState({ data, storageFailed: !saveRevenueData(data) })
  }

  const metrics = [
    { label: 'Total revenue', value: report.revenue },
    { label: 'Orders', value: report.orders },
    { label: 'New customers', value: report.customers },
    { label: 'Conversion rate', value: report.conversion },
  ]

  function exportReport() {
    const csv = [
      'Period,Metric,Value',
      ...metrics.map((metric) =>
        [report.label, metric.label, metric.value]
          .map((value) => `"${value.replaceAll('"', '""')}"`)
          .join(','),
      ),
    ].join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `dashboard-${period}.csv`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <aside className="sidebar">
        <a className="brand" href="#overview"><span className="brand-mark" aria-hidden="true">d.</span> dashboard</a>
        <p className="nav-label">WORKSPACE</p>
        <nav aria-label="Main navigation">
          <a className="nav-link" href="#overview">Overview</a>
          <a className="nav-link" href="#revenue">Revenue</a>
          <a className="nav-link" href="#revenue-data">Revenue data</a>
          <a className="nav-link" href="#activity">Recent activity</a>
        </nav>
        <p className="workspace-note">Your next big idea starts here.</p>
        <div className="profile"><span className="avatar">ME</span><div><strong>My workspace</strong><small>Personal dashboard</small></div></div>
      </aside>

      <main id="main">
        <header className="topbar"><span>Workspace / <strong>Overview</strong></span><span className="badge">Demo workspace</span></header>
        <div className="content">
          <section id="overview" aria-labelledby="overview-title">
            <div className="page-heading">
              <div><p className="eyebrow">YOUR BUSINESS AT A GLANCE</p><h1 id="overview-title">Overview</h1><p className="muted">Welcome back. Here&apos;s how things are looking.</p></div>
              <div className="toolbar">
                <label className="sr-only" htmlFor="period">Report period</label>
                <select id="period" value={period} onChange={(event) => {
                  const value = event.target.value
                  if (value === 'week' || value === 'month') setPeriod(value)
                }}>
                  <option value="week">Last 7 days</option>
                  <option value="month">Last 30 days</option>
                </select>
                <button onClick={exportReport}>Export report</button>
              </div>
            </div>
            <div className="metrics" aria-live="polite">
              {metrics.map((metric) => (
                <article className="card metric" key={metric.label}>
                  <h2>{metric.label}</h2><p className="metric-value">{metric.value}</p>
                  <p className="muted">{report.label}</p>
                </article>
              ))}
            </div>
          </section>

          <div className="details-grid">
            <section id="revenue" className="card revenue" aria-labelledby="revenue-title">
              <div className="section-heading"><div><h2 id="revenue-title">Revenue overview</h2><p className="muted">A little progress, every day.</p></div><span className="chart-legend">Revenue</span></div>
              <div className="chart" role="img" aria-label={`${report.label} relative revenue: ${report.labels.map((label, index) => `${label}: ${chart[index]} out of 100`).join(',')}. Illustrative sample data.`}>
                {chart.map((height, index) => (
                  <div className="chart-column" key={report.labels[index]}>
                    <div className="bar-track"><div className="bar" style={{ height: `${height}%` }} /></div>
                    <span>{report.labels[index]}</span>
                  </div>
                ))}
              </div>
              <p className="chart-note">Relative revenue by period, on a scale of 0 to 100. Edit the revenue data below to update this chart. Sample data, not live transactions.</p>
            </section>
            <section className="card getting-started" aria-labelledby="start-title">
              <span className="eyebrow">BUILT FOR WHAT&apos;S NEXT</span>
              <h2 id="start-title">Make it yours.</h2>
              <p>A fresh canvas for your next project. Your dashboard is ready to grow with you.</p>
              <ul><li>React + TypeScript</li><li>Fast development with Vite</li><li>Responsive, keyboard-friendly layout</li></ul>
              <a href="https://vite.dev/guide/" target="_blank" rel="noreferrer">Explore the Vite guide &rarr;</a>
            </section>
          </div>

          <section id="revenue-data" className="card revenue-data" aria-labelledby="revenue-data-title">
            <div className="section-heading"><div><h2 id="revenue-data-title">Revenue data</h2><p className="muted">{report.label}, shared with the revenue chart.</p></div><span className="badge">Editable sample data</span></div>
            <RevenueGrid key={period} labels={report.labels} values={chart} onUpdate={updateRevenue} />
            <p className={revenueState.storageFailed ? 'storage-status input-error' : 'storage-status muted'} role="status">
              {revenueState.storageFailed ? 'Local storage is unavailable. Changes work in this tab but will not be saved after a reload.' : 'Valid changes are saved automatically in this browser. Summary cards are separate sample metrics.'}
            </p>
          </section>

          <section id="activity" className="card activity" aria-labelledby="activity-title">
            <div className="section-heading"><div><h2 id="activity-title">Recent activity</h2><p className="muted">The latest from your workspace.</p></div><span className="badge">Sample data</span></div>
            <ul className="activity-list">
              {activity.map((item) => (
                <li key={item.name}><span className="avatar" aria-hidden="true">{item.initials}</span><div className="activity-person"><strong>{item.name}</strong><span>{item.action}</span></div><div className="activity-amount"><strong>{item.amount}</strong><span>{item.time}</span></div></li>
              ))}
            </ul>
          </section>
          <footer>My Test Dashboard <span>Built with React. Ready for your ideas.</span></footer>
        </div>
      </main>
    </div>
  )
}

export default App
