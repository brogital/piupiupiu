(function () {
  "use strict";

  const LEVELS = [
    { roman: "Ⅰ", title: "Пепельный спуск", name: "Осколочник", className: "Порождение бури", hp: 180, min: 6, max: 8, reward: 4, curseEvery: 4, state: "Кружит над разрушенной дорогой", story: "Первый путь к маяку усеян живыми обломками. Они слышат каждый всплеск резонанса." },
    { roman: "Ⅱ", title: "Разорванный мост", name: "Ветровой гончий", className: "Хищник разлома", hp: 230, min: 7, max: 10, reward: 5, curseEvery: 3, state: "Готовится сорваться с цепей", story: "Между островами остались только цепи. На них охотится зверь, который умеет красть ветер." },
    { roman: "Ⅲ", title: "Страж Якоря", name: "Пустой латник", className: "Элитный страж", hp: 285, min: 8, max: 11, reward: 7, curseEvery: 3, state: "Держит проход к нижним ярусам", story: "Доспех помнит приказ, но забыл хозяина. Чтобы пройти, придётся разбить его клятву." },
    { roman: "Ⅳ", title: "Сердце механизма", name: "Слепой проводник", className: "Искажённый резонатор", hp: 345, min: 9, max: 12, reward: 8, curseEvery: 3, startCurses: 4, state: "Порча уже впилась в механизм", story: "Внутри маяка мир звучит неправильно. Кто-то настроил его сердце на частоту Бездны." },
    { roman: "Ⅴ", title: "Сломанный маяк", name: "Пожиратель света", className: "Древний зверь", hp: 430, min: 10, max: 14, reward: 12, curseEvery: 2, startCurses: 3, state: "Втягивает последний свет маяка", story: "Источник Беззвучной Бури смотрит из-под обсидианового панциря. Маяк погаснет навсегда, если отряд отступит." }
  ];
  const SAVE_KEY = "shards-of-storm-v2";
  const defaultProgress = { unlocked: 0, completed: [], shards: 0, ranks: { reynar: 1, elli: 1, saira: 1 } };
  let progress = loadProgress();
  let currentLevel = 0;
  let engine = new Match3Engine({ size: 8, moves: 9999, goalAmount: 9999 });
  let selected = null;
  let busy = true;
  let soundOn = true;
  let touchStart = null;
  let audioContext = null;

  const boardEl = document.querySelector("#board");
  const lockEl = document.querySelector("#boardLock");
  const statusEl = document.querySelector("#statusText");
  const comboEl = document.querySelector("#comboPill");
  const startModal = document.querySelector("#startModal");
  const resultModal = document.querySelector("#resultModal");
  const resultCard = resultModal.querySelector(".result-card");
  const soundButton = document.querySelector("#soundButton");
  const enemyCard = document.querySelector("#enemyCard");
  const battleScreen = document.querySelector("#battleScreen");
  const heroes = {
    reynar: { color: "coral", mana: 0, max: 10, card: document.querySelector('[data-skill="reynar"]') },
    elli: { color: "cyan", mana: 0, max: 9, card: document.querySelector('[data-skill="elli"]') },
    saira: { color: "violet", mana: 0, max: 12, card: document.querySelector('[data-skill="saira"]') }
  };
  const battle = { hp: 150, maxHp: 150, shield: 0, enemyHp: 180, enemyMaxHp: 180, intent: 7, turn: 1, shards: 0, enemyTurns: 0 };

  function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      return saved ? { ...defaultProgress, ...saved, ranks: { ...defaultProgress.ranks, ...saved.ranks } } : structuredClone(defaultProgress);
    } catch (_) { return structuredClone(defaultProgress); }
  }
  function saveProgress() { localStorage.setItem(SAVE_KEY, JSON.stringify(progress)); }
  function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function roman(rank) { return ["0", "I", "II", "III", "IV", "V"][rank] || rank; }

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
    } catch (_) { /* audio is optional */ }
  }

  function showToast(message, bad = false) {
    const toast = document.querySelector("#toast");
    toast.textContent = message;
    toast.classList.toggle("bad", bad);
    toast.classList.remove("show");
    void toast.offsetWidth;
    toast.classList.add("show");
  }

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach(screen => screen.classList.toggle("active", screen.id === id));
    document.body.classList.toggle("in-battle", id === "battleScreen");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderProgress() {
    document.querySelector("#shardWallet").textContent = progress.shards;
    document.querySelector("#campaignFill").style.width = `${(progress.unlocked + 1) / LEVELS.length * 100}%`;
    document.querySelector("#campaignText").textContent = progress.completed.length === LEVELS.length
      ? "Глава пройдена · можно переигрывать бои"
      : `Открыт ${progress.unlocked + 1} из ${LEVELS.length} узлов`;
    document.querySelectorAll(".map-node").forEach((node, index) => {
      const locked = index > progress.unlocked;
      node.disabled = locked;
      node.classList.toggle("locked", locked);
      node.classList.toggle("completed", progress.completed.includes(index));
      node.classList.toggle("current", index === progress.unlocked && !progress.completed.includes(index));
      node.querySelector(".node-icon").textContent = progress.completed.includes(index) ? "✓" : locked ? "◆" : LEVELS[index].roman;
    });
    Object.keys(heroes).forEach(key => {
      const rank = progress.ranks[key];
      const cost = 8 + (rank - 1) * 6;
      document.querySelector(`#${key}Rank`).textContent = rank;
      document.querySelector(`#${key}BattleRank`).textContent = roman(rank);
      document.querySelector(`[data-upgrade="${key}"]`).innerHTML = rank >= 5 ? "Максимальный ранг" : `Усилить · <b>${cost} ✦</b>`;
      document.querySelector(`[data-upgrade="${key}"]`).disabled = rank >= 5;
    });
    document.querySelector("#reynarPower").textContent = 78 + (progress.ranks.reynar - 1) * 22;
    document.querySelector("#elliPower").textContent = 34 + (progress.ranks.elli - 1) * 12;
    document.querySelector("#sairaPower").textContent = `${progress.ranks.saira + 1}/знак`;
  }

  function openEncounter(index) {
    if (index > progress.unlocked) return;
    currentLevel = index;
    const level = LEVELS[index];
    document.querySelector("#storyNumber").textContent = level.roman;
    document.querySelector("#storyKicker").textContent = `Глава I · Узел ${level.roman}`;
    document.querySelector("#startTitle").textContent = level.title;
    document.querySelector("#storyCopy").textContent = level.story;
    document.querySelector("#previewHp").textContent = level.hp;
    document.querySelector("#previewReward").textContent = `${level.reward} ✦`;
    startModal.classList.add("visible");
  }

  function tileLabel(piece, index) {
    const names = { pink: "череп", cyan: "руна воды", lime: "руна жизни", yellow: "руна света", violet: "руна бездны", coral: "руна огня" };
    const specials = { row: ", знак линии", column: ", знак столба", bomb: ", взрывной знак", nova: ", дикий резонанс" };
    return `${names[piece.color]}${piece.cursed ? ", поражена порчей" : ""}${specials[piece.special] || ""}, строка ${Math.floor(index / 8) + 1}, столбец ${index % 8 + 1}`;
  }

  function render(board = engine.board, options = {}) {
    const marks = { pink: "☠", cyan: "≋", lime: "❧", yellow: "☀", violet: "✦", coral: "♨" };
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
    const tileA = boardEl.children[a], tileB = boardEl.children[b];
    if (!tileA || !tileB) return;
    const gemA = tileA.querySelector(".gem"), gemB = tileB.querySelector(".gem");
    const rectA = tileA.getBoundingClientRect(), rectB = tileB.getBoundingClientRect();
    const dx = rectB.left - rectA.left, dy = rectB.top - rectA.top;
    const timing = { duration: invalid ? 320 : 220, easing: "cubic-bezier(.18,.82,.24,1)", fill: "forwards" };
    const frames = (x, y) => invalid
      ? [{ transform: "translate(0) scale(.94)" }, { transform: `translate(${x * .4}px,${y * .4}px) scale(1.12)`, offset: .45 }, { transform: "translate(0) scale(.94)" }]
      : [{ transform: "translate(0) scale(.94)" }, { transform: `translate(${x}px,${y}px) scale(1.1) rotate(6deg)` }];
    await Promise.all([gemA.animate(frames(dx, dy), timing).finished, gemB.animate(frames(-dx, -dy), timing).finished]);
  }

  function animateFall() {
    boardEl.querySelectorAll(".gem").forEach((gem, index) => gem.animate(
      [{ transform: "translateY(-75%) scale(.68)", opacity: .1 }, { transform: "translateY(8%) scale(1.08)", opacity: 1, offset: .75 }, { transform: "translateY(0) scale(.94)", opacity: 1 }],
      { duration: 300, delay: Math.floor(index / 8) * 8, easing: "cubic-bezier(.12,.75,.24,1)" }
    ));
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
        statusEl.textContent = "Нити не соединяются";
      } else if (stage.type === "clear") {
        render(stage.board, { clearing: stage.cells });
        showCombo(stage.combo);
        battleScreen.classList.add("impact");
        setTimeout(() => battleScreen.classList.remove("impact"), 260);
        sound(410 + stage.combo * 100, .14, "sine", .05);
        await sleep(390);
      } else if (stage.type === "fall") {
        render(stage.board);
        animateFall();
        await sleep(330);
      } else if (stage.type === "shuffle") {
        statusEl.textContent = "Буря перестраивает руны";
        render(stage.board);
        await sleep(320);
      }
    }
    render();
  }

  function summarize(stages) {
    const result = { pink: 0, cyan: 0, lime: 0, yellow: 0, violet: 0, coral: 0, cursed: 0, extraTurn: false, total: 0 };
    stages.filter(stage => stage.type === "clear").forEach(stage => {
      const weight = stage.combo || 1;
      stage.cells.forEach(index => {
        const piece = stage.board[index];
        if (!piece) return;
        result[piece.color] += weight;
        result.total++;
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
      floatText(`−${skullDamage + curseDamage}`, enemyCard);
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
    await sleep(280);
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
    const level = LEVELS[currentLevel];
    battle.enemyTurns++;
    document.querySelector("#enemyState").textContent = "Зверь накапливает бурю…";
    enemyCard.classList.add("acting");
    await sleep(560);
    let incoming = battle.intent + Math.floor(cursedCount() / 3);
    const absorbed = Math.min(battle.shield, incoming);
    battle.shield -= absorbed;
    incoming -= absorbed;
    battle.hp -= incoming;
    if (absorbed) floatText(`Щит −${absorbed}`, document.querySelector(".player-vitals"), "shield");
    if (incoming) floatText(`−${incoming}`, document.querySelector(".player-vitals"));
    document.querySelector(".player-vitals").classList.add("hit");
    await sleep(380);
    document.querySelector(".player-vitals").classList.remove("hit");
    enemyCard.classList.remove("acting");
    if (battle.enemyTurns % level.curseEvery === 0) {
      curseTiles(currentLevel >= 3 ? 4 : 3);
      statusEl.textContent = "Порча впивается в стихийные руны";
      render();
      await sleep(450);
    }
    battle.intent = randomInt(level.min, level.max);
    battle.turn++;
    document.querySelector("#enemyState").textContent = cursedCount() ? `Порча на поле: ${cursedCount()}` : level.state;
    updateHud();
  }

  async function makeMove(a, b) {
    if (busy) return;
    selected = null;
    const result = engine.trySwap(a, b);
    await playStages(result);
    if (!result.valid) { statusEl.textContent = "Попробуй другой ход"; setBusy(false); return; }
    const summary = summarize(result.stages);
    await applyPlayerEffects(summary);
    if (battle.enemyHp <= 0) return finish(true);
    if (summary.extraTurn) {
      statusEl.textContent = "Сильный резонанс — дополнительный ход!";
      sound(760, .2, "sine", .045);
      setBusy(false);
      return;
    }
    await enemyTurn();
    if (battle.hp <= 0) return finish(false);
    statusEl.textContent = "Выбери цель: урон, мана или выживание";
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
      const damage = 78 + (progress.ranks.reynar - 1) * 22;
      battle.enemyHp -= damage;
      enemyCard.classList.add("hit");
      floatText(`−${damage}`, enemyCard);
      statusEl.textContent = "Рейнар рассекает панцирь";
      sound(92, .26, "square", .06);
      await sleep(600);
    } else if (key === "elli") {
      const shield = 34 + (progress.ranks.elli - 1) * 12;
      battle.shield += shield;
      floatText(`Щит +${shield}`, document.querySelector(".player-vitals"), "shield");
      statusEl.textContent = "Элли замыкает Якорный щит";
      sound(640, .28, "sine", .05);
      await sleep(560);
    } else {
      const counts = {};
      engine.board.forEach(piece => { if (piece.color !== "violet") counts[piece.color] = (counts[piece.color] || 0) + 1; });
      const target = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
      statusEl.textContent = "Сайра разрывает доминирующую нить";
      const result = engine.activateColorClear(target);
      const summary = summarize(result.stages);
      await playStages(result);
      await applyPlayerEffects(summary);
      const damage = summary.total * (progress.ranks.saira + 1);
      battle.enemyHp -= damage;
      if (damage) { floatText(`−${damage}`, enemyCard); enemyCard.classList.add("hit"); }
    }
    enemyCard.classList.remove("hit");
    updateHud();
    if (battle.enemyHp <= 0) return finish(true);
    statusEl.textContent = "Способность не тратит ход";
    setBusy(false);
  }

  function finish(won) {
    setBusy(true);
    const level = LEVELS[currentLevel];
    const firstWin = !progress.completed.includes(currentLevel);
    const reward = won ? level.reward + battle.shards + (firstWin ? 2 : 0) : 0;
    if (won) {
      if (firstWin) progress.completed.push(currentLevel);
      progress.unlocked = Math.max(progress.unlocked, Math.min(LEVELS.length - 1, currentLevel + 1));
      progress.shards += reward;
      saveProgress();
      renderProgress();
    }
    document.querySelector("#resultKicker").textContent = won ? "Резонанс восстановлен" : "Отряд рассеян";
    document.querySelector("#resultTitle").textContent = won ? (currentLevel === 4 ? "Маяк снова горит" : "Путь свободен") : "Буря сильнее";
    document.querySelector("#resultCopy").textContent = won
      ? (currentLevel === 4 ? "Из сердца механизма доносится голос: «Вы опоздали на пятьсот лет». Глава II скоро откроется." : "Новый участок архипелага проявляется сквозь бурю.")
      : "Улучшай героев, выбирай защитные нити и возвращайся к узлу.";
    document.querySelector("#resultIcon").textContent = won ? "✦" : "◈";
    document.querySelector("#resultReward").textContent = won ? `+${reward} ✦` : "0";
    document.querySelector("#resultUnlock").textContent = won && currentLevel < 4 ? LEVELS[currentLevel + 1].roman : won ? "Глава II" : "—";
    resultCard.classList.toggle("lost", !won);
    resultModal.classList.add("visible");
    if (won) { sound(660, .2, "sine", .06); setTimeout(() => sound(880, .36, "sine", .05), 140); }
  }

  function startBattle() {
    const level = LEVELS[currentLevel];
    engine.reset();
    Object.values(heroes).forEach(hero => { hero.mana = 0; });
    const bonusHp = (Object.values(progress.ranks).reduce((a, b) => a + b, 0) - 3) * 8;
    Object.assign(battle, { hp: 150 + bonusHp, maxHp: 150 + bonusHp, shield: 0, enemyHp: level.hp, enemyMaxHp: level.hp, intent: randomInt(level.min, level.max), turn: 1, shards: 0, enemyTurns: 0 });
    if (level.startCurses) curseTiles(level.startCurses);
    selected = null;
    startModal.classList.remove("visible");
    resultModal.classList.remove("visible");
    showScreen("battleScreen");
    battleScreen.className = `screen battle-screen active enemy-phase-${currentLevel}`;
    document.querySelector("#battleChapter").textContent = `Глава I · Узел ${level.roman}`;
    document.querySelector("#battleTitle").textContent = level.title;
    document.querySelector("#enemyClass").textContent = level.className;
    document.querySelector("#enemyName").textContent = level.name;
    document.querySelector("#enemyState").textContent = level.state;
    document.querySelector("#enemyPortrait").alt = level.name;
    render();
    setBusy(false);
    statusEl.textContent = "Череп бьёт. Стихии заряжают героев.";
    sound(510, .13, "sine");
  }

  function handleSelect(index) {
    if (busy) return;
    if (selected === null || !engine.areAdjacent(selected, index)) { selected = selected === index ? null : index; render(); return; }
    makeMove(selected, index);
  }

  boardEl.addEventListener("click", event => { const tile = event.target.closest(".tile"); if (tile) handleSelect(Number(tile.dataset.index)); });
  boardEl.addEventListener("pointerdown", event => { const tile = event.target.closest(".tile"); if (tile && !busy) touchStart = { index: Number(tile.dataset.index), x: event.clientX, y: event.clientY }; });
  boardEl.addEventListener("pointerup", event => {
    if (!touchStart || busy) return;
    const dx = event.clientX - touchStart.x, dy = event.clientY - touchStart.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) { touchStart = null; return; }
    let row = engine.rowOf(touchStart.index), col = engine.colOf(touchStart.index);
    if (Math.abs(dx) > Math.abs(dy)) col += dx > 0 ? 1 : -1; else row += dy > 0 ? 1 : -1;
    if (engine.isInside(row, col)) makeMove(touchStart.index, engine.index(row, col));
    touchStart = null;
  });

  document.querySelectorAll(".map-node").forEach(node => node.addEventListener("click", () => openEncounter(Number(node.dataset.level))));
  document.querySelectorAll(".upgrade-button").forEach(button => button.addEventListener("click", () => {
    const key = button.dataset.upgrade, rank = progress.ranks[key], cost = 8 + (rank - 1) * 6;
    if (rank >= 5) return;
    if (progress.shards < cost) { showToast(`Нужно ещё ${cost - progress.shards} осколков`, true); return; }
    progress.shards -= cost;
    progress.ranks[key]++;
    saveProgress();
    renderProgress();
    showToast(`${key === "reynar" ? "Рейнар" : key === "elli" ? "Элли" : "Сайра"}: ранг ${progress.ranks[key]}`);
    sound(760, .18, "sine", .05);
  }));
  document.querySelector("#startButton").addEventListener("click", startBattle);
  document.querySelector("#playAgainButton").addEventListener("click", () => { resultModal.classList.remove("visible"); showScreen("mapScreen"); });
  document.querySelector("#mapButton").addEventListener("click", () => { startModal.classList.remove("visible"); resultModal.classList.remove("visible"); showScreen("mapScreen"); });
  document.querySelector("#rosterButton").addEventListener("click", () => { startModal.classList.remove("visible"); showScreen("rosterScreen"); });
  document.querySelector("#retreatButton").addEventListener("click", () => { if (busy) return; setBusy(true); showScreen("mapScreen"); });
  document.querySelector("#restartButton").addEventListener("click", () => {
    if (!confirm("Сбросить кампанию, награды и ранги героев?")) return;
    progress = structuredClone(defaultProgress);
    saveProgress();
    renderProgress();
    showScreen("mapScreen");
    showToast("Кампания начата заново");
  });
  document.querySelectorAll(".hero-card").forEach(card => card.addEventListener("click", () => castSkill(card.dataset.skill)));
  document.querySelector("#hintButton").addEventListener("click", () => {
    if (busy) return;
    const hint = engine.findHint();
    if (!hint) return;
    hint.forEach(index => boardEl.children[index].classList.add("hint"));
    statusEl.textContent = "Буря показывает возможный ход";
  });
  soundButton.addEventListener("click", () => {
    soundOn = !soundOn;
    soundButton.textContent = soundOn ? "♪" : "×";
    soundButton.setAttribute("aria-label", soundOn ? "Выключить звук" : "Включить звук");
    if (soundOn) sound(520, .09, "sine");
  });

  render();
  renderProgress();
  showScreen("mapScreen");
})();
