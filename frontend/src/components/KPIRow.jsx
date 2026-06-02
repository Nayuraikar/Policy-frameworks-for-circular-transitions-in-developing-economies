export default function KPIRow({ result, loading }) {
  const Card = ({ label, value, color = 'var(--blue)', sub }) => (
    <div style={{
      background:'var(--surface)', border:'1px solid var(--border)',
      borderRadius: 12, padding:'16px 20px', flex: 1
    }}>
      <div style={{ fontSize: 11, color:'var(--hint)', textTransform:'uppercase',
                    letterSpacing:'0.08em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color,
                    opacity: loading ? 0.4 : 1, transition:'opacity 0.3s' }}>
        {loading ? '—' : value}
      </div>
      {sub && <div style={{ fontSize: 11, color:'var(--hint)', marginTop: 4 }}>{sub}</div>}
    </div>
  )

  const probColor = !result ? 'var(--blue)'
    : result.probability >= 0.65 ? 'var(--green)'
    : result.probability <= 0.4  ? 'var(--red)'
    : 'var(--amber)'

  return (
    <div style={{ display:'flex', gap: 12, marginBottom: 28 }}>
      <Card label="Adoption probability" sub="XGBoost prediction"
        value={result ? `${(result.probability*100).toFixed(1)}%` : '—'}
        color={probColor} loading={loading} />
      <Card label="Prediction"
        value={result?.label ?? '—'}
        color={result?.label === 'High Adoption' ? 'var(--green)' : 'var(--red)'}
        loading={loading} />
      <Card label="Confidence"
        value={result?.confidence ?? '—'}
        color="var(--amber)" loading={loading} />
      <Card label="Model accuracy" value="81.2%" sub="n=252, XGBoost" loading={false} />
    </div>
  )
}