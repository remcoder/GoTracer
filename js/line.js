import { Point } from './point.js';

export function Line(p0, p1) {
  this.A = p1.y - p0.y;
  this.B = p0.x - p1.x;
  this.C = this.A * p0.x + this.B * p0.y;
  this.o = p0;
}

Line.prototype.getIntersectionWith = function(that) {
  const det = this.A * that.B - that.A * this.B;
  return new Point(
    (that.B * this.C - this.B * that.C) / det,
    (this.A * that.C - that.A * this.C) / det
  );
};

Line.prototype.getLength = function() {
  if (!this.__length) {
    this.__length = Math.sqrt(this.A * this.A + this.B * this.B);
  }
  return this.__length;
};

Line.prototype.getDistanceTo = function(p) {
  return Math.abs(this.A * p.x + this.B * p.y - this.C) / this.getLength();
};