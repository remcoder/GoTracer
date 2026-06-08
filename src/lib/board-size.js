export const DEFAULT_BOARD_SIZE = 19;
export const SUPPORTED_BOARD_SIZES = Object.freeze([9, 13, 19]);

export function validateBoardSize(boardSize) {
  if (!Number.isInteger(boardSize)) {
    throw new TypeError(`boardSize must be an integer; received ${String(boardSize)}.`);
  }

  if (!SUPPORTED_BOARD_SIZES.includes(boardSize)) {
    throw new RangeError(
      `Unsupported boardSize ${boardSize}. Supported sizes are ${SUPPORTED_BOARD_SIZES.join(', ')}.`
    );
  }

  return boardSize;
}
