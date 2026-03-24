import numpy as np

class Game2048:
    def __init__(self):
        self.board = np.zeros((4, 4), dtype=int)
        self.score = 0
        self.add_tile()
        self.add_tile()

    def add_tile(self):
        empty = list(zip(*np.where(self.board == 0)))
        if empty:
            r, c = empty[np.random.randint(len(empty))]
            self.board[r, c] = 4 if np.random.random() > 0.9 else 2

    def _merge_row(self, row):
        r = row[row != 0]
        merged, skip, score = [], False, 0
        for i in range(len(r)):
            if skip:
                skip = False
                continue
            if i + 1 < len(r) and r[i] == r[i+1]:
                merged.append(r[i] * 2)
                score += r[i] * 2
                skip = True
            else:
                merged.append(r[i])
        merged += [0] * (4 - len(merged))
        return np.array(merged), score

    def move(self, direction):
        # 0=up, 1=down, 2=left, 3=right
        b = self.board.copy()
        score_gain = 0
        if direction == 0:   b = b.T
        elif direction == 1: b = b[::-1].T
        elif direction == 3: b = b[:, ::-1]

        new_b = []
        for row in b:
            merged, s = self._merge_row(row)
            new_b.append(merged)
            score_gain += s
        b = np.array(new_b)

        if direction == 0:   b = b.T
        elif direction == 1: b = b.T[::-1]
        elif direction == 3: b = b[:, ::-1]

        if not np.array_equal(b, self.board):
            self.board = b
            self.score += score_gain
            self.add_tile()
            return True
        return False

    def valid_moves(self):
        return [d for d in range(4) if self._is_valid(d)]

    def _is_valid(self, direction):
        tmp = Game2048.__new__(Game2048)
        tmp.board = self.board.copy()
        tmp.score = self.score
        b = tmp.board.copy()
        if direction == 0:   b = b.T
        elif direction == 1: b = b[::-1].T
        elif direction == 3: b = b[:, ::-1]
        new_b = []
        for row in b:
            merged, _ = tmp._merge_row(row)
            new_b.append(merged)
        b = np.array(new_b)
        if direction == 0:   b = b.T
        elif direction == 1: b = b.T[::-1]
        elif direction == 3: b = b[:, ::-1]
        return not np.array_equal(b, self.board)

    def is_over(self):
        return len(self.valid_moves()) == 0

    def state_dict(self):
        return {
            "board": self.board.tolist(),
            "score": int(self.score),
            "over": self.is_over()
        }