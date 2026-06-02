import {
  AreaChart, Area, BarChart, Bar,
  LineChart, Line, XAxis, YAxis,
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

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 20, marginBottom: 28 }}>

      {/* Adoption rate */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)',
                    borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 12, color:'var(--muted)', marginBottom: 14,
                      textTransform:'uppercase', letterSpacing:'0.07em' }}>
          Recycling adoption rate (%)
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={forecast}>
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
            <Tooltip {...tip} formatter={v=>[`${v}%`,'Adoption']}/>
            <Area type="monotone" dataKey="adoption"
              stroke="#4f8ef7" strokeWidth={2}
              fill="url(#gblue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Budget */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)',
                    borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 12, color:'var(--muted)', marginBottom: 14,
                      textTransform:'uppercase', letterSpacing:'0.07em' }}>
          Net municipal budget (₹ lakh)
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={forecast}>
            <CartesianGrid stroke="#1a1e2a" vertical={false}/>
            <XAxis dataKey="month" tick={{ fill:'#6b7591', fontSize:11 }}
                   axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill:'#6b7591', fontSize:11 }}
                   axisLine={false} tickLine={false} unit="L"/>
            <Tooltip {...tip} formatter={v=>[`₹${v}L`,'Net spend']}/>
            <Bar dataKey="budget" radius={[4,4,0,0]}
              fill="#fbbf24" opacity={0.85}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Landfill diversion — full width */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)',
                    borderRadius: 12, padding: 20, gridColumn:'span 2' }}>
        <div style={{ fontSize: 12, color:'var(--muted)', marginBottom: 14,
                      textTransform:'uppercase', letterSpacing:'0.07em' }}>
          Estimated landfill diversion (tonnes / month)
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={forecast}>
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
            <Tooltip {...tip} formatter={v=>[`${v.toLocaleString()} T`,'Diversion']}/>
            <Area type="monotone" dataKey="diversion"
              stroke="#36d399" strokeWidth={2} fill="url(#ggreen)"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}