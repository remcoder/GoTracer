
export class PointSet {
  constructor(point) {
    this.points = [point];
    this.x = point.x;
    this.y = point.y;
  }
  add(that) {
    const points = this.points.concat(that.points);
    this.x = (this.x * this.points.length + that.x * that.points.length) / points.length;
    this.y = (this.y * this.points.length + that.y * that.points.length) / points.length;
    this.points = points;
  }
  getDistanceTo(that) {
    return Math.abs(this.x - that.x) + Math.abs(this.y - that.y);
  }
  draw(ctx, color) {
    this.points.map(function (pt) { pt.p.draw(ctx, color); });
  }
  drawDebug(ctx, color) {
    ctx.fillStyle = color;
    for (let j = 0; j < this.points.length; j++) {
      const p = this.points[j];
      ctx.fillRect(p.y / 2 - 1, p.x / 2 + 128 - 2, 2, 4);
    }
    // ctx.fillStyle = "green";
    // ctx.fillRect(this.y/2 - 1, this.x/2 + 128 - 2, 2, 4);
  }
  getSpread() {
    let total = 0;
    const thisSet = this;
    this.points.map(function (p) { total += Math.abs(thisSet.x - p.x) + Math.abs(thisSet.y - p.y); });
    return 100 - total / this.points.length;
  }
}

