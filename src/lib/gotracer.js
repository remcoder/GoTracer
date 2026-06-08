import { Point } from './point.js';
import { Line } from './line.js';
import { Rect3D } from './rect3d.js';
import { PointSet } from './pointset.js';
import { DEFAULT_BOARD_SIZE, validateBoardSize } from './board-size.js';

export class GoTracer {
  constructor(imgUrl, canvas, debugCanvas, boardSize = DEFAULT_BOARD_SIZE) {
    this.boardSize = validateBoardSize(boardSize);
    this.img = new Image();
    this.img.src = imgUrl;
    this.img.onload = () => {
      this.startScan();
    };

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;

    this.debugCanvas = debugCanvas;
    this.debugCtx = debugCanvas?.getContext('2d');

    const x1 = 0.1 * canvas.width;
    const y1 = 0.1 * canvas.height;
    const y2 = 0.9 * canvas.height;
    const x2 = 0.9 * canvas.width;

    this.corners = [
      new Point(x1, y1),
      new Point(x1, y2),
      new Point(x2, y2),
      new Point(x2, y1)
    ];


    this.crosshair = new Image();
    this.crosshair.src = 'images/skitch2.png';
    this.crosshair.onload = () => {
      this.drawCrosshairs(); // initial draw
    };
  }

  onScan(callback) {
    this.onScanCallback = () => {

      console.log('GoTracer scan completed.');
        callback({
          blackSet: this.blackSet,
          whiteSet: this.whiteSet,
          boardSet: this.boardSet,
        });
      
    };
  }

  setCorners(newCorners) {
    if (Array.isArray(newCorners) && newCorners.length === 4 && newCorners.every(p => p instanceof Point)) {
      this.corners = newCorners;
      // You can add logic here to trigger redraws or other updates if needed
      console.log('GoTracer corners updated via setCorners.');
    } else {
      console.error('Invalid corners provided to GoTracer.setCorners Expected 4 Point instances.', newCorners);
    }
  }
  getNearestCorner(x, y) {
    let closest = null;
    let closestDistance = Infinity;
    const pt = new Point(x, y);
    for (let i = 0; i < this.corners.length; i++) {
      const distance = new Line(pt, this.corners[i]).getLength();
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = this.corners[i];
      }
    }
    return closest;
  }
  startScan() {
    this.drawImage();
    this.calcRadii();

    const sets = this.getSets(new Rect3D(this.corners));

    this.quickPartition(sets, 50);
    this.partition(sets, 3);
    this.assignSets(sets);
    this.drawCrosshairs();

    this.onScanCallback?.();
  }
  drawImage() {
    const aspectRatio = this.img.width / this.img.height;
    this.canvasWidth = Math.min(600 * aspectRatio, 900);
    this.canvasHeight = Math.min(900 / aspectRatio, 600);
    this.canvas.style.width = this.canvasWidth + 'px';
    this.canvas.style.height = this.canvasHeight + 'px';
    this.ctx.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height);
  }
  drawCrosshairs() {
    this.ctx.globalAlpha = 0.7;
    // - 1 for anti-aliasing effect
    const w = this.crosshair.width / this.canvasWidth * 900 - 1;
    const h = this.crosshair.height / this.canvasHeight * 600 - 1;
    for (const corner of this.corners)
      this.ctx.drawImage(this.crosshair, corner.x - w / 2, corner.y - h / 2, w, h);
    this.ctx.globalAlpha = 1;
  }
  calcRadii() {
    const xs = this.corners.map(function (p) { return p.x; });
    const ys = this.corners.map(function (p) { return p.y; });
    const xMax = Math.max.apply(Math, xs);
    const xMin = Math.min.apply(Math, xs);
    const yMax = Math.max.apply(Math, ys);
    const yMin = Math.min.apply(Math, ys);
    this.xRadius = (xMax - xMin) / 100;
    this.yRadius = (yMax - yMin) / 100;
  }
  getSets(rect) {
    const sets = [];
    const measurements = 7;
    const maxIndex = this.boardSize - 1;
    for (let x = 0; x < this.boardSize; x++) {
      for (let y = 0; y < this.boardSize; y++) {
        let l = 0, h = 0, count = 0;
        for (let t = 0; t < measurements; t++) {
          const phi = t / measurements * 2 * Math.PI;
          const c = rect.getPoint(
            x / maxIndex + 0.012 * Math.cos(phi),
            y / maxIndex + 0.012 * Math.sin(phi)
          ).getColor(this.ctx);
          if (!isNaN(c.l) && !isNaN(c.h)) {
            l += c.l; h += c.h;
            count++;
          }
        }
        l /= count; h /= count;

        let l2 = 0, h2 = 0, count2 = 0;
        for (let t2 = 0; t2 < 4; t2++) {
          const phi2 = (t2 + 0.5) / 2 * Math.PI;
          const x1 = x + 0.7 * Math.cos(phi2);
          const y1 = y + 0.7 * Math.sin(phi2);
          if (x1 >= 0 && y1 >= 0 && x1 <= maxIndex && y1 <= maxIndex) {
            const c2 = rect.getPoint(x1 / maxIndex, y1 / maxIndex).getColor(this.ctx);
            if (!isNaN(c2.l) && !isNaN(c2.h)) {
              l2 += c2.l; h2 += c2.h;
              count2++;
            }
          }
        }
        l2 /= count2; h2 /= count2;

        sets.push(new PointSet({
          p: rect.getPoint(x / maxIndex, y / maxIndex),
          x: h - h2 - Math.abs(l - l2) + 64,
          y: l,
          coord: '[' + String.fromCharCode(y + 97) + String.fromCharCode(x   + 97) + ']'
        }));
      }
    }
    return sets;
  }
  quickPartition(sets, target) {
    while (sets.length > target) {
      const smallestSet = sets.pop();
      let closestSet = null, closestSetIndex = -1, smallestDistance = Infinity;
      for (let i = 0; i < sets.length; i++) {
        const s = sets[i];
        const d = smallestSet.getDistanceTo(s);
        if (d < smallestDistance) {
          smallestDistance = d;
          closestSet = s;
          closestSetIndex = i;
        }
      }
      if (!closestSet) return;
      sets.splice(closestSetIndex, 1);
      closestSet.add(smallestSet);
      for (let s2 = 0; s2 < sets.length; s2++) {
        if (sets[s2].points.length < closestSet.points.length) {
          sets.splice(s2, 0, closestSet);
          break;
        }
      }
    }
  }
  partition(sets, target) {
    while (sets.length > target) {
      let indexOfClosestSet1, indexOfClosestSet2, smallestDistance = Infinity;
      for (let i = 0; i < sets.length; i++) {
        for (let j = i + 1; j < sets.length; j++) {
          const d = sets[i].getDistanceTo(sets[j]);
          if (d < smallestDistance) {
            smallestDistance = d;
            indexOfClosestSet1 = i;
            indexOfClosestSet2 = j;
          }
        }
      }
      if (indexOfClosestSet1 === undefined || indexOfClosestSet2 === undefined) {
        return;
      }
      sets[indexOfClosestSet1].add(sets[indexOfClosestSet2]);
      sets.splice(indexOfClosestSet2, 1);
    }
  }
  assignSets(sets) {
    // Sort by lightness
    sets.sort(function (a, b) { return a.y - b.y; });
    this.blackSet = sets[0];

    // Sort by color
    sets.sort(function (a, b) { return a.x - b.x; });
    this.boardSet = sets[2] == this.blackSet ? sets[1] : sets[2];

    this.whiteSet = sets[0] == this.blackSet ? sets[1] : sets[0];

    this.blackSet.draw(this.ctx, 'white');
    this.whiteSet.draw(this.ctx, 'black');
    this.boardSet.draw(this.ctx, 'brown');

    // if( this.debugCtx) {
    //   this.debugCtx.fillStyle = 'white';
    //   this.debugCtx?.fillRect(0, 0, this.debugCanvas.width, this.debugCanvas.height);

    //   this.blackSet.drawDebug(this.debugCtx, 'rgb(0,0,0)');
    //   this.whiteSet.drawDebug(this.debugCtx, 'rgb(160,160,160)');
    //     this.boardSet.drawDebug(this.debugCtx, 'rgb(255,160,64)');
    // }
  }
  getMatch() {
    return 1 / 3 * (this.blackSet.getSpread() + this.whiteSet.getSpread() + this.boardSet.getSpread());
  }
  getSGF() {
    const blackCoords = this.blackSet.points.map(function (pt) { return pt.coord; });
    const whiteCoords = this.whiteSet.points.map(function (pt) { return pt.coord; });

    return '(;SZ[' + this.boardSize + ']AB' + blackCoords.join('') + 'AW' + whiteCoords.join('') + ')';
  }


  getCoords = (e) => {
    let x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; // Added documentElement scroll
    let y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; // Added documentElement scroll

    for (let el = this.canvas; el; el = el.offsetParent) {
      x -= el.offsetLeft;
      y -= el.offsetTop;
    }

    // Adjust for canvas scaling if CSS width/height differs from canvas width/height
    const rect = this.canvas.getBoundingClientRect();
    x = (x / rect.width) * this.canvas.width;
    y = (y / rect.height) * this.canvas.height;

    return {
      x: x,
      y: y
    };
  };

  handleDown = (e) => {
    const p = this.getCoords(e);
    this.currentCorner = this.getNearestCorner(p.x, p.y);
    this.handleMove(e);
  };

  handleUp = () => {
    this.currentCorner = null;
  };

  handleMove = (e) => {
    if (!this.currentCorner )
      return;

    const p = this.getCoords(e);
    this.currentCorner.x = p.x;
    this.currentCorner.y = p.y;

    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.startScan(), 20);
  };


}





