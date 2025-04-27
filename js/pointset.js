import { Point } from './point.js';

export function PointSet(point)
{
  this.points = [point];
  this.x = point.x;
  this.y = point.y;
}
PointSet.prototype.add = function(that)
{
  var points = this.points.concat(that.points);
  this.x = (this.x * this.points.length + that.x * that.points.length) / points.length;
  this.y = (this.y * this.points.length + that.y * that.points.length) / points.length;
  this.points = points;
};
PointSet.prototype.getDistanceTo = function(that)
{
  return Math.abs(this.x - that.x) + Math.abs(this.y - that.y);
};
PointSet.prototype.draw = function(ctx, color)
{
  this.points.map(function(pt) { pt.p.draw(ctx, color); })
};
PointSet.prototype.drawDebug = function(ctx, color)
{
  ctx.fillStyle = color;
  for (var j = 0; j < this.points.length; j++)
  {
    var p = this.points[j];
    ctx.fillRect(p.y / 2 - 1, p.x / 2 + 128 - 2, 2, 4);
  }
  // ctx.fillStyle = "green";
  // ctx.fillRect(this.y/2 - 1, this.x/2 + 128 - 2, 2, 4);
}
PointSet.prototype.getSpread = function()
{
  var total = 0;
  var thisSet = this;
  this.points.map(function(p) { total += Math.abs(thisSet.x - p.x) + Math.abs(thisSet.y - p.y); } );
  return 100 - total / this.points.length;
}
