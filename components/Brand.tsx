export default function Brand({ tagline = true }: { tagline?: boolean }) {
  return (
    <div className="wordmark" aria-label="SUBSIDIUM">
      <span>Subs</span>
      <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true" style={{ margin: "0 1px" }}>
        <circle cx="24" cy="22" r="14" fill="#F9F1E9" stroke="#372646" strokeWidth="2.4" />
        <g fill="none" stroke="#372646" strokeWidth="1.4" opacity=".5">
          <ellipse cx="24" cy="22" rx="5" ry="14" />
          <ellipse cx="24" cy="22" rx="14" ry="5" />
          <line x1="24" y1="8" x2="24" y2="36" />
          <line x1="10" y1="22" x2="38" y2="22" />
        </g>
        <path d="M14 40 q10 -8 20 0" fill="none" stroke="#372646" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <span>dium</span>
      {tagline && (
        <small style={{ position: "absolute", marginTop: 26, width: "100%", textAlign: "center", left: 0 }}>
          là où vos projets prennent vie
        </small>
      )}
    </div>
  );
}
