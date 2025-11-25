export function normalizeStars(stars, box = { w: 200, h: 140, pad: 10 }) {
  if (!stars || stars.length === 0) return [];
  const xs = stars.map((s) => s.x);
  const ys = stars.map((s) => s.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const pad = box.pad ?? 10;
  const innerW = box.w - pad * 2;
  const innerH = box.h - pad * 2;

  const scaleX = (x) =>
    pad + (maxX === minX ? innerW / 2 : ((x - minX) / (maxX - minX)) * innerW);

  const scaleY = (y) =>
    pad + (maxY === minY ? innerH / 2: ((y-minY) / (maxY - minY)) * innerH);

  return stars.map((s) => ({
    ...s,
    _nx: scaleX(s.x),
    _ny: scaleY(s.y),
  }));
}
