export default function PolicyDoc({ inputs, result, forecast }) {
  if (!result || !forecast?.length) return (
    <div style={{ color:'var(--hint)', fontSize: 13, padding: 20 }}>
      Adjust sliders to generate report.
    </div>
  )

  const adoptionAvg  = forecast.reduce((s, r) => s + (r.adoption / 100), 0) / 12
  const diversion12m = Math.round(adoptionAvg * 14400).toLocaleString()
  const totalBudget  = forecast.reduce((s, r) => s + r.budget, 0)
  const budget12m    = (totalBudget - (8.5 * 12)).toFixed(1)
  const today        = new Date().toLocaleDateString('en-IN', { dateStyle:'long' })

  const fiRec = inputs.fi < 3
    ? '⚠ Expand financial incentives. FI is below the effective threshold (β=+0.216). A deposit-refund scheme of ₹5–10/kg is recommended.'
    : '✓ Incentive levels are in the effective range. Consider ward-level performance bonuses to sustain momentum.'

  const pcRec = inputs.pc > 3.5
    ? '⚠ Privacy concern is elevated (β=−0.115 on RI). Launch a public transparency campaign explaining data handling before rollout.'
    : '✓ Privacy concern is manageable. Standard disclosure notices are sufficient.'

  const md = `## Circular Policy — Policy Simulation Report
Generated: ${today} | Model: XGBoost (Accuracy: 81.2%) | SEM: CFI=0.936, RMSEA=0.062

---

### Executive Summary
Predicted adoption probability: **${(result.probability*100).toFixed(1)}%** (${result.label}, ${result.confidence} confidence)
12-month projected diversion: **${diversion12m} tonnes** | Net cost: **₹${budget12m} lakh**

---

### Policy Lever Analysis

**Financial Incentives (FI = ${inputs.fi.toFixed(1)}/5.0)**
${fiRec}

**Privacy Concern (PC = ${inputs.pc.toFixed(1)}/5.0)**
${pcRec}

---

### SEM Validation
| Path | β | Significance |
|------|---|---|
| FI → RI (direct) | +0.216 | *** |
| PC → RI (direct) | −0.115 | * |
| ATT → RI | +0.411 | ** |
| PBC → RI | +0.402 | *** |
| AW → PBC | +0.769 | *** |

*Based on n=252, India urban sample. All projections are simulation estimates.*`

  const download = () => {
    const blob = new Blob([md], { type:'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `circular_policy_report_${Date.now()}.txt`
    a.click()
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom: 16 }}>
        <button onClick={download} style={{
          background:'var(--surface)', border:'1px solid var(--border)',
          color:'var(--text)', borderRadius: 8, padding:'8px 16px',
          fontSize: 13, cursor:'pointer', fontWeight: 500
        }}>⬇ Download report</button>
      </div>
      
      <div style={{
        background:'var(--white)', border:'1px solid var(--border)',
        borderRadius: 16, padding: '32px 40px', color:'var(--text)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
      }}>
        {/* Header */}
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 20, marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-0.02em', color: 'var(--text)' }}>
            Circular Policy — Policy Simulation Report
          </h2>
          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--hint)' }}>
            <span>Generated: {today}</span>
            <span>•</span>
            <span>Model: XGBoost (Accuracy: 81.2%)</span>
            <span>•</span>
            <span>SEM: CFI=0.936, RMSEA=0.062</span>
          </div>
        </div>

        {/* Executive Summary */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--hint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Executive Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div style={{ background: 'var(--surface)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--hint)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Predicted Adoption</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--green)' }}>
                {(result.probability*100).toFixed(1)}%
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                {result.label} ({result.confidence})
              </div>
            </div>
            <div style={{ background: 'var(--surface)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--hint)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Projected Diversion</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--green)' }}>
                {diversion12m} <span style={{ fontSize: 14, fontWeight: 500 }}>tonnes</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                Over 12 months
              </div>
            </div>
            <div style={{ background: 'var(--surface)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--hint)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Budget Impact</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: budget12m > 0 ? 'var(--red)' : 'var(--amber)' }}>
                ₹{budget12m} <span style={{ fontSize: 14, fontWeight: 500 }}>lakh</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                Relative to baseline
              </div>
            </div>
          </div>
        </div>

        {/* Policy Lever Analysis */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--hint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Policy Lever Analysis</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 12, background: inputs.fi < 3 ? '#fdf0ef' : 'var(--green-lt)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>Financial Incentives (FI)</span>
                <span style={{ fontWeight: 600, color: inputs.fi < 3 ? 'var(--red)' : 'var(--green)', background: 'var(--white)', padding: '2px 8px', borderRadius: 6, fontSize: 12, border: '1px solid var(--border)' }}>
                  {inputs.fi.toFixed(1)} / 5.0
                </span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
                {fiRec}
              </div>
            </div>
            
            <div style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 12, background: inputs.pc > 3.5 ? '#fdf0ef' : 'var(--green-lt)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>Privacy Concern (PC)</span>
                <span style={{ fontWeight: 600, color: inputs.pc > 3.5 ? 'var(--red)' : 'var(--green)', background: 'var(--white)', padding: '2px 8px', borderRadius: 6, fontSize: 12, border: '1px solid var(--border)' }}>
                  {inputs.pc.toFixed(1)} / 5.0
                </span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
                {pcRec}
              </div>
            </div>
          </div>
        </div>

        {/* SEM Validation */}
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--hint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SEM Validation</h3>
          <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--surface)' }}>
                  <th style={{ padding: '12px 16px', color: 'var(--hint)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>Path</th>
                  <th style={{ padding: '12px 16px', color: 'var(--hint)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>β Coefficient</th>
                  <th style={{ padding: '12px 16px', color: 'var(--hint)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>Significance</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['FI → RI (direct)', '+0.216', '***'],
                  ['PC → RI (direct)', '−0.115', '*'],
                  ['ATT → RI', '+0.411', '**'],
                  ['PBC → RI', '+0.402', '***'],
                  ['AW → PBC', '+0.769', '***'],
                ].map(([path, beta, sig], i) => (
                  <tr key={i} style={{ borderBottom: i !== 4 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500, fontFamily: 'var(--mono)', color: 'var(--text)' }}>{path}</td>
                    <td style={{ padding: '12px 16px', color: beta.startsWith('+') ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--mono)' }}>{beta}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{sig}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: 'var(--hint)', textAlign: 'right' }}>
            *Based on n=252, India urban sample. All projections are simulation estimates.
          </div>
        </div>

      </div>
    </div>
  )
}