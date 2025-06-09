import { Line  } from './line';

export class Rect3D {
  constructor(corners) {
    this.a = corners[0];
    this.b = corners[1];
    this.c = corners[2];
    this.d = corners[3];
    const xInf = (new Line(this.b, this.a)).getIntersectionWith(new Line(this.c, this.d));
    const yInf = (new Line(this.d, this.a)).getIntersectionWith(new Line(this.c, this.b));
    const horizon = new Line(xInf, yInf);
    this.za = 1 / horizon.getDistanceTo(this.a);
    this.zb = 1 / horizon.getDistanceTo(this.b);
    this.zc = 1 / horizon.getDistanceTo(this.c);
    this.zd = 1 / horizon.getDistanceTo(this.d);
  }
  getPoint(fx, fy) {
    const zab = this.za * (1 - fx) + this.zb * fx;
    let fab = fx * this.zb / zab;
    const zdc = this.zd * (1 - fx) + this.zc * fx;
    let fdc = fx * this.zc / zdc;
    const z = zab * (1 - fy) + zdc * fy;
    let f = fy * zdc / z;
    if (isNaN(f)) { fab = fx; fdc = fx; f = fy; }
    return this.a.mix(this.b, fab).mix(this.d.mix(this.c, fdc), f);
  }
}
