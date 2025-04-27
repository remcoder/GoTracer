import { Point } from './point.js';
import { Line } from './line.js';
import { Rect3D } from './rect3d.js';
import { PointSet } from './pointset.js';

export function GoTracer(img, canvas, debugCanvas)
{
  this.img = img;
  
  this.canvas = canvas;
  this.ctx = canvas.getContext('2d');
  
  this.debugCanvas = debugCanvas;
  this.debugCtx = debugCanvas.getContext('2d');
  
  var x1 = 0.1 * canvas.width;
  var y1 = 0.1 * canvas.height;
  var y2 = 0.9 * canvas.height;
  var x2 = 0.9 * canvas.width;
  
  this.corners = [
    new Point(x1, y1),
    new Point(x1, y2),
    new Point(x2, y2),
    new Point(x2, y1)
  ];

  this.crosshair = new Image();
  this.crosshair.src = "images/skitch2.png";
  this.crosshair.onload = () => {
    this.drawCrosshairs();
  };
}

GoTracer.prototype.getNearestCorner = function(x, y) {
  var closest = null;
  var closestDistance = Infinity;
  var pt = new Point(x, y);
  for (var i = 0; i < this.corners.length; i++) {
    var distance = new Line(pt, this.corners[i]).getLength();
    if (distance < closestDistance) {
      closestDistance = distance;
      closest = this.corners[i];
    }
  }
  return closest;
};
GoTracer.prototype.startScan = function()
{
  this.drawImage();
  this.calcRadii();  

  var sets = this.getSets(new Rect3D(this.corners));
  
  this.quickPartition(sets, 50);
  this.partition(sets, 3);
  this.assignSets(sets);
  this.drawCrosshairs();
};
GoTracer.prototype.drawImage = function()
{
  var aspectRatio = this.img.width / this.img.height;
  this.canvasWidth = Math.min(600 * aspectRatio, 900);
  this.canvasHeight = Math.min(900 / aspectRatio, 600);
  this.canvas.style.width = this.canvasWidth + "px";
  this.canvas.style.height = this.canvasHeight + "px";
  this.ctx.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height);
};
GoTracer.prototype.drawCrosshairs = function()
{  
  this.ctx.globalAlpha = 0.7;
  // - 1 for anti-aliasing effect
  var w = this.crosshair.width / this.canvasWidth * 900 - 1;
  var h = this.crosshair.height / this.canvasHeight * 600 - 1;
  for (var i = 0; i < this.corners.length; i++)
    this.ctx.drawImage(this.crosshair, this.corners[i].x - w/2, this.corners[i].y - h/2, w, h);
  this.ctx.globalAlpha = 1;
};
GoTracer.prototype.calcRadii = function()
{
  var xs = this.corners.map(function(p) { return p.x });
  var ys = this.corners.map(function(p) { return p.y });
  var xMax = Math.max.apply(Math, xs);
  var xMin = Math.min.apply(Math, xs);
  var yMax = Math.max.apply(Math, ys);
  var yMin = Math.min.apply(Math, ys);
  this.xRadius = (xMax - xMin) / 100;
  this.yRadius = (yMax - yMin) / 100;
};
GoTracer.prototype.getSets = function(rect)
{
  var sets = [];
  var measurements = 7;
  for (var x = 0; x < 19; x++)
  {
    for (var y = 0; y < 19; y++)
    {
      var l = 0, h = 0, count = 0;
      for (var t = 0; t < measurements; t++)
      {
        var phi = t/measurements*2*Math.PI;
        var c = rect.getPoint(x/18 + 0.012*Math.cos(phi), y/18 + 0.012*Math.sin(phi)).getColor(this.ctx);
        if (!isNaN(c.l) && !isNaN(c.h))
        {
          l += c.l; h += c.h;
          count++;
        }
      }
      l /= count; h /= count;
      var l1 = 0, h1 = 0, count = 0;
      for (var t = 0; t < 4; t++)
      {
        var phi = (t+0.5)/2*Math.PI;
        var x1 = x+0.7*Math.cos(phi);
        var y1 = y+0.7*Math.sin(phi);
        if (x1 >= 0 && y1 >= 0 && x1 <= 18 && y1 <= 18)
        {
          var c = rect.getPoint(x1/18, y1/18).getColor(this.ctx);
          if (!isNaN(c.l) && !isNaN(c.h))
          {
            l1 += c.l; h1 += c.h;
            count++;
          }
        }
      }
      l1 /= count; h1 /= count;

      sets.push(new PointSet({ 
        p: rect.getPoint(x/18, y/18),
        x: h - h1 - Math.abs(l - l1) + 64,
        y: l,
        coord: "[" + String.fromCharCode(x + 97) + String.fromCharCode(y + 97) + "]"
      }));
    }
  }
  return sets;
};
GoTracer.prototype.quickPartition = function(sets, target)
{
  while (sets.length > target)
  {
    var smallestSet = sets.pop();
    var closestSet = null, closestSetIndex = -1, smallestDistance = Infinity;
    for (var i = 0; i < sets.length; i++)
    {
      var s = sets[i];
      var d = smallestSet.getDistanceTo(s);
      if (d < smallestDistance)
      {
        smallestDistance = d;
        closestSet = s;
        closestSetIndex = i;
      }
    }
    if (!closestSet) return
    sets.splice(closestSetIndex, 1);
    closestSet.add(smallestSet);
    for (var i = 0; i < sets.length; i++)
    {
      if (sets[i].points.length < closestSet.points.length)
      {
        sets.splice(i, 0, closestSet);
        break;
      }
    }
  }
};
GoTracer.prototype.partition = function(sets, target)
{
  while (sets.length > target)
  {
    var indexOfClosestSet1, indexOfClosestSet2, smallestDistance = Infinity;
    for (var i = 0; i < sets.length; i++)
    {
      for (var j = i + 1; j < sets.length; j++)
      {
        var d = sets[i].getDistanceTo(sets[j]);
        if (d < smallestDistance)
        {
          smallestDistance = d;
          indexOfClosestSet1 = i;
          indexOfClosestSet2 = j;
        }
      }
    }
    sets[indexOfClosestSet1].add(sets[indexOfClosestSet2]);
    sets.splice(indexOfClosestSet2, 1);
  }
};
GoTracer.prototype.assignSets = function(sets)
{
  // Sort by lightness
  sets.sort(function(a, b) { return a.y - b.y; });
  this.blackSet = sets[0];

  // Sort by color
  sets.sort(function(a, b) { return a.x - b.x; });
  this.boardSet = sets[2] == this.blackSet ? sets[1] : sets[2];

  this.whiteSet = sets[0] == this.blackSet ? sets[1] : sets[0];

  this.blackSet.draw(this.ctx, "white");
  this.whiteSet.draw(this.ctx, "black");
  this.boardSet.draw(this.ctx, "brown");
  
  this.debugCtx.fillStyle = "white";
  this.debugCtx.fillRect(0, 0, this.debugCanvas.width, this.debugCanvas.height);

  this.blackSet.drawDebug(this.debugCtx, "rgb(0,0,0)");
  this.whiteSet.drawDebug(this.debugCtx, "rgb(160,160,160)");
  this.boardSet.drawDebug(this.debugCtx, "rgb(255,160,64)");
};
GoTracer.prototype.getMatch = function()
{
  return 1/3 * ( this.blackSet.getSpread() + this.whiteSet.getSpread() + this.boardSet.getSpread() );
}

GoTracer.prototype.getSGF = function()
{
  var blackCoords = this.blackSet.points.map(function(pt) { return pt.coord; })
  var whiteCoords = this.whiteSet.points.map(function(pt) { return pt.coord; })
  
  return '(;AB' + blackCoords.join('') + 'AW' + whiteCoords.join('') + ')';
};



