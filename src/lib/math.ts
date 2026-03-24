export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s % 10000) / 10000;
  };
}

export function buildThreadPath(
  sx: number, sy: number, ex: number, ey: number, seed: number
) {
  const dx = ex - sx;
  const dy = ey - sy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 2) return { d: `M ${sx} ${sy} L ${ex} ${ey}`, len: dist };

  const rand = seededRandom(seed);
  const waves = 5 + Math.floor(rand() * 3);
  const points: { x: number; y: number }[] = [];
  const steps = waves * 4;

  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    const baseX = sx + dx * t;
    const baseY = sy + dy * t;

    const wavePhase = t * waves * Math.PI;
    const waveIndex = Math.floor(t * waves);
    const ampSeed = seededRandom(seed + waveIndex * 31);
    const amp = ampSeed() * 8 + 4;
    const freqShift = (rand() - 0.5) * 0.3;
    const wave = Math.sin(wavePhase + freqShift) * amp;
    const taper = Math.min(1, t * 8) * Math.min(1, (1 - t) * 8);
    const offset = wave * taper;

    const perpX = (-dy / dist) * offset;
    const perpY = (dx / dist) * offset;
    points.push({ x: baseX + perpX, y: baseY + perpY });
  }

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  const tension = 3;

  for (let j = 0; j < points.length - 1; j++) {
    const p0 = points[Math.max(0, j - 1)];
    const p1 = points[j];
    const p2 = points[j + 1];
    const p3 = points[Math.min(points.length - 1, j + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / tension;
    const cp1y = p1.y + (p2.y - p0.y) / tension;
    const cp2x = p2.x - (p3.x - p1.x) / tension;
    const cp2y = p2.y - (p3.y - p1.y) / tension;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${cp2x.toFixed(1)} ${cp2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return { d, len: dist * 1.15 };
}
