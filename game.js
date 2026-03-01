const STAGES = ["유아기", "아동기", "반항기", "사춘기", "성인기"];
const RELATION_LEVELS = ["모르는사이", "아는사이", "친구", "친한친구", "연인/단짝", "열애"];

const MAPS = {
  hotel: { name: "호텔", unlock: () => true, characters: ["잼민리", "탐관오리", "똘망리", "모야리"] },
  oriland: { name: "오리랜드", unlock: (s) => s.counters.hotelVisits >= 5, characters: ["오리리", "댕댕리", "까칠리", "써든리"] },
  toypark: { name: "장난감 파크", unlock: (s) => s.counters.homeItemPlay >= 5, characters: ["로봇리", "인형리"] },
  sweet: { name: "스위트 스트리트", unlock: (s) => s.counters.jellyEaten >= 10, characters: ["꿀떡리", "쪼꼬리", "과일리", "쿠키리"] },
  space: { name: "스페이스 센터", unlock: (s) => s.generation >= 2 && s.counters.consecutiveNightItem >= 5, characters: ["천문학리", "별리"] },
  ocean: { name: "오션월드", unlock: (s) => s.generation >= 3 && s.flags.evolvedOnRainyDay, characters: ["파도리", "펭귄리"] },
  dream: { name: "꿈의 나라", unlock: (s) => s.generation >= 3 && s.flags.playedAtSunset, characters: ["요정리", "마녀리"] },
  sports: { name: "스포츠 플라자", unlock: (s) => s.day >= 15, characters: ["잼민리", "댕댕리"] },
};

const CHARACTERS = {
  잼민리: { gender: "M", likes: ["공"], frame: "jammin" },
  탐관오리: { gender: "M", likes: ["공"], frame: "tamgwan" },
  똘망리: { gender: "F", likes: ["시럽"], frame: "ddol" },
  모야리: { gender: "F", likes: ["시럽"], frame: "moya" },
  오리리: { gender: "M", likes: ["마법봉"], frame: "ori" },
  댕댕리: { gender: "M", likes: ["공"], frame: "dengdeng" },
  까칠리: { gender: "F", likes: ["바람의 망토"], frame: "kkachil" },
  써든리: { gender: "F", likes: ["나사"], frame: "sseodeun" },
  로봇리: { gender: "M", likes: ["장난감 기차", "나사"], frame: "robot" },
  인형리: { gender: "F", likes: ["인형 탈", "장난감 기차"], frame: "doll" },
  꿀떡리: { gender: "F", likes: ["떡방아"], frame: "honey" },
  쪼꼬리: { gender: "M", likes: ["시럽", "망원경"], frame: "choco" },
  과일리: { gender: "F", likes: ["떡방아"], frame: "fruit" },
  쿠키리: { gender: "M", likes: ["시럽"], frame: "cookie" },
  천문학리: { gender: "M", likes: ["망원경"], frame: "astro" },
  별리: { gender: "F", likes: ["망원경"], frame: "star" },
  파도리: { gender: "M", likes: ["파도머신"], frame: "wave" },
  펭귄리: { gender: "F", likes: ["인형 탈"], frame: "penguin" },
  요정리: { gender: "F", likes: ["마법의 가루", "마법봉"], frame: "fairy" },
  마녀리: { gender: "F", likes: ["마법의 가루", "바람의 망토"], frame: "witch" },
};

const CAST_FRAMES = {
  jammin: { x: 20, y: 15, w: 245, h: 225 }, tamgwan: { x: 285, y: 15, w: 245, h: 225 }, ddol: { x: 550, y: 15, w: 245, h: 225 }, moya: { x: 815, y: 15, w: 245, h: 225 }, ori: { x: 1080, y: 15, w: 245, h: 225 },
  dengdeng: { x: 20, y: 260, w: 245, h: 225 }, kkachil: { x: 285, y: 260, w: 245, h: 225 }, sseodeun: { x: 550, y: 260, w: 245, h: 225 }, robot: { x: 815, y: 260, w: 245, h: 225 }, doll: { x: 1080, y: 260, w: 245, h: 225 },
  honey: { x: 20, y: 505, w: 245, h: 225 }, choco: { x: 285, y: 505, w: 245, h: 225 }, fruit: { x: 550, y: 505, w: 245, h: 225 }, cookie: { x: 815, y: 505, w: 245, h: 225 }, astro: { x: 1080, y: 505, w: 245, h: 225 },
  star: { x: 20, y: 750, w: 245, h: 225 }, wave: { x: 285, y: 750, w: 245, h: 225 }, penguin: { x: 550, y: 750, w: 245, h: 225 }, fairy: { x: 815, y: 750, w: 245, h: 225 }, witch: { x: 1080, y: 750, w: 245, h: 225 },
};

const state = {
  day: 1, generation: 1, stageIndex: 0,
  duckGender: Math.random() > 0.5 ? "M" : "F",
  inventory: { 공: 1, 시럽: 1, 마법봉: 1 },
  counters: { hotelVisits: 0, homeItemPlay: 0, jellyEaten: 0, consecutiveNightItem: 0 },
  flags: { evolvedOnRainyDay: false, playedAtSunset: false },
  affection: {}, unlockedMaps: ["hotel"], logs: [], weather: "맑음", isNight: false,
};

const app = {
  scene: null,
  currentMapId: "hotel",
  npcs: [],
  spriteReady: false,
};

function stageName() { return STAGES[state.stageIndex]; }
function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function addLog(msg) { state.logs.unshift(`[Day ${state.day}] ${msg}`); state.logs = state.logs.slice(0, 35); }

function relation(points, name) {
  const lv = Math.min(Math.floor(points / 20), RELATION_LEVELS.length - 1);
  const base = RELATION_LEVELS[lv];
  if (base === "연인/단짝") return CHARACTERS[name].gender === state.duckGender ? "단짝" : "연인";
  if (base === "열애") return CHARACTERS[name].gender === state.duckGender ? "단짝" : "열애";
  return base;
}

function gain(name, item) { return CHARACTERS[name].likes.includes(item) ? 12 : 6; }

function unlockMaps() {
  Object.entries(MAPS).forEach(([id, map]) => {
    if (!state.unlockedMaps.includes(id) && map.unlock(state)) {
      state.unlockedMaps.push(id);
      addLog(`🌟 ${map.name} 해금!`);
    }
  });
}

function evolve() {
  const threshold = [0, 3, 7, 12, 18];
  const next = state.stageIndex + 1;
  if (next < STAGES.length && state.day >= threshold[next]) {
    state.stageIndex = next;
    addLog(`✨ ${stageName()}로 성장!`);
    if (state.weather === "비") state.flags.evolvedOnRainyDay = true;
    if (state.stageIndex === 4 && state.generation === 1) addLog("🦆 1세대 성인 최종 형태는 일반오리 고정.");
  }
}

function consumeAnyItem() {
  const available = Object.entries(state.inventory).filter(([, c]) => c > 0);
  if (!available.length) return null;
  const [name] = rand(available);
  state.inventory[name] -= 1;
  return name;
}

