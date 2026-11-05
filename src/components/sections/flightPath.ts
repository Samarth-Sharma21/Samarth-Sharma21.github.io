export type Point = { x: number; y: number };
type Bounds = { left: number; right: number; top: number; bottom: number };
type Sample = Point & { heading: number; distance: number };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const unit = (p: Point) => { const length = Math.hypot(p.x, p.y) || 1; return { x: p.x / length, y: p.y / length }; };

export function flightPath(start: Point, end: Point, bounds: Bounds) {
  const { left, right, top, bottom } = bounds;
  const width = right - left, height = bottom - top;
  const rotation = Math.random() * Math.PI * 2;
  const radiusX = Math.min(width * (.16 + Math.random() * .07), height * .17);
  const radiusY = Math.min(height * (.22 + Math.random() * .08), width * .32);
  const xAxis = { x: Math.cos(rotation) * radiusX, y: Math.sin(rotation) * radiusX };
  const yAxis = { x: -Math.sin(rotation) * radiusY, y: Math.cos(rotation) * radiusY };
  const extentX = Math.hypot(xAxis.x, yAxis.x), extentY = Math.hypot(xAxis.y, yAxis.y);
  const centre = { x: left + extentX + Math.random() * (width - 2 * extentX), y: top + extentY + Math.random() * (height - 2 * extentY) };
  const angleTo = (p: Point) => Math.atan2((-(p.x - centre.x) * Math.sin(rotation) + (p.y - centre.y) * Math.cos(rotation)) / radiusY,
    ((p.x - centre.x) * Math.cos(rotation) + (p.y - centre.y) * Math.sin(rotation)) / radiusX);
  const direction = Math.random() < .5 ? -1 : 1;
  const entryAngle = angleTo(start), exitAngle = angleTo(end);
  const sweep = Math.PI * 2 + ((direction * (exitAngle - entryAngle) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const ellipse = (angle: number) => ({ x: centre.x + xAxis.x * Math.cos(angle) + yAxis.x * Math.sin(angle), y: centre.y + xAxis.y * Math.cos(angle) + yAxis.y * Math.sin(angle) });
  const tangent = (angle: number) => unit({ x: direction * (-xAxis.x * Math.sin(angle) + yAxis.x * Math.cos(angle)), y: direction * (-xAxis.y * Math.sin(angle) + yAxis.y * Math.cos(angle)) });
  const entry = ellipse(entryAngle), exit = ellipse(exitAngle);
  const entryTangent = tangent(entryAngle), exitTangent = tangent(exitAngle);
  const handle = (p: Point, vector: Point, length: number) => Math.max(0, Math.min(length * .24, radiusX * .65,
    (p.x - left) / (Math.abs(vector.x) || 1), (right - p.x) / (Math.abs(vector.x) || 1),
    (p.y - top) / (Math.abs(vector.y) || 1), (bottom - p.y) / (Math.abs(vector.y) || 1)));
  const entryHandle = handle(entry, entryTangent, Math.hypot(entry.x - start.x, entry.y - start.y));
  const exitHandle = handle(exit, exitTangent, Math.hypot(end.x - exit.x, end.y - exit.y));
  const samples: Sample[] = [];
  const append = (point: Point, vector: Point) => {
    const previous = samples[samples.length - 1];
    let heading = Math.atan2(vector.y, vector.x) * 180 / Math.PI;
    if (previous) heading += Math.round((previous.heading - heading) / 360) * 360;
    samples.push({ ...point, heading, distance: (previous?.distance ?? 0) + (previous ? Math.hypot(point.x - previous.x, point.y - previous.y) : 0) });
  };
  const cubic = (a: Point, b: Point, c: Point, d: Point) => {
    for (let i = 0; i <= 48; i++) {
      const t = i / 48, u = 1 - t;
      append({ x: u ** 3 * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t ** 3 * d.x,
        y: u ** 3 * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t ** 3 * d.y },
      { x: 3 * u * u * (b.x - a.x) + 6 * u * t * (c.x - b.x) + 3 * t * t * (d.x - c.x),
        y: 3 * u * u * (b.y - a.y) + 6 * u * t * (c.y - b.y) + 3 * t * t * (d.y - c.y) });
    }
  };
  cubic(start, { x: mix(start.x, entry.x, .35), y: mix(start.y, entry.y, .35) }, { x: entry.x - entryTangent.x * entryHandle, y: entry.y - entryTangent.y * entryHandle }, entry);
  for (let i = 1; i <= 360; i++) {
    const angle = entryAngle + direction * sweep * i / 360;
    append(ellipse(angle), tangent(angle));
  }
  cubic(exit, { x: exit.x + exitTangent.x * exitHandle, y: exit.y + exitTangent.y * exitHandle }, { x: mix(end.x, exit.x, .35), y: mix(end.y, exit.y, .35) }, end);
  const total = samples[samples.length - 1].distance;
  let index = 1;
  return (t: number) => {
    const distance = t * total;
    while (index < samples.length - 1 && samples[index].distance < distance) index++;
    const before = samples[index - 1], after = samples[index];
    const fraction = (distance - before.distance) / (after.distance - before.distance || 1);
    return { x: mix(before.x, after.x, fraction), y: mix(before.y, after.y, fraction), heading: mix(before.heading, after.heading, fraction) };
  };
}
