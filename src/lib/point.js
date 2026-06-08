export class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  mix(that, f) {
    return new Point((1 - f) * this.x + f * that.x, (1 - f) * this.y + f * that.y);
  }
  getColor(ctx) {
    const c = ctx.getImageData(this.x, this.y, 1, 1);
    
    const r = c.data[0];
    const g = c.data[1];
    const b = c.data[2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    return { h: (max - min) / (max + 100) * (256 + 100), l: (r + g + b) / 3 };
  }
  draw(ctx, c) {
    if (Array.isArray(c))
      c = 'rgb(' + c[0] / 256 * 100 + '%,' + c[1] / 256 * 100 + '%,' + c[2] / 256 * 100 + '%)';
    ctx.fillStyle = c || 'white';
    ctx.fillRect(this.x - 1, this.y - 1, 3, 3);
  }
  toString() {
    return Math.round(this.x) + ',' + Math.round(this.y);
  }
}




