import { useMemo } from "react";

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function PseudoQR({ seed, size = 168, dark = "#1B231E" }) {
  const n = 11;
  const rand = useMemo(() => mulberry32(hashStr(seed) || 1), [seed]);
  const grid = useMemo(() => {
    const g = Array.from({ length: n }, () => Array(n).fill(false));
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const inFinder = (x < 3 && y < 3) || (x > n - 4 && y < 3) || (x < 3 && y > n - 4);
        if (!inFinder) g[y][x] = rand() > 0.55;
      }
    }
    return g;
  }, [rand]);

  const cell = size / n;
  const finders = [[0, 0], [n - 3, 0], [0, n - 3]];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="QR-kod för bokning">
      <rect width={size} height={size} fill="#fff" />
      {grid.map((row, y) =>
        row.map((v, x) => (v ? <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill={dark} /> : null))
      )}
      {finders.map(([fx, fy], idx) => (
        <g key={idx}>
          <rect x={fx * cell} y={fy * cell} width={cell * 3} height={cell * 3} fill={dark} />
          <rect x={(fx + 0.6) * cell} y={(fy + 0.6) * cell} width={cell * 1.8} height={cell * 1.8} fill="#fff" />
          <rect x={(fx + 1.1) * cell} y={(fy + 1.1) * cell} width={cell * 0.8} height={cell * 0.8} fill={dark} />
        </g>
      ))}
    </svg>
  );
}