function renderDom() {
  unlockMaps();
  const duckInfo = document.getElementById("duck-info");
  duckInfo.innerHTML = `
    <p><strong>${state.generation}세대</strong> · ${stageName()} · Day ${state.day}</p>
    <p>성별: ${state.duckGender === "M" ? "남" : "여"} · 날씨: ${state.weather} · 시간: ${state.isNight ? "밤" : "낮"}</p>
    <p>인벤토리: ${Object.entries(state.inventory).filter(([, v]) => v > 0).map(([k, v]) => `${k}x${v}`).join(", ") || "없음"}</p>
  `;

  const mapSelect = document.getElementById("map-select");
  mapSelect.innerHTML = "";
  Object.entries(MAPS).forEach(([id, map]) => {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = `${map.name}${state.unlockedMaps.includes(id) ? "" : " (잠김)"}`;
    opt.disabled = !state.unlockedMaps.includes(id);
    if (id === app.currentMapId) opt.selected = true;
    mapSelect.appendChild(opt);
  });
  app.currentMapId = mapSelect.value;

  const map = MAPS[app.currentMapId];
  document.getElementById("map-info").innerHTML = `<p>출현: ${map.characters.join(", ")}</p>`;

  const rel = document.getElementById("relationship-list");
  const names = Object.keys(state.affection);
  rel.innerHTML = names.length
    ? names.sort((a, b) => state.affection[b] - state.affection[a]).map((n) => `<div class="rel-row"><strong>${n}</strong><br/>호감도 ${state.affection[n]} · ${relation(state.affection[n], n)}</div>`).join("")
    : "<p>아직 만난 오리가 없어요.</p>";

  document.getElementById("event-log").innerHTML = state.logs.map((l) => `<li>${l}</li>`).join("");
}

function renderScene() {
  if (!app.scene) return;
  const scene = app.scene;
  app.npcs.forEach((o) => o.destroy());
  app.npcs = [];

  scene.bg.clear();
  scene.bg.fillStyle(0xeef6ff, 1);
  scene.bg.fillRect(0, 0, 900, 560);
  scene.bg.fillStyle(0xd8e8f9, 1);
  scene.bg.fillRoundedRect(20, 20, 860, 70, 10);
  scene.title.setText(`${MAPS[app.currentMapId].name} · 랜덤 캐릭터와 놀기`);

  const chars = MAPS[app.currentMapId].characters;
  chars.forEach((name, i) => {
    const x = 160 + (i % 4) * 190;
    const y = 230 + Math.floor(i / 4) * 220;
    if (app.spriteReady) {
      const sp = scene.add.image(x, y, "duck-cast", CHARACTERS[name].frame).setScale(0.46);
      app.npcs.push(sp);
    } else {
      const card = scene.add.rectangle(x, y, 150, 160, 0xffffff).setStrokeStyle(1, 0xb6cee8);
      const t = scene.add.text(x, y - 10, name, { color: "#35536f", fontSize: "18px" }).setOrigin(0.5);
      const s = scene.add.text(x, y + 25, "(이미지 없음)", { color: "#5d7d99", fontSize: "13px" }).setOrigin(0.5);
      app.npcs.push(card, t, s);
    }
    const label = scene.add.text(x, y + 86, name, { color: "#20364f", fontSize: "20px", fontStyle: "bold" }).setOrigin(0.5);
    app.npcs.push(label);
  });
}

function playVisit() {
  if (state.stageIndex < 1) return addLog("🚼 아동기부터 외출 가능"), renderDom();
  if (!state.unlockedMaps.includes(app.currentMapId)) return addLog("🔒 아직 잠긴 맵"), renderDom();
  const npc = rand(MAPS[app.currentMapId].characters);
  const item = consumeAnyItem();
  const plus = item ? gain(npc, item) : 3;
  state.affection[npc] = (state.affection[npc] || 0) + plus;
  if (app.currentMapId === "hotel") state.counters.hotelVisits += 1;
  addLog(`🗺️ ${MAPS[app.currentMapId].name}에서 ${npc}와 놀기 (${item || "맨몸"}) · +${plus}`);
  if (state.affection[npc] >= 80) addLog(relation(state.affection[npc], npc).includes("연") ? `💍 ${npc}가 프로포즈!` : `💔 ${npc}에게 프로포즈 실패`);
  renderDom();
  renderScene();
}

function bindActions() {
  document.getElementById("map-select").addEventListener("change", (e) => {
    app.currentMapId = e.target.value;
    renderDom();
    renderScene();
  });
  document.getElementById("feed-jelly").addEventListener("click", () => { state.counters.jellyEaten += 1; addLog("🍬 젤리 섭취"); renderDom(); });
  document.getElementById("play-home").addEventListener("click", () => {
    const item = consumeAnyItem();
    if (!item) return addLog("📦 아이템 없음"), renderDom();
    state.counters.homeItemPlay += 1;
    if (state.day % 2 === 0) state.flags.playedAtSunset = true;
    addLog(`🏠 집에서 ${item} 사용`);
    renderDom();
  });
  document.getElementById("use-night-item").addEventListener("click", () => {
    const item = consumeAnyItem();
    if (!item) return addLog("🌙 아이템 없음"), renderDom();
    if (state.isNight) state.counters.consecutiveNightItem += 1;
    else state.counters.consecutiveNightItem = 0;
    addLog(`🌙 ${state.isNight ? "밤" : "낮"} 아이템 사용(${item})`);
    renderDom();
  });
  document.getElementById("advance-day").addEventListener("click", () => {
    state.day += 1;
    state.weather = Math.random() > 0.7 ? "비" : "맑음";
    state.isNight = Math.random() > 0.5;
    addLog(`📅 하루 진행 (${state.weather}/${state.isNight ? "밤" : "낮"})`);
    evolve();
    unlockMaps();
    renderDom();
    renderScene();
  });
  document.getElementById("visit-map").addEventListener("click", playVisit);
  document.getElementById("next-gen").addEventListener("click", () => {
    if (stageName() !== "성인기") return addLog("👶 성인기부터 가능"), renderDom();
    const candidates = Object.keys(state.affection).filter((n) => ["연인", "열애"].includes(relation(state.affection[n], n)));
    if (!candidates.length) return addLog("💭 결혼 가능한 상대 없음"), renderDom();
    const partner = rand(candidates);
    state.generation += 1; state.day = 1; state.stageIndex = 0;
    state.affection = {}; state.flags.evolvedOnRainyDay = false; state.flags.playedAtSunset = false; state.counters.consecutiveNightItem = 0;
    addLog(`👪 ${partner}와 결혼! ${state.generation}세대 시작`);
    renderDom();
    renderScene();
  });
}

function bootPhaser() {
  const sceneConfig = {
    preload() {
      this.load.atlasXML("duck-cast", "assets/duck-cast.png", "assets/duck-cast.xml");
      this.load.on("loaderror", (file) => {
        if (file.key === "duck-cast") addLog("⚠️ assets/duck-cast.png 또는 duck-cast.xml이 없어 원본 캐릭터 표시를 생략합니다.");
      });
    },
    create() {
      app.scene = this;
      this.bg = this.add.graphics();
      this.title = this.add.text(36, 42, "", { color: "#1e3650", fontSize: "28px", fontStyle: "bold" });
      app.spriteReady = this.textures.exists("duck-cast");
      renderScene();
      renderDom();
    },
  };

  new Phaser.Game({
    type: Phaser.AUTO,
    parent: "game-root",
    width: 900,
    height: 560,
    backgroundColor: "#eef6ff",
    scene: sceneConfig,
  });
}

function ensureAtlasXml() {
  const frames = Object.entries(CAST_FRAMES)
    .map(([name, f]) => `<SubTexture name="${name}" x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}"/>`)
    .join("\n  ");
  const xml = `<TextureAtlas imagePath="duck-cast.png">\n  ${frames}\n</TextureAtlas>\n`;

  fetch("assets/duck-cast.xml", { method: "HEAD" }).catch(() => null).finally(() => {
    // static file expected; no runtime write in browser
  });

  // for repository generation only
  if (typeof window === "undefined") return xml;
}

function init() {
  addLog("🥚 원본 캐릭터 시트 기반 Phaser 프로토타입 시작");
  bindActions();
  renderDom();
  bootPhaser();
}

init();

// Keep the atlas generator reference for tooling workflows.
void ensureAtlasXml;
