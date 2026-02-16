const { sin, floor: fl, sqrt: sq } = Math;

var seed = 0;
export function setSeed(s: number): void { seed = s; }
export function getSeed(): number { return seed; }

export function noise2D(x: number, y: number): number {
  var n = sin((x + seed) * 127.1 + y * 311.7) * 43758.5;
  return n - fl(n);
}

export function smoothNoise2D(x: number, y: number): number {
  var ix = fl(x), iy = fl(y), fx = x - ix, fy = y - iy;
  fx = fx * fx * (3 - 2 * fx);
  fy = fy * fy * (3 - 2 * fy);
  return noise2D(ix, iy) * (1 - fx) * (1 - fy) +
    noise2D(ix + 1, iy) * fx * (1 - fy) +
    noise2D(ix, iy + 1) * (1 - fx) * fy +
    noise2D(ix + 1, iy + 1) * fx * fy;
}

export function fbm(x: number, y: number, o: number): number {
  var v = 0, a = 0.5, f = 1;
  for (var i = 0; i < o; i++) {
    v += a * smoothNoise2D(x * f, y * f);
    a *= 0.5;
    f *= 2;
  }
  return v;
}

export function noise3D(x: number, y: number, z: number): number {
  var n = sin((x + seed) * 127.1 + y * 311.7 + z * 74.7) * 43758.5;
  return n - fl(n);
}

export function smoothNoise3D(x: number, y: number, z: number): number {
  var ix = fl(x), iy = fl(y), iz = fl(z),
    fx = x - ix, fy = y - iy, fz = z - iz;
  fx = fx * fx * (3 - 2 * fx);
  fy = fy * fy * (3 - 2 * fy);
  fz = fz * fz * (3 - 2 * fz);
  var a = noise3D(ix, iy, iz),
    b = noise3D(ix + 1, iy, iz),
    c = noise3D(ix, iy + 1, iz),
    d = noise3D(ix + 1, iy + 1, iz),
    e = noise3D(ix, iy, iz + 1),
    f = noise3D(ix + 1, iy, iz + 1),
    g = noise3D(ix, iy + 1, iz + 1),
    h = noise3D(ix + 1, iy + 1, iz + 1);
  var x1 = a * (1 - fx) + b * fx,
    x2 = c * (1 - fx) + d * fx,
    x3 = e * (1 - fx) + f * fx,
    x4 = g * (1 - fx) + h * fx;
  return x1 * (1 - fy) + x2 * fy + (x3 * (1 - fy) + x4 * fy - x1 * (1 - fy) - x2 * fy) * fz;
}

export function caveNoise(x: number, y: number, z: number): number {
  return smoothNoise3D(x * .04, y * .06, z * .04) + smoothNoise3D(x * .08, y * .1, z * .08) * .5;
}
