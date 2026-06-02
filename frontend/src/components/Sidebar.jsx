export default function Sidebar({ inputs, onChange }) {

  const Slider = ({ k, label, min, max, step, low, high, hint }) => {
    const pct = ((inputs[k] - min) / (max - min)) * 100
    const color = k === 'pc'
      ? (inputs[k] > 3.5 ? '#c0392b' : '#3d7a3a')
      : '#3d7a3a'
    return (
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{label}</span>
          <span style={{
            fontSize: 12, fontWeight: 600,
            background: k === 'pc' && inputs[k] > 3.5 ? '#fdf0ef' : 'var(--green-lt)',
            color,
            padding: '2px 10px', borderRadius: 20,
            border: `1px solid ${k === 'pc' && inputs[k] > 3.5 ? '#f5c0bb' : 'var(--green-md)'}`,
            minWidth: 36, textAlign: 'center'
          }}>{inputs[k].toFixed(1)}</span>
        </div>
        <div style={{ position: 'relative' }}>
          <input
            type="range" min={min} max={max} step={step}
            value={inputs[k]}
            style={{ '--pct': `${pct}%` }}
            onChange={e => onChange(k, parseFloat(e.target.value))}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--hint)' }}>{low}</span>
          <span style={{ fontSize: 11, color: 'var(--hint)' }}>{high}</span>
        </div>
        {hint && (
          <div style={{
            marginTop: 6, fontSize: 11.5, color: 'var(--muted)',
            background: 'var(--surface)', borderRadius: 6,
            padding: '4px 8px', lineHeight: 1.4
          }}>{hint}</div>
        )}
      </div>
    )
  }

  const Select = ({ k, label, options }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 5, fontWeight: 500 }}>{label}</div>
      <div style={{ position: 'relative' }}>
        <select value={inputs[k]} onChange={e => onChange(k, parseInt(e.target.value))}>
          {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <span style={{
          position: 'absolute', right: 10, top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 10, color: 'var(--hint)', pointerEvents: 'none'
        }}>▾</span>
      </div>
    </div>
  )

  return (
    <aside style={{
      width: 260, flexShrink: 0,
      background: 'var(--white)',
      borderRight: '1px solid var(--border)',
      height: '100vh', overflowY: 'auto',
      position: 'sticky', top: 0,
      display: 'flex', flexDirection: 'column'
    }}>
      {/* Logo strip */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'var(--green)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: 16, color: 'var(--white)', flexShrink: 0
        }}>♻</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>Circular Policy</div>
          <div style={{ fontSize: 11, color: 'var(--hint)' }}>Policy simulator · India</div>
        </div>
      </div>

      <div style={{ padding: '20px 20px 0', flex: 1 }}>

        {/* Section: Policy levers */}
        <div style={{
          fontSize: 10, fontWeight: 600, color: 'var(--hint)',
          textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 16
        }}>Policy levers</div>

        <Slider k="fi" label="Financial incentives" min={1} max={5} step={0.1}
          low="No incentives" high="High rebates"
          hint="Deposit-refund schemes, tax breaks — directly boosts recycling intention" />

        <Slider k="pc" label="Privacy concern" min={1} max={5} step={0.1}
          low="Low concern" high="High concern"
          hint="Citizens' worry about data tracking — acts as a barrier to participation" />

        <Slider k="ec" label="Environmental concern" min={1} max={5} step={0.1}
          low="Low" high="High"
          hint="How strongly citizens care about environmental issues in their area" />

        <Slider k="aw" label="Policy awareness" min={1} max={5} step={0.1}
          low="Unaware" high="Fully aware"
          hint="How well citizens know about local recycling schemes" />

        {/* Section: Demographics */}
        <div style={{
          fontSize: 10, fontWeight: 600, color: 'var(--hint)',
          textTransform: 'uppercase', letterSpacing: '0.09em',
          margin: '20px 0 14px'
        }}>Citizen profile</div>

        <Select k="age_num" label="Age group"
          options={[[1,'18–25 years'],[2,'26–35 years'],[3,'36–45 years'],[4,'46 and above']]} />
        <Select k="edu_num" label="Education level"
          options={[[1,'High school'],[2,'Undergraduate'],[3,'Postgraduate'],[4,'PhD']]} />
        <Select k="prior_exp" label="Prior recycling experience"
          options={[[1,'No experience'],[2,'Sometimes recycles'],[3,'Regular recycler']]} />
      </div>

      {/* Footer */}
      <div style={{
        padding: '14px 20px',
        borderTop: '1px solid var(--border)',
        fontSize: 11, color: 'var(--hint)', lineHeight: 1.5
      }}>
        Based on SEM study · n=252 · India urban centres
      </div>
    </aside>
  )
}