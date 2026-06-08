import assert from 'node:assert/strict';
import test from 'node:test';

import { SUPPORTED_BOARD_SIZES } from '../src/lib/board-size.js';
import { GoTracer } from '../src/lib/gotracer.js';
import { Preview } from '../src/lib/preview.js';
import { createCanvasMock } from './helpers/create-canvas-mock.mjs';

for (const boardSize of SUPPORTED_BOARD_SIZES) {
  test(`scanner samples a ${boardSize}x${boardSize} grid`, () => {
    const rect = {
      getPoint(fx, fy) {
        return {
          fx,
          fy,
          getColor() {
            return { h: 40, l: 80 };
          }
        };
      }
    };

    const sets = GoTracer.prototype.getSets.call({ boardSize, ctx: {} }, rect);
    const lastCoord = String.fromCharCode(96 + boardSize);

    assert.equal(sets.length, boardSize * boardSize);
    assert.equal(sets[0].points[0].coord, '[aa]');
    assert.equal(sets.at(-1).points[0].coord, `[${lastCoord}${lastCoord}]`);
    assert.equal(sets.at(-1).points[0].p.fx, 1);
    assert.equal(sets.at(-1).points[0].p.fy, 1);
  });
}

test('SGF includes the selected board size', () => {
  const sgf = GoTracer.prototype.getSGF.call({
    boardSize: 13,
    blackSet: { points: [{ coord: '[aa]' }] },
    whiteSet: { points: [{ coord: '[bc]' }] }
  });

  assert.equal(sgf, '(;SZ[13]AB[aa]AW[bc])');
});

for (const boardSize of SUPPORTED_BOARD_SIZES) {
  test(`preview uses ${boardSize}x${boardSize} grid and stone spacing`, () => {
    const { canvas, operations } = createCanvasMock();
    const preview = new Preview(canvas, boardSize);
    const lastCoord = String.fromCharCode(96 + boardSize);

    preview.update({
      blackSet: { points: [{ coord: `[a${lastCoord}]` }] },
      whiteSet: { points: [] }
    });

    assert.equal(
      operations.filter(({ type }) => type === 'lineTo').length,
      boardSize * 2
    );
    assert.deepEqual(
      operations.find(({ type }) => type === 'arc'),
      {
        type: 'arc',
        x: 10,
        y: 190,
        radius: Math.min(8, (180 / (boardSize - 1)) * 0.45)
      }
    );
  });
}
