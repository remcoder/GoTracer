export function Point(x, y) {
  this.x = x;
  this.y = y;
}

Point.prototype.mix = function(that, f) {
  return new Point((1 - f) * this.x + f * that.x, (1 - f) * this.y + f * that.y);
};

Point.prototype.getColor = function(ctx) {
  try {
    var c = ctx.getImageData(this.x, this.y, 1, 1);
  } catch(e) { return {} }
  var r = c.data[0];
  var g = c.data[1];
  var b = c.data[2];
  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  return {h: (max - min) / (max + 100) * (256 + 100), l: (r + g + b) / 3};
};

Point.prototype.draw = function(ctx, c) {
  if (Array.isArray(c))
    c = "rgb(" + c[0]/256*100 + "%," + c[1]/256*100 + "%," + c[2]/256*100 + "%)";
  ctx.fillStyle = c || "white";
  ctx.fillRect(this.x - 1, this.y - 1, 3, 3);
};

Point.prototype.toString = function() {
  return Math.round(this.x) + "," + Math.round(this.y);
};