export default function Illustration() {
  return (
    <svg
      className="illus"
      viewBox="0 0 440 620"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Illustration : un arbre et un chemin, là où vos projets prennent vie."
    >
      <defs>
        <linearGradient id="ill-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FCEFE4" />
          <stop offset="1" stopColor="#F4E1D2" />
        </linearGradient>
      </defs>
      <rect width="440" height="620" fill="url(#ill-sky)" />
      <path d="M0 360 C 120 336 250 350 440 330 L440 620 L0 620 Z" fill="#EFDCC9" />
      <path d="M0 420 C 150 400 300 416 440 398 L440 620 L0 620 Z" fill="#E6CFBA" />
      <path d="M250 620 C 250 520 360 470 440 470 L440 620 Z" fill="#E9D7C4" opacity=".8" />
      <path d="M150 620 C 200 520 150 470 60 452" fill="none" stroke="#D9BFA8" strokeWidth="26" strokeLinecap="round" opacity=".7" />
      <g transform="translate(330,300)">
        <rect x="-3" y="0" width="6" height="34" rx="3" fill="#B59A86" />
        <circle cx="0" cy="-8" r="22" fill="#8B7AA0" />
      </g>
      <g transform="translate(150,300)">
        <path d="M-8 220 C -14 150 -16 90 -8 40" fill="none" stroke="#9A7A5C" strokeWidth="16" strokeLinecap="round" />
        <path d="M-8 120 C 6 96 26 92 44 100" fill="none" stroke="#9A7A5C" strokeWidth="11" strokeLinecap="round" />
        <path d="M-8 90 C -24 70 -42 70 -58 82" fill="none" stroke="#9A7A5C" strokeWidth="10" strokeLinecap="round" />
        <ellipse cx="-8" cy="6" rx="86" ry="84" fill="#5E4A73" />
        <ellipse cx="-58" cy="-20" rx="42" ry="40" fill="#6E5982" />
        <ellipse cx="44" cy="-2" rx="40" ry="38" fill="#6E5982" />
        <ellipse cx="-6" cy="-58" rx="46" ry="40" fill="#6E5982" />
        {[
          [-44, 24], [10, -8], [40, 28], [-14, 48], [-66, -6], [-4, -64],
          [54, -22], [-40, -38], [24, -44], [-22, 6], [66, 8], [-58, 36],
        ].map(([x, y], i) => (
          <circle key={i} cx={-8 + x} cy={6 + y} r={i % 3 === 0 ? 7 : 5} fill={i % 4 === 0 ? "#F4A38F" : "#F27B6A"} />
        ))}
      </g>
    </svg>
  );
}
