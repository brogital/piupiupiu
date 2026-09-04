(function () {
  "use strict";

  const engine = new Match3Engine({ size: 8, moves: 28, goalColor: "violet", goalAmount: 20 });
  const boardEl = document.querySelector("#board");
  const lockEl = document.querySelector("#boardLock");
  const movesEl = document.querySelector("#movesValue");
  const scoreEl = document.querySelector("#scoreValue");
  const goalEl = document.querySelector("#goalValue");
  const scoreFillEl = document.querySelector("#scoreFill");
  const bestEl = document.querySelector("#bestScore");
  const statusEl = document.querySelector("#statusText");
  const comboEl = document.querySelector("#comboPill");
  const startModal = document.querySelector("#startModal");
  const resultModal = document.querySelector("#resultModal");
  const resultCard = resultModal.querySelector(".result-card");
  const soundButton = document.querySelector("#soundButton");
  let selected = null;
  let busy = true;
  let soundOn = true;
  let touchStart = null;
  let audioContext = null;

  function formatScore(value) { return new Intl.NumberFormat("ru-RU").format(value); }
  function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
  function bestScore() { return Number(localStorage.getItem("piupiu-best") || 0); }

  function sound(frequency = 440, duration = .07, type = "sine", volume = .035) {
    if (!soundOn) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(volume, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    } catch (_) { /* Sound is optional. */ }
  }

  function tileLabel(piece, index) {
    const names = { pink: "розовое", cyan: "голубое", lime: "зелёное", yellow: "жёлтое", violet: "фиолетовое", coral: "коралловое" };
    const specials = { row: ", горизонтальная ракета", column: ", вертикальная ракета", bomb: ", бомба", nova: ", нова" };
    return `${names[piece.color]} ядро${specials[piece.special] || ""}, строка ${Math.floor(index / 8) + 1}, столбец ${(index % 8) + 1}`;
  }

  function render(board = engine.board, options = {}) {
    const marks = { pink: "●", cyan: "◆", lime: "+", yellow: "★", violet: "▲", coral: "⬢" };
    boardEl.replaceChildren();
    board.forEach((piece, index) => {
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "tile";
      tile.dataset.index = index;
      tile.setAttribute("role", "gridcell");
      tile.setAttribute("aria-label", tileLabel(piece, index));
      if (index === selected) tile.classList.add("selected");
      if (options.clearing?.includes(index)) tile.classList.add("clearing");
      if (options.invalid?.includes(index)) tile.classList.add("invalid");
      const gem = document.createElement("span");
      gem.className = `gem ${piece.color}${piece.special ? ` special-${piece.special}` : ""}`;
      gem.setAttribute("aria-hidden", "true");
      const mark = document.createElement("span");
      mark.className = "gem-mark";
      mark.textContent = marks[piece.color];
      gem.append(mark);
      tile.append(gem);
      boardEl.append(tile);
    });
    updateHud();
  }

  function updateHud() {
    movesEl.textContent = engine.moves;
    scoreEl.textContent = formatScore(engine.score);
    goalEl.textContent = Math.max(0, engine.goalAmount - engine.collected);
    bestEl.textContent = formatScore(bestScore());
    scoreFillEl.style.width = `${Math.min(100, engine.collected / engine.goalAmount * 100)}%`;
  }

  function setBusy(value) {
    busy = value;
    lockEl.classList.toggle("active", value);
  }

  function showCombo(combo) {
    if (combo < 2) return;
    comboEl.textContent = combo === 2 ? "Комбо ×2" : combo === 3 ? "Суперкомбо ×3" : `Гиперкомбо ×${combo}`;
    comboEl.classList.remove("show");
    void comboEl.offsetWidth;
    comboEl.classList.add("show");
  }

  async function animateSwap(cells, invalid = false) {
    const [a, b] = cells;
    const tileA = boardEl.children[a];
    const tileB = boardEl.children[b];
    if (!tileA || !tileB) return;
    const gemA = tileA.querySelector(".gem");
    const gemB = tileB.querySelector(".gem");
    const rectA = tileA.getBoundingClientRect();
    const rectB = tileB.getBoundingClientRect();
    const dx = rectB.left - rectA.left;
    const dy = rectB.top - rectA.top;
    const timing = { duration: invalid ? 330 : 220, easing: invalid ? "ease-in-out" : "cubic-bezier(.2,.8,.25,1)", fill: "forwards" };
    const keyframesA = invalid
      ? [{ transform: "translate(0,0) scale(.94)" }, { transform: `translate(${dx * .42}px,${dy * .42}px) scale(1.08)`, offset: .45 }, { transform: "translate(0,0) scale(.94)" }]
      : [{ transform: "translate(0,0) scale(.94)", zIndex: 3 }, { transform: `translate(${dx}px,${dy}px) scale(1.08)`, zIndex: 3 }];
    const keyframesB = invalid
      ? [{ transform: "translate(0,0) scale(.94)" }, { transform: `translate(${-dx * .42}px,${-dy * .42}px) scale(1.08)`, offset: .45 }, { transform: "translate(0,0) scale(.94)" }]
      : [{ transform: "translate(0,0) scale(.94)", zIndex: 2 }, { transform: `translate(${-dx}px,${-dy}px) scale(1.08)`, zIndex: 2 }];
    await Promise.all([gemA.animate(keyframesA, timing).finished, gemB.animate(keyframesB, timing).finished]);
  }

  function animateFall() {
    boardEl.querySelectorAll(".gem").forEach((gem, index) => {
      const row = Math.floor(index / 8);
      gem.animate(
        [{ transform: "translateY(-55%) scale(.72)", opacity: .25 }, { transform: "translateY(7%) scale(1.03)", opacity: 1, offset: .78 }, { transform: "translateY(0) scale(.94)", opacity: 1 }],
        { duration: 260, delay: row * 8, easing: "cubic-bezier(.18,.75,.25,1)" }
      );
    });
  }

  async function playStages(result) {
    setBusy(true);
    for (const stage of result.stages) {
      if (stage.type === "swap") {
        await animateSwap(stage.cells);
        render(stage.board);
        sound(310, .05, "triangle");
        await sleep(35);
      } else if (stage.type === "invalid") {
        await animateSwap(stage.cells, true);
        render(stage.board, { invalid: stage.cells });
        sound(125, .12, "sawtooth", .02);
        statusEl.textContent = "Этот ход не собирает ряд";
        await sleep(290);
      } else if (stage.type === "clear") {
        render(stage.board, { clearing: stage.cells });
        showCombo(stage.combo);
        statusEl.textContent = stage.combo > 1 ? `Цепная реакция ×${stage.combo}!` : `+${stage.points} очков`;
        sound(460 + stage.combo * 90, .12, "sine", .045);
        await sleep(280);
      } else if (stage.type === "fall") {
        render(stage.board);
        animateFall();
        await sleep(285);
      } else if (stage.type === "shuffle") {
        statusEl.textContent = "Поле само перемешалось — ходов не осталось";
        render(stage.board);
        await sleep(320);
      }
    }
    render();
    setBusy(false);
  }

  async function makeMove(a, b) {
    selected = null;
    const result = engine.trySwap(a, b);
    await playStages(result);
    if (!result.valid) {
      statusEl.textContent = "Попробуй другую комбинацию";
      return;
    }
    if (result.won || result.over) {
      await sleep(240);
      finish(result.won);
    } else {
      const remaining = Math.max(0, engine.goalAmount - engine.collected);
      statusEl.textContent = `Ещё ${remaining} ${wordForm(remaining, ["ядро", "ядра", "ядер"])}`;
    }
  }

  function wordForm(number, forms) {
    const mod10 = number % 10;
    const mod100 = number % 100;
    return forms[(mod10 === 1 && mod100 !== 11) ? 0 : (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) ? 1 : 2];
  }

  function finish(won) {
    const previousBest = bestScore();
    if (engine.score > previousBest) localStorage.setItem("piupiu-best", engine.score);
    document.querySelector("#resultScore").textContent = formatScore(engine.score);
    document.querySelector("#resultKicker").textContent = won ? "Миссия выполнена" : "Почти получилось";
    document.querySelector("#resultTitle").textContent = won ? "Туманность сияет!" : "Закончились ходы";
    document.querySelector("#resultCopy").textContent = won
      ? (engine.score > previousBest ? "Новый рекорд! Космос впечатлён." : "Отличная цепная реакция.")
      : `Не хватило ${Math.max(0, engine.goalAmount - engine.collected)} ${wordForm(Math.max(0, engine.goalAmount - engine.collected), ["ядра", "ядер", "ядер"])}.`;
    document.querySelector("#resultIcon").textContent = won ? "✦" : "↻";
    resultCard.classList.toggle("lost", !won);
    resultModal.classList.add("visible");
    bestEl.textContent = formatScore(bestScore());
    if (won) { sound(660, .2, "sine", .06); setTimeout(() => sound(880, .35, "sine", .05), 130); }
  }

  function startGame() {
    engine.reset();
    selected = null;
    render();
    setBusy(false);
    startModal.classList.remove("visible");
    resultModal.classList.remove("visible");
    statusEl.textContent = "Поменяй соседние ядра местами";
    sound(520, .12, "sine");
  }

  function handleSelect(index) {
    if (busy) return;
    if (selected === null) {
      selected = index;
      render();
      sound(260, .035, "sine", .025);
      return;
    }
    if (selected === index) {
      selected = null;
      render();
      return;
    }
    if (!engine.areAdjacent(selected, index)) {
      selected = index;
      render();
      sound(280, .035, "sine", .025);
      return;
    }
    makeMove(selected, index);
  }

  boardEl.addEventListener("click", event => {
    const tile = event.target.closest(".tile");
    if (tile) handleSelect(Number(tile.dataset.index));
  });

  boardEl.addEventListener("pointerdown", event => {
    const tile = event.target.closest(".tile");
    if (!tile || busy) return;
    touchStart = { index: Number(tile.dataset.index), x: event.clientX, y: event.clientY };
  });

  boardEl.addEventListener("pointerup", event => {
    if (!touchStart || busy) return;
    const dx = event.clientX - touchStart.x;
    const dy = event.clientY - touchStart.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) { touchStart = null; return; }
    const row = engine.rowOf(touchStart.index);
    const col = engine.colOf(touchStart.index);
    let targetRow = row;
    let targetCol = col;
    if (Math.abs(dx) > Math.abs(dy)) targetCol += dx > 0 ? 1 : -1;
    else targetRow += dy > 0 ? 1 : -1;
    if (engine.isInside(targetRow, targetCol)) makeMove(touchStart.index, engine.index(targetRow, targetCol));
    touchStart = null;
  });

  document.querySelector("#startButton").addEventListener("click", startGame);
  document.querySelector("#playAgainButton").addEventListener("click", startGame);
  document.querySelector("#restartButton").addEventListener("click", startGame);

  document.querySelector("#hintButton").addEventListener("click", () => {
    if (busy) return;
    const hint = engine.findHint();
    if (!hint) return;
    boardEl.querySelectorAll(".hint").forEach(tile => tile.classList.remove("hint"));
    hint.forEach(index => boardEl.children[index].classList.add("hint"));
    statusEl.textContent = "Попробуй поменять подсвеченные ядра";
    sound(720, .1, "sine", .025);
  });

  document.querySelector("#shuffleButton").addEventListener("click", async () => {
    if (busy) return;
    setBusy(true);
    statusEl.textContent = "Перемешиваем звёздную пыль…";
    boardEl.animate([{ transform: "scale(1)" }, { transform: "scale(.94) rotate(-1deg)", opacity: .65 }, { transform: "scale(1)" }], { duration: 420, easing: "ease" });
    await sleep(190);
    engine.shuffle();
    selected = null;
    render();
    sound(390, .16, "triangle");
    setBusy(false);
    statusEl.textContent = "Готово — ищи новый ход";
  });

  soundButton.addEventListener("click", () => {
    soundOn = !soundOn;
    soundButton.textContent = soundOn ? "♪" : "×";
    soundButton.setAttribute("aria-label", soundOn ? "Выключить звук" : "Включить звук");
    if (soundOn) sound(520, .09, "sine");
  });

  render();
})();
