const SIZE = 64;
const SAMPLES = 96;
const rayOutline = 'M95 34 C86 28 80 39 70 36 C54 33 36 6 12 16 C5 19 8 21 14 25 C28 33 33 53 29 66 C27 72 13 70 5 80 L23 73 C17 82 14 87 10 92 C23 88 28 73 38 71 C51 65 59 80 68 72 C80 62 79 48 95 34 Z';
let rayPoints: Array<{ x: number; y: number; angle: number }> | undefined;
const cache = new Map<string, { source: string; ray: string; texture: string }>();

export function rayMorph(image: HTMLImageElement) {
  const cached = cache.get(image.src);
  if (cached) return cached;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context || !image.complete || !image.naturalWidth) return null;
  context.drawImage(image, 0, 0, SIZE, SIZE);
  const pixels = context.getImageData(0, 0, SIZE, SIZE);
  const alpha = Uint8Array.from({ length: SIZE * SIZE }, (_, i) => pixels.data[i * 4 + 3]);
  const queue: number[] = [];
  const filled = new Uint8Array(SIZE * SIZE);
  for (let i = 0; i < filled.length; i++) {
    if (alpha[i] > 128) { queue.push(i); filled[i] = 1; }
  }
  if (!queue.length) return null;
  // Extend the logo's own colour regions into its changing outline.
  for (let head = 0; head < queue.length; head++) {
    const i = queue[head];
    for (const next of [i % SIZE ? i - 1 : -1, i % SIZE < SIZE - 1 ? i + 1 : -1, i - SIZE, i + SIZE]) {
      if (next < 0 || next >= filled.length || filled[next]) continue;
      filled[next] = 1;
      for (let channel = 0; channel < 3; channel++) pixels.data[next * 4 + channel] = pixels.data[i * 4 + channel];
      queue.push(next);
    }
    pixels.data[i * 4 + 3] = 255;
  }
  context.putImageData(pixels, 0, 0);
  if (!rayPoints) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', rayOutline);
    const length = path.getTotalLength();
    rayPoints = Array.from({ length: SAMPLES }, (_, i) => {
      const point = path.getPointAtLength(i / SAMPLES * length);
      return { x: point.x, y: point.y, angle: Math.atan2(point.y - 50, point.x - 50) };
    });
  }
  const ray: string[] = [];
  const source: string[] = [];
  for (const p of rayPoints) {
    ray.push(`${p.x.toFixed(2)}% ${p.y.toFixed(2)}%`);
    const angle = p.angle;
    let radius = 0;
    for (let r = 1; r < 46; r += 0.5) {
      const x = Math.round(SIZE / 2 + Math.cos(angle) * r);
      const y = Math.round(SIZE / 2 + Math.sin(angle) * r);
      if (x >= 0 && y >= 0 && x < SIZE && y < SIZE && alpha[y * SIZE + x] > 64) radius = r;
    }
    source.push(`${50 + Math.cos(angle) * radius / SIZE * 100}% ${50 + Math.sin(angle) * radius / SIZE * 100}%`);
  }
  const result = { source: `polygon(${source.join(',')})`, ray: `polygon(${ray.join(',')})`, texture: canvas.toDataURL() };
  cache.set(image.src, result);
  return result;
}
