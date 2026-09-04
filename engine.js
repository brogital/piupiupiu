(function (root, factory) {
  const Engine = factory();
  if (typeof module === "object" && module.exports) module.exports = Engine;
  else root.Match3Engine = Engine;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const COLORS = ["pink", "cyan", "lime", "yellow", "violet", "coral"];

  class Match3Engine {
    constructor(options = {}) {
      this.size = options.size || 8;
      this.startMoves = options.moves || 28;
      this.goalColor = options.goalColor || "violet";
      this.goalAmount = options.goalAmount || 20;
      this.random = options.random || Math.random;
      this.reset();
    }

    reset() {
      this.moves = this.startMoves;
      this.score = 0;
      this.collected = 0;
      this.board = this.makeBoard();
      return this.snapshot();
    }

    makePiece(color, special = null) { return { color, special }; }
    cloneBoard(board = this.board) { return board.map(piece => piece ? { ...piece } : null); }
    snapshot() { return { board: this.cloneBoard(), moves: this.moves, score: this.score, collected: this.collected }; }
    rowOf(index) { return Math.floor(index / this.size); }
    colOf(index) { return index % this.size; }
    index(row, col) { return row * this.size + col; }
    isInside(row, col) { return row >= 0 && col >= 0 && row < this.size && col < this.size; }
    areAdjacent(a, b) { return Math.abs(this.rowOf(a) - this.rowOf(b)) + Math.abs(this.colOf(a) - this.colOf(b)) === 1; }

    randomColor() { return COLORS[Math.floor(this.random() * COLORS.length)]; }

    makeBoard() {
      const board = Array(this.size * this.size).fill(null);
      for (let row = 0; row < this.size; row++) {
        for (let col = 0; col < this.size; col++) {
          let choices = COLORS.slice();
          if (col >= 2 && board[this.index(row, col - 1)].color === board[this.index(row, col - 2)].color) {
            choices = choices.filter(color => color !== board[this.index(row, col - 1)].color);
          }
          if (row >= 2 && board[this.index(row - 1, col)].color === board[this.index(row - 2, col)].color) {
            choices = choices.filter(color => color !== board[this.index(row - 1, col)].color);
          }
          board[this.index(row, col)] = this.makePiece(choices[Math.floor(this.random() * choices.length)]);
        }
      }
      this.board = board;
      if (!this.findHint()) return this.makeBoard();
      return board;
    }

    findGroups(board = this.board) {
      const groups = [];
      for (let row = 0; row < this.size; row++) {
        let start = 0;
        for (let col = 1; col <= this.size; col++) {
          const current = col < this.size ? board[this.index(row, col)] : null;
          const first = board[this.index(row, start)];
          if (current && first && current.color === first.color) continue;
          if (first && col - start >= 3) {
            groups.push({ orientation: "row", cells: Array.from({ length: col - start }, (_, i) => this.index(row, start + i)), color: first.color });
          }
          start = col;
        }
      }
      for (let col = 0; col < this.size; col++) {
        let start = 0;
        for (let row = 1; row <= this.size; row++) {
          const current = row < this.size ? board[this.index(row, col)] : null;
          const first = board[this.index(start, col)];
          if (current && first && current.color === first.color) continue;
          if (first && row - start >= 3) {
            groups.push({ orientation: "column", cells: Array.from({ length: row - start }, (_, i) => this.index(start + i, col)), color: first.color });
          }
          start = row;
        }
      }
      return groups;
    }

    swap(a, b, board = this.board) { [board[a], board[b]] = [board[b], board[a]]; }

    findHint() {
      for (let i = 0; i < this.board.length; i++) {
        const neighbors = [];
        if (this.colOf(i) + 1 < this.size) neighbors.push(i + 1);
        if (this.rowOf(i) + 1 < this.size) neighbors.push(i + this.size);
        for (const next of neighbors) {
          if (this.board[i].special === "nova" || this.board[next].special === "nova") return [i, next];
          this.swap(i, next);
          const works = this.findGroups().length > 0;
          this.swap(i, next);
          if (works) return [i, next];
        }
      }
      return null;
    }

    expandedClear(initial) {
      const clear = new Set(initial);
      const activated = new Set();
      let changed = true;
      while (changed) {
        changed = false;
        for (const idx of Array.from(clear)) {
          const piece = this.board[idx];
          if (!piece || !piece.special || activated.has(idx)) continue;
          activated.add(idx);
          const row = this.rowOf(idx);
          const col = this.colOf(idx);
          const before = clear.size;
          if (piece.special === "row") {
            for (let c = 0; c < this.size; c++) clear.add(this.index(row, c));
          } else if (piece.special === "column") {
            for (let r = 0; r < this.size; r++) clear.add(this.index(r, col));
          } else if (piece.special === "bomb") {
            for (let r = row - 1; r <= row + 1; r++) for (let c = col - 1; c <= col + 1; c++) if (this.isInside(r, c)) clear.add(this.index(r, c));
          } else if (piece.special === "nova") {
            const color = piece.color;
            this.board.forEach((candidate, candidateIndex) => { if (candidate && candidate.color === color) clear.add(candidateIndex); });
          }
          if (clear.size > before) changed = true;
        }
      }
      return clear;
    }

    chooseCreators(groups, preferred = []) {
      const creators = new Map();
      const membership = new Map();
      groups.forEach(group => group.cells.forEach(cell => membership.set(cell, (membership.get(cell) || 0) + 1)));
      const intersection = Array.from(membership.entries()).find(([, count]) => count > 1);
      if (intersection) {
        const cell = preferred.find(p => membership.get(p) > 1) ?? intersection[0];
        const piece = this.board[cell];
        if (piece) creators.set(cell, this.makePiece(piece.color, "bomb"));
      }
      for (const group of groups) {
        if (group.cells.some(cell => creators.has(cell))) continue;
        let special = null;
        if (group.cells.length >= 5) special = "nova";
        else if (group.cells.length === 4) special = group.orientation;
        if (!special) continue;
        const cell = preferred.find(p => group.cells.includes(p)) ?? group.cells[Math.floor(group.cells.length / 2)];
        if (!creators.has(cell)) creators.set(cell, this.makePiece(group.color, special));
      }
      return creators;
    }

    clearAndCollapse(initialClear, creators, combo, stages) {
      const clear = this.expandedClear(initialClear);
      creators.forEach((_, index) => clear.delete(index));
      const boardBefore = this.cloneBoard();
      let targetCount = 0;
      clear.forEach(index => {
        if (this.board[index] && this.board[index].color === this.goalColor) targetCount++;
      });
      const points = clear.size * 60 * combo + creators.size * 180;
      this.score += points;
      this.collected += targetCount;
      stages.push({ type: "clear", board: boardBefore, cells: Array.from(clear), combo, points, collected: targetCount });
      clear.forEach(index => { this.board[index] = null; });
      creators.forEach((piece, index) => { this.board[index] = piece; });

      for (let col = 0; col < this.size; col++) {
        const stack = [];
        for (let row = this.size - 1; row >= 0; row--) {
          const piece = this.board[this.index(row, col)];
          if (piece) stack.push(piece);
        }
        for (let row = this.size - 1; row >= 0; row--) {
          this.board[this.index(row, col)] = stack[this.size - 1 - row] || this.makePiece(this.randomColor());
        }
      }
      stages.push({ type: "fall", board: this.cloneBoard() });
    }

    trySwap(a, b) {
      if (!Number.isInteger(a) || !Number.isInteger(b) || !this.areAdjacent(a, b) || this.moves <= 0) return { valid: false, stages: [] };
      const stages = [];
      const first = this.board[a];
      const second = this.board[b];
      this.swap(a, b);
      stages.push({ type: "swap", board: this.cloneBoard(), cells: [a, b] });

      if (first.special === "nova" || second.special === "nova") {
        this.moves--;
        const novaIndex = first.special === "nova" ? b : a;
        const partnerIndex = novaIndex === a ? b : a;
        const partner = this.board[partnerIndex];
        const clear = new Set([novaIndex]);
        this.board.forEach((piece, index) => { if (piece && piece.color === partner.color) clear.add(index); });
        this.clearAndCollapse(clear, new Map(), 1, stages);
        let groups = this.findGroups();
        let combo = 2;
        while (groups.length) {
          const matched = new Set(groups.flatMap(group => group.cells));
          const creators = this.chooseCreators(groups);
          this.clearAndCollapse(matched, creators, combo, stages);
          groups = this.findGroups();
          combo++;
        }
      } else {
        let groups = this.findGroups();
        if (!groups.length) {
          this.swap(a, b);
          return { valid: false, stages: [{ type: "invalid", board: this.cloneBoard(), cells: [a, b] }] };
        }
        this.moves--;
        let combo = 1;
        let preferred = [b, a];
        while (groups.length) {
          const matched = new Set(groups.flatMap(group => group.cells));
          const creators = this.chooseCreators(groups, preferred);
          this.clearAndCollapse(matched, creators, combo, stages);
          groups = this.findGroups();
          combo++;
          preferred = [];
        }
      }

      let shuffled = false;
      if (!this.findHint() && this.moves > 0) {
        this.shuffle();
        stages.push({ type: "shuffle", board: this.cloneBoard() });
        shuffled = true;
      }
      return { valid: true, stages, shuffled, state: this.snapshot(), won: this.collected >= this.goalAmount, over: this.moves <= 0 };
    }

    shuffle() {
      const pieces = this.board.map(piece => ({ ...piece, special: null }));
      let attempts = 0;
      do {
        for (let i = pieces.length - 1; i > 0; i--) {
          const j = Math.floor(this.random() * (i + 1));
          [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
        }
        this.board = pieces.map(piece => ({ ...piece }));
        attempts++;
        if (attempts > 100) { this.board = this.makeBoard(); break; }
      } while (this.findGroups().length || !this.findHint());
      return this.snapshot();
    }
  }

  Match3Engine.COLORS = COLORS;
  return Match3Engine;
});
