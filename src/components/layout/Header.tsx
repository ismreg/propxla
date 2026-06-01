export default function Header() {
  return (
    <header className="flex justify-between items-end pb-4">
      <div>
        <div
          style={{ fontSize: 17, fontWeight: 500, letterSpacing: '-0.02em' }}
        >
          <span>Prop</span>
          <span style={{ color: '#1D9E75' }}>XLA</span>
        </div>
        <div className="text-xs text-gray-400" style={{ marginTop: 2 }}>
          Chennai · OMR &amp; ECR corridors
        </div>
      </div>
      <div className="text-xs text-gray-400 text-right">
        <div>Registered data</div>
        <div>+ risk intelligence</div>
      </div>
    </header>
  )
}
