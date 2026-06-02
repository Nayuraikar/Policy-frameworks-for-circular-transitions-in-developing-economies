import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import KPIRow from './components/KPIRow'
import ForecastChart from './components/ForecastChart'
import PolicyDoc from './components/PolicyDoc'
import './index.css'

const DEFAULTS = { fi:3.5, pc:2.8, ec:3.7, aw:3.25, age_num:2, edu_num:2, prior_exp:2 }
const TABS = ['Forecast Simulation','Policy Document','SEM Diagnostics']

export default function App() {
  const [inputs,   setInputs]  = useState(DEFAULTS)
  const [result,   setResult]  = useState(null)
  const [loading,  setLoading] = useState(false)
  const [error,    setError]   = useState(null)
  const [tab,      setTab]     = useState(0)

  const runPrediction = useCallback(async (inp) => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(inp)
      })
      if (!res.ok) throw new Error(`API error ${res.status}`)
      setResult(await res.json())
    } catch(e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounce: wait 400ms after last slider move before calling API
  useEffect(() => {
    const t = setTimeout(() => runPrediction(inputs), 400)
    return () => clearTimeout(t)
  }, [inputs, runPrediction])

  const onChange = (key, val) => setInputs(p => ({ ...p, [key]: val }))

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar inputs={inputs} onChange={onChange} />

      <main style={{ flex:1, padding:'28px 32px', overflowY:'auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing:'-0.01em' }}>
            Circular Policy
            <span style={{ fontWeight:400, color:'var(--hint)', fontSize:16 }}>
              {' '}— Circular Policy Simulator
            </span>
          </h1>
          <p style={{ fontSize: 13, color:'var(--hint)', marginTop: 4 }}>
            SEM-validated · XGBoost 81.2% · n=252 India urban
          </p>
        </div>

        {error && (
          <div style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)',
                        color:'var(--red)', borderRadius:8, padding:'10px 14px',
                        marginBottom:20, fontSize:13 }}>
            ⚠ API error: {error} — is the FastAPI server running on port 8000?
          </div>
        )}

        <KPIRow result={result} loading={loading} />

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, background:'var(--surface2)',
                      padding:4, borderRadius:10, marginBottom:24, width:'fit-content' }}>
          {TABS.map((t,i) => (
            <button key={i} onClick={() => setTab(i)} style={{
              background: tab===i ? 'var(--surface)' : 'transparent',
              border: tab===i ? '1px solid var(--border)' : '1px solid transparent',
              color: tab===i ? 'var(--text)' : 'var(--hint)',
              borderRadius:8, padding:'7px 18px', fontSize:13,
              cursor:'pointer', fontWeight: tab===i ? 500 : 400,
              transition:'all 0.15s'
            }}>{t}</button>
          ))}
        </div>

        {tab === 0 && <ForecastChart forecast={result?.forecast} />}
        {tab === 1 && <PolicyDoc inputs={inputs} result={result} forecast={result?.forecast} />}
        {tab === 2 && <Diagnostics />}
      </main>
    </div>
  )
}

function Diagnostics() {
  const tooltips = {
    'EC': "Environmental Concern: Citizens' care for local environmental issues.",
    'AW': "Policy Awareness: How well citizens know about local recycling schemes.",
    'FI': "Financial Incentives: Rebates, tax breaks, or deposit-refund schemes.",
    'PC': "Privacy Concern: Citizens' worry about data tracking.",
    'ATT': "Attitude: Overall positive feeling towards recycling.",
    'PBC': "Perceived Behavioral Control: How capable citizens feel they are to recycle. Boosted heavily by awareness campaigns.",
    'RI': "Recycling Intention: The predicted adoption probability."
  }

  const renderPath = (path) => {
    const parts = path.split(' → ')
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className="tooltip-container" data-tip={tooltips[parts[0]]}>{parts[0]}</span>
        <span style={{ color: 'var(--hint)', fontSize: 10 }}>→</span>
        <span className="tooltip-container" data-tip={tooltips[parts[1]]}>{parts[1]}</span>
      </div>
    )
  }

  const rows = [
    ['EC → ATT', '+0.483', 'High',     '✓'],
    ['AW → ATT', '+0.320', 'High',     '✓'],
    ['FI → ATT', '+0.118', 'Low',      '✓'],
    ['PC → ATT', '−0.150', 'Medium',   '✓'],
    ['AW → PBC', '+0.769', 'High',     '✓'],
    ['FI → PBC', '+0.145', 'Medium',   '✓'],
    ['EC → PBC', '+0.050', 'Not Sig.', '✗'],
    ['ATT → RI', '+0.411', 'Medium',   '✓'],
    ['PBC → RI', '+0.402', 'High',     '✓'],
    ['FI → RI',  '+0.216', 'High',     '✓'],
    ['PC → RI',  '−0.115', 'Low',      '✓'],
  ]
  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)',
                  borderRadius:12 }}>
      <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)',
                    fontSize:12, color:'var(--muted)', letterSpacing:'0.07em',
                    textTransform:'uppercase' }}>
        SEM path coefficients — lavaan output (n=252)
        <span style={{ marginLeft: 10, fontSize: 10, fontWeight: 400, textTransform: 'none', color: 'var(--hint)' }}>
          (Hover over acronyms for details)
        </span>
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
        <thead>
          <tr style={{ background:'var(--white)' }}>
            {['Path','β','Sig.','Supported'].map(h => (
              <th key={h} style={{ padding:'10px 20px', textAlign:'left',
                                   color:'var(--hint)', fontWeight:500,
                                   fontSize:11, textTransform:'uppercase',
                                   letterSpacing:'0.06em' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([path,beta,sig,sup]) => (
            <tr key={path} style={{ borderTop:'1px solid var(--border)' }}>
              <td style={{ padding:'10px 20px', fontFamily:'monospace', color:'var(--text)' }}>
                {renderPath(path)}
              </td>
              <td style={{ padding:'10px 20px', color: beta.startsWith('+') ? 'var(--green)' : 'var(--red)', fontFamily:'monospace' }}>{beta}</td>
              <td style={{ padding:'10px 20px', color:'var(--muted)' }}>{sig}</td>
              <td style={{ padding:'10px 20px', color: sup==='✓' ? 'var(--green)' : 'var(--red)' }}>{sup}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ padding:'12px 20px', fontSize:11, color:'var(--hint)',
                    borderTop:'1px solid var(--border)' }}>
        CFI=0.936 · TLI=0.930 · RMSEA=0.062 · SRMR=0.040 · R²(RI)=0.740
      </div>
    </div>
  )
}