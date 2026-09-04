(function () {
  "use strict";

  const engine = new Match3Engine({ size: 8, moves: 9999, goalAmount: 9999 });
  const boardEl = document.querySelector("#board");
  const lockEl = document.querySelector("#boardLock");
  const statusEl = document.querySelector("#statusText");
  const comboEl = document.querySelector("#comboPill");
  const startModal = document.querySelector("#startModal");
  const resultModal = document.querySelector("#resultModal");
  const resultCard = resultModal.querySelector(".result-card");
  const soundButton = document.querySelector("#soundButton");
  const enemyCard = document.querySelector("#enemyCard");
  const heroes = {
    reynar: { color: "coral", mana: 0, max: 10, card: document.querySelector('[data-skill="reynar"]') },
    elli: { color: "cyan", mana: 0, max: 9, card: document.querySelector('[data-skill="elli"]') },
    saira: { color: "violet", mana: 0, max: 12, card: document.querySelector('[data-skill="saira"]') }
  };
  const battle = { hp: 150, maxHp: 150, shield: 0, enemyHp: 340, enemyMaxHp: 340, intent: 10, turn: 1, shards: 0, enemyTurns: 0 };
  let selected = null;
  let busy = true;
  let soundOn = true;
  let touchStart = null;
  let audioContext = null;

  function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

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
    const names = { pink: "череп", cyan: "голубой резонанс Элли", lime: "живая нить", yellow: "осколок знания", violet: "фиолетовый резонанс Сайры", coral: "красный резонанс Рейнара" };
    const specials = { row: ", знак линии", column: ", знак столба", bomb: ", взрывной знак", nova: ", дикий резонанс" };
    return `${names[piece.color]}${piece.cursed ? ", поражён порчей" : ""}${specials[piece.special] || ""}, строка ${Math.floor(index / 8) + 1}, столбец ${(index % 8) + 1}`;
  }

  function render(board = engine.board, options = {}) {
    const marks = { pink: "☠", cyan: "◆", lime: "+", yellow: "●", violet: "✦", coral: "▲" };
    boardEl.replaceChildren();
    board.forEach((piece, index) => {
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "tile";
      tile.dataset.index = index;
      tile.setAttribute("role", "gridcell");
      tile.setAttribute("aria-label", tileLabel(piece, index));
      if (index === selected) tile.classList.add("selected");
      if (piece.cursed) tile.classList.add("cursed");
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
    document.querySelector("#turnValue").textContent = battle.turn;
    document.querySelector("#enemyHpText").textContent = `${Math.max(0, battle.enemyHp)} / ${battle.enemyMaxHp}`;
    document.querySelector("#enemyHpFill").style.width = `${clamp(battle.enemyHp / battle.enemyMaxHp * 100, 0, 100)}%`;
    document.querySelector("#playerHpText").textContent = `${Math.max(0, battle.hp)} / ${battle.maxHp}`;
    document.querySelector("#playerHpFill").style.width = `${clamp(battle.hp / battle.maxHp * 100, 0, 100)}%`;
    document.querySelector("#shieldValue").classList.toggle("active", battle.shield > 0);
    document.querySelector("#shieldValue strong").textContent = battle.shield;
    document.querySelector("#enemyIntent strong").textContent = battle.intent;
    Object.entries(heroes).forEach(([key, hero]) => {
      document.querySelector(`#${key}Mana`).style.width = `${hero.mana / hero.max * 100}%`;
      document.querySelector(`#${key}ManaText`).textContent = `${hero.mana}/${hero.max}`;
      hero.card.disabled = busy || hero.mana < hero.max || battle.hp <= 0 || battle.enemyHp <= 0;
      hero.card.classList.toggle("ready", hero.mana >= hero.max);
    });
  }

  function setBusy(value) {
    busy = value;
    lockEl.classList.toggle("active", value);
    updateHud();
  }

  function showCombo(combo) {
    if (combo < 2) return;
    comboEl.textContent = combo === 2 ? "Цепь ×2" : combo === 3 ? "Резонанс ×3" : `БУРЯ ×${combo}`;
    comboEl.classList.remove("show");
    void comboEl.offsetWidth;
    comboEl.classList.add("show");
  }

  function floatText(text, target, kind = "damage") {
    const node = document.createElement("strong");
    node.className = `battle-float ${kind}`;
    node.textContent = text;
    target.append(node);
    node.addEventListener("animationend", () => node.remove(), { once: true });
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
    const timing = { duration: invalid ? 300 : 190, easing: "cubic-bezier(.2,.8,.25,1)", fill: "forwards" };
    const amount = invalid ? .42 : 1;
    const frames = (x, y) => invalid
      ? [{ transform: "translate(0,0) scale(.94)" }, { transform: `translate(${x * amount}px,${y * amount}px) scale(1.08)`, offset: .45 }, { transform: "translate(0,0) scale(.94)" }]
      : [{ transform: "translate(0,0) scale(.94)" }, { transform: `translate(${x}px,${y}px) scale(1.08)` }];
    await Promise.all([gemA.animate(frames(dx, dy), timing).finished, gemB.animate(frames(-dx, -dy), timing).finished]);
  }

  function animateFall() {
    boardEl.querySelectorAll(".gem").forEach((gem, index) => {
      gem.animate(
        [{ transform: "translateY(-48%) scale(.76)", opacity: .3 }, { transform: "translateY(5%) scale(1.02)", opacity: 1, offset: .78 }, { transform: "translateY(0) scale(.94)", opacity: 1 }],
        { duration: 220, delay: Math.floor(index / 8) * 6, easing: "cubic-bezier(.18,.75,.25,1)" }
      );
    });
  }

  async function playStages(result) {
    setBusy(true);
    for (const stage of result.stages) {
      if (stage.type === "swap") {
        await animateSwap(stage.cells);
        render(stage.board);
        sound(300, .05, "triangle");
      } else if (stage.type === "invalid") {
        await animateSwap(stage.cells, true);
        render(stage.board, { invalid: stage.cells });
        sound(120, .12, "sawtooth", .02);
        statusEl.textContent = "Этот ход не соединяет нити";
      } else if (stage.type === "clear") {
        render(stage.board, { clearing: stage.cells });
        showCombo(stage.combo);
        sound(430 + stage.combo * 90, .12, "sine", .045);
        await sleep(300);
      } else if (stage.type === "fall") {
        render(stage.board);
        animateFall();
        await sleep(245);
      } else if (stage.type === "shuffle") {
        statusEl.textContent = "Буря перестроила нити";
        render(stage.board);
        await sleep(260);
      }
    }
    render();
  }

  function summarize(stages) {
    const result = { pink: 0, cyan: 0, lime: 0, yellow: 0, violet: 0, coral: 0, cursed: 0, extraTurn: false };
    stages.filter(stage => stage.type === "clear").forEach(stage => {
      const weight = stage.combo || 1;
      stage.cells.forEach(index => {
        const piece = stage.board[index];
        if (!piece) return;
        result[piece.color] += weight;
        if (piece.cursed) result.cursed++;
      });
      if (stage.created?.length) result.extraTurn = true;
    });
    return result;
  }

  async function applyPlayerEffects(summary) {
    const skullDamage = summary.pink * 14;
    const curseDamage = summary.cursed * 8;
    if (skullDamage + curseDamage > 0) {
      battle.enemyHp -= skullDamage + curseDamage;
      enemyCard.classList.remove("hit");
      void enemyCard.offsetWidth;
      enemyCard.classList.add("hit");
      floatText(`−${skullDamage + curseDamage}`, enemyCard, "damage");
      sound(105, .18, "square", .04);
    }
    heroes.reynar.mana = clamp(heroes.reynar.mana + summary.coral, 0, heroes.reynar.max);
    heroes.elli.mana = clamp(heroes.elli.mana + summary.cyan, 0, heroes.elli.max);
    heroes.saira.mana = clamp(heroes.saira.mana + summary.violet, 0, heroes.saira.max);
    battle.shards += summary.yellow;
    if (summary.lime > 0) {
      const healing = Math.min(battle.maxHp - battle.hp, summary.lime * 2);
      battle.hp += healing;
      if (healing) floatText(`+${healing}`, document.querySelector(".player-vitals"), "heal");
    }
    updateHud();
    await sleep(260);
  }

  function curseTiles(count) {
    const available = engine.board.map((piece, index) => ({ piece, index })).filter(({ piece }) => !piece.cursed);
    for (let i = 0; i < count && available.length; i++) {
      const pick = Math.floor(Math.random() * available.length);
      available.splice(pick, 1)[0].piece.cursed = true;
    }
  }

  function cursedCount() { return engine.board.filter(piece => piece.cursed).length; }

  async function enemyTurn() {
    battle.enemyTurns++;
    document.querySelector("#enemyState").textContent = "Зверь втягивает свет…";
    enemyCard.classList.add("acting");
    await sleep(480);
    let incoming = battle.intent + Math.floor(cursedCount() / 3);
    const absorbed = Math.min(battle.shield, incoming);
    battle.shield -= absorbed;
    incoming -= absorbed;
    battle.hp -= incoming;
    if (absorbed) floatText(`Щит −${absorbed}`, document.querySelector(".player-vitals"), "shield");
    if (incoming) floatText(`−${incoming}`, document.querySelector(".player-vitals"), "damage");
    document.querySelector(".player-vitals").classList.add("hit");
    await sleep(330);
    document.querySelector(".player-vitals").classList.remove("hit");
    enemyCard.classList.remove("acting");
    if (battle.enemyTurns % 3 === 0) {
      curseTiles(3);
      statusEl.textContent = "Порча расползается по полю";
      render();
      await sleep(360);
    }
    battle.intent = randomInt(8, 11);
    battle.turn++;
    document.querySelector("#enemyState").textContent = cursedCount() ? `Порча на поле: ${cursedCount()}` : "Ищет слабое место в защите";
    updateHud();
  }

  async function makeMove(a, b) {
    if (busy) return;
    selected = null;
    const result = engine.trySwap(a, b);
    await playStages(result);
    if (!result.valid) {
      statusEl.textContent = "Попробуй другой ход";
      setBusy(false);
      return;
    }
    const summary = summarize(result.stages);
    await applyPlayerEffects(summary);
    if (battle.enemyHp <= 0) return finish(true);
    if (summary.extraTurn) {
      statusEl.textContent = "Четыре в ряд — дополнительный ход!";
      sound(760, .2, "sine", .045);
      setBusy(false);
      return;
    }
    await enemyTurn();
    if (battle.hp <= 0) return finish(false);
    statusEl.textContent = "Выбери: удар, мана или защита";
    setBusy(false);
  }

  async function castSkill(key) {
    const hero = heroes[key];
    if (busy || hero.mana < hero.max) return;
    setBusy(true);
    hero.mana = 0;
    hero.card.classList.remove("cast");
    void hero.card.offsetWidth;
    hero.card.classList.add("cast");
    if (key === "reynar") {
      battle.enemyHp -= 78;
      enemyCard.classList.add("hit");
      floatText("−78", enemyCard, "damage");
      statusEl.textContent = "Рейнар рассекает панцирь зверя";
      sound(92, .24, "square", .055);
      await sleep(520);
    } else if (key === "elli") {
      battle.shield += 34;
      floatText("Щит +34", document.querySelector(".player-vitals"), "shield");
      statusEl.textContent = "Элли ставит Якорный щит";
      sound(640, .25, "sine", .045);
      await sleep(480);
    } else {
      const counts = {};
      engine.board.forEach(piece => { if (piece.color !== "violet") counts[piece.color] = (counts[piece.color] || 0) + 1; });
      const target = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
      statusEl.textContent = "Сайра разрывает самую сильную нить";
      const result = engine.activateColorClear(target);
      await playStages(result);
      await applyPlayerEffects(summarize(result.stages));
    }
    enemyCard.classList.remove("hit");
    updateHud();
    if (battle.enemyHp <= 0) return finish(true);
    statusEl.textContent = "Способность не тратит ход";
    setBusy(false);
  }

  function finish(won) {
    setBusy(true);
    document.querySelector("#resultScore").textContent = battle.shards;
    document.querySelector("#resultKicker").textContent = won ? "Пожиратель повержен" : "Отряд пал";
    document.querySelector("#resultTitle").textContent = won ? "Маяк снова горит" : "Буря забрала маяк";
    document.querySelector("#resultCopy").textContent = won
      ? "В глубине механизма просыпается чужой голос: «Вы опоздали на пятьсот лет»."
      : "Осколок гаснет, но время ещё можно повернуть вспять.";
    document.querySelector("#resultIcon").textContent = won ? "✦" : "◈";
    resultCard.classList.toggle("lost", !won);
    resultModal.classList.add("visible");
    if (won) { sound(660, .2, "sine", .06); setTimeout(() => sound(880, .35, "sine", .05), 130); }
  }

  function resetBattle() {
    engine.reset();
    Object.values(heroes).forEach(hero => { hero.mana = 0; });
    Object.assign(battle, { hp: 150, maxHp: 150, shield: 0, enemyHp: 340, enemyMaxHp: 340, intent: 10, turn: 1, shards: 0, enemyTurns: 0 });
    selected = null;
    resultModal.classList.remove("visible");
    startModal.classList.remove("visible");
    enemyCard.classList.remove("hit", "acting");
    document.querySelector("#enemyState").textContent = "Пробуждается в пепле старого маяка";
    render();
    setBusy(false);
    statusEl.textContent = "Черепа бьют, цвета заряжают героев";
    sound(510, .13, "sine");
  }

  function handleSelect(index) {
    if (busy) return;
    if (selected === null || !engine.areAdjacent(selected, index)) {
      selected = selected === index ? null : index;
      render();
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
    let row = engine.rowOf(touchStart.index);
    let col = engine.colOf(touchStart.index);
    if (Math.abs(dx) > Math.abs(dy)) col += dx > 0 ? 1 : -1;
    else row += dy > 0 ? 1 : -1;
    if (engine.isInside(row, col)) makeMove(touchStart.index, engine.index(row, col));
    touchStart = null;
  });

  document.querySelector("#startButton").addEventListener("click", resetBattle);
  document.querySelector("#playAgainButton").addEventListener("click", resetBattle);
  document.querySelector("#restartButton").addEventListener("click", resetBattle);
  document.querySelectorAll(".hero-card").forEach(card => card.addEventListener("click", () => castSkill(card.dataset.skill)));
  document.querySelector("#hintButton").addEventListener("click", () => {
    if (busy) return;
    const hint = engine.findHint();
    if (!hint) return;
    hint.forEach(index => boardEl.children[index].classList.add("hint"));
    statusEl.textContent = "Буря подсказывает возможный ход";
  });
  soundButton.addEventListener("click", () => {
    soundOn = !soundOn;
    soundButton.textContent = soundOn ? "♪" : "×";
    soundButton.setAttribute("aria-label", soundOn ? "Выключить звук" : "Включить звук");
    if (soundOn) sound(520, .09, "sine");
  });

  render();
})();
