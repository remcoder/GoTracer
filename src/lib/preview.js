import { DEFAULT_BOARD_SIZE, validateBoardSize } from './board-size.js';

export class Preview {
  constructor(cvs, boardSize = DEFAULT_BOARD_SIZE) {
    this.canvas = cvs;
    this.ctx = this.canvas.getContext('2d');
    this.margin = 10;
    this.spacing = 0;
    this.setBoardSize(boardSize);
  }
  setBoardSize(boardSize) {
    this.boardSize = validateBoardSize(boardSize);
    this.spacing = (this.canvas.width - 2 * this.margin) / (this.boardSize - 1);
  }
  update(stones) {
    this.clear();
    this.drawBoard();
    this.draw(stones.blackSet.points, 'black');
    this.draw(stones.whiteSet.points, 'white');
  }
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  drawBoard() {
    const end = this.canvas.width - this.margin;

    this.ctx.fillStyle = '#d9a95f';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeStyle = '#3f2a16';
    this.ctx.lineWidth = 1;

    for (let index = 0; index < this.boardSize; index++) {
      const offset = this.margin + index * this.spacing;

      this.ctx.beginPath();
      this.ctx.moveTo(this.margin, offset);
      this.ctx.lineTo(end, offset);
      this.ctx.moveTo(offset, this.margin);
      this.ctx.lineTo(offset, end);
      this.ctx.stroke();
    }
  }
  draw(points, color) {
    this.ctx.fillStyle = color === 'white' ? 'rgb(255,255,255)' : 'rgb(0,0,0)';
    for (let p = 0; p < points.length; p++) {
      this.drawStone(points[p]);
    }
  }
  drawStone(point) {
    const x = this.margin + this.spacing * (point.coord.charAt(1).charCodeAt(0) - 97);
    const y = this.margin + this.spacing * (point.coord.charAt(2).charCodeAt(0) - 97);
    const radius = Math.min(8, this.spacing * 0.45);

    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.closePath();
  }
}
