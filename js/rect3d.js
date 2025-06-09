import { Line  } from "./line";

export class Rect3D {
  constructor(corners) {
    this.a = corners[0];
    this.b = corners[1];
    this.c = corners[2];
    this.d = corners[3];
    var xInf = (new Line(this.b, this.a)).getIntersectionWith(new Line(this.c, this.d));
    var yInf = (new Line(this.d, this.a)).getIntersectionWith(new Line(this.c, this.b));
    var horizon = new Line(xInf, yInf);
    this.za = 1 / horizon.getDistanceTo(this.a);
    this.zb = 1 / horizon.getDistanceTo(this.b);
    this.zc = 1 / horizon.getDistanceTo(this.c);
    this.zd = 1 / horizon.getDistanceTo(this.d);
  }
  getPoint(fx, fy) {
    var zab = this.za * (1 - fx) + this.zb * fx;
    var fab = fx * this.zb / zab;
    var zdc = this.zd * (1 - fx) + this.zc * fx;
    var fdc = fx * this.zc / zdc;
    var z = zab * (1 - fy) + zdc * fy;
    var f = fy * zdc / z;
    if (isNaN(f)) { fab = fx; fdc = fx; f = fy; }
    return this.a.mix(this.b, fab).mix(this.d.mix(this.c, fdc), f);
  }
}
