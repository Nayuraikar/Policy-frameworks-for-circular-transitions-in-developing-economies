import {
  ComposedChart, Area, Bar,
  Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'

const tip = {
  contentStyle: {
    background:'#1a1e2a', border:'1px solid #252a38',
    borderRadius: 8, fontSize: 12, color:'#e2e6f0'
  },
  cursor: { stroke:'#252a38' }
}

export default function ForecastChart({ forecast }) {
  if (!forecast?.length) return null
  
  // Add BAU baseline (month 1 value) to all data points
  const data = forecast.map(d => ({
    ...d,
    bau_adoption: forecast[0].adoption,
    bau_diversion: forecast[0].diversion,
    bau_budget: forecast[0].budget
  }))

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 20, marginBottom: 28 }}>

      {/* Adoption rate */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)',
                    borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 12, color:'var(--muted)', marginBottom: 14,
                      textTransform:'uppercase', letterSpacing:'0.07em', display: 'flex', justifyContent: 'space-between' }}>
          <span>Recycling adoption rate (%)</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, textTransform: 'none', fontSize: 11 }}>
            <div style={{ width: 12, height: 2, borderTop: '2px dashed #6b7591' }} /> BAU Baseline
          </span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="gblue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f8ef7" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#4f8ef7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1a1e2a" vertical={false}/>
            <XAxis dataKey="month" tick={{ fill:'#6b7591', fontSize:11 }}
                   axisLine={false} tickLine={false} label={{ value:'Month', position:'insideBottom', offset:-2, fill:'#6b7591', fontSize:11 }}/>
            <YAxis tick={{ fill:'#6b7591', fontSize:11 }}
                   axisLine={false} tickLine={false} domain={[0,100]} unit="%"/>
            <Tooltip {...tip} formatter={(v, n) => {
              if (n === 'bau_adoption') return [`${v}%`, 'Business As Usual']
              return [`${v}%`, 'Adoption']
            }}/>
            <Area type="monotone" dataKey="adoption"
              stroke="#4f8ef7" strokeWidth={2}
              fill="url(#gblue)" />
            <Line type="monotone" dataKey="bau_adoption" stroke="#6b7591" strokeDasharray="4 4" strokeWidth={2} dot={false} activeDot={false} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Budget */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)',
                    borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 12, color:'var(--muted)', marginBottom: 14,
                      textTransform:'uppercase', letterSpacing:'0.07em', display: 'flex', justifyContent: 'space-between' }}>
          <span>Net municipal budget (₹ lakh)</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, textTransform: 'none', fontSize: 11 }}>
            <div style={{ width: 12, height: 2, borderTop: '2px dashed #6b7591' }} /> BAU Baseline
          </span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={data}>
            <CartesianGrid stroke="#1a1e2a" vertical={false}/>
            <XAxis dataKey="month" tick={{ fill:'#6b7591', fontSize:11 }}
                   axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill:'#6b7591', fontSize:11 }}
                   axisLine={false} tickLine={false} unit="L"/>
            <Tooltip {...tip} formatter={(v, n) => {
              if (n === 'bau_budget') return [`₹${v}L`, 'Business As Usual']
              return [`₹${v}L`, 'Net spend']
            }}/>
            <Bar dataKey="budget" radius={[4,4,0,0]}
              fill="#fbbf24" opacity={0.85}/>
            <Line type="step" dataKey="bau_budget" stroke="#6b7591" strokeDasharray="4 4" strokeWidth={2} dot={false} activeDot={false} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Landfill diversion — full width */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)',
                    borderRadius: 12, padding: 20, gridColumn:'span 2' }}>
        <div style={{ fontSize: 12, color:'var(--muted)', marginBottom: 14,
                      textTransform:'uppercase', letterSpacing:'0.07em', display: 'flex', justifyContent: 'space-between' }}>
          <span>Estimated landfill diversion (tonnes / month)</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, textTransform: 'none', fontSize: 11 }}>
            <div style={{ width: 12, height: 2, borderTop: '2px dashed #6b7591' }} /> BAU Baseline
          </span>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="ggreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#36d399" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#36d399" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1a1e2a" vertical={false}/>
            <XAxis dataKey="month" tick={{ fill:'#6b7591', fontSize:11 }}
                   axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill:'#6b7591', fontSize:11 }}
                   axisLine={false} tickLine={false}/>
            <Tooltip {...tip} formatter={(v, n) => {
              if (n === 'bau_diversion') return [`${v.toLocaleString()} T`, 'Business As Usual']
              return [`${v.toLocaleString()} T`, 'Diversion']
            }}/>
            <Area type="monotone" dataKey="diversion"
              stroke="#36d399" strokeWidth={2} fill="url(#ggreen)"/>
            <Line type="monotone" dataKey="bau_diversion" stroke="#6b7591" strokeDasharray="4 4" strokeWidth={2} dot={false} activeDot={false} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}