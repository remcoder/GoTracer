/* eslint-disable @typescript-eslint/no-empty-function */
export function createCanvasMock({ width = 200, height = 200 } = {}) {
  const operations = [];
  const context = {
    clearRect() {},
    fillRect() {},
    beginPath() {},
    moveTo() {},
    lineTo(x, y) {
      operations.push({ type: 'lineTo', x, y });
    },
    stroke() {},
    arc(x, y, radius) {
      operations.push({ type: 'arc', x, y, radius });
    },
    fill() {},
    closePath() {}
  };
  const canvas = {
    width,
    height,
    getContext() {
      return context;
    }
  };

  return { canvas, context, operations };
}
