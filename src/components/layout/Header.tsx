export default function Header() {
  return (
    <header className="flex items-end justify-between bg-transparent px-0 pb-3 pt-5">
      <div>
        <div
          style={{ fontSize: 17, fontWeight: 500, letterSpacing: '-0.02em' }}
        >
          <span className="text-white">Prop</span>
          <span style={{ color: '#1D9E75' }}>XLA</span>
        </div>
        <div className="text-xs" style={{ marginTop: 2, color: 'rgba(255,255,255,0.40)' }}>
          Chennai · OMR &amp; ECR corridors
        </div>
      </div>
      <div className="text-right text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
        <div>Registered data</div>
        <div>+ risk intelligence</div>
      </div>
    </header>
  )
}
