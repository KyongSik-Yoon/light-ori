const STAGES = ["유아기", "아동기", "반항기", "사춘기", "성인기"];
const RELATION_LEVELS = ["모르는사이", "아는사이", "친구", "친한친구", "연인/단짝", "열애"];

const MAPS = {
  hotel: {
    id: "hotel",
    name: "호텔",
    minStage: "아동기",
    characters: ["잼민리", "탐관오리", "똘망리", "모야리"],
    shopItems: ["공", "시럽", "마법봉"],
    unlockDescription: "기본 해금",
    unlock: () => true,
  },
  oriland: {
    id: "oriland",
    name: "오리랜드",
    minStage: "아동기",
    characters: ["오리리", "댕댕리", "까칠리", "써든리"],
    shopItems: ["나사", "바람의 망토"],
    unlockDescription: "호텔 5회 방문",
    unlock: (s) => s.counters.hotelVisits >= 5,
  },
  toypark: {
    id: "toypark",
    name: "장난감 파크",
    minStage: "아동기",
    characters: ["로봇리", "인형리"],
    shopItems: ["장난감 기차", "인형 탈"],
    unlockDescription: "집에서 아이템 놀이 5회",
    unlock: (s) => s.counters.homeItemPlay >= 5,
  },
  sweet: {
    id: "sweet",
    name: "스위트 스트리트",
    minStage: "아동기",
    characters: ["꿀떡리", "쪼꼬리", "과일리", "쿠키리"],
    shopItems: ["떡방아"],
    unlockDescription: "젤리 10회 섭취",
    unlock: (s) => s.counters.jellyEaten >= 10,
  },
  space: {
    id: "space",
    name: "스페이스 센터",
    minStage: "아동기",
    characters: ["천문학리", "별리"],
    shopItems: ["망원경"],
    unlockDescription: "2세대 이후 + 5일 연속 밤 아이템 사용",
    unlock: (s) => s.generation >= 2 && s.counters.consecutiveNightItem >= 5,
  },
  ocean: {
    id: "ocean",
    name: "오션월드",
    minStage: "아동기",
    characters: ["파도리", "펭귄리"],
    shopItems: ["파도머신"],
    unlockDescription: "3세대 이후 + 비오는 날 진화",
    unlock: (s) => s.generation >= 3 && s.flags.evolvedOnRainyDay,
  },
  dream: {
    id: "dream",
    name: "꿈의 나라",
    minStage: "아동기",
    characters: ["요정리", "마녀리"],
    shopItems: ["마법의 가루"],
    unlockDescription: "3세대 이후 + 해질녘 아이템 놀이",
    unlock: (s) => s.generation >= 3 && s.flags.playedAtSunset,
  },
  sports: {
    id: "sports",
    name: "스포츠 플라자",
    minStage: "아동기",
    characters: ["잼민리", "댕댕리"],
    shopItems: ["공"],
    unlockDescription: "임시: 15일차 도달",
    unlock: (s) => s.day >= 15,
  },
};

const CHARACTERS = {
  잼민리: { gender: "M", likes: ["공"], map: "hotel" },
  탐관오리: { gender: "M", likes: ["공"], map: "hotel" },
  똘망리: { gender: "F", likes: ["시럽"], map: "hotel" },
  모야리: { gender: "F", likes: ["시럽"], map: "hotel" },
  오리리: { gender: "M", likes: ["마법봉"], map: "oriland" },
  댕댕리: { gender: "M", likes: ["공"], map: "oriland" },
  까칠리: { gender: "F", likes: ["바람의 망토"], map: "oriland" },
  써든리: { gender: "F", likes: ["나사"], map: "oriland" },
  로봇리: { gender: "M", likes: ["장난감 기차", "나사"], map: "toypark" },
  인형리: { gender: "F", likes: ["인형 탈", "장난감 기차"], map: "toypark" },
  꿀떡리: { gender: "F", likes: ["떡방아"], map: "sweet" },
  쪼꼬리: { gender: "M", likes: ["시럽", "망원경"], map: "sweet" },
  과일리: { gender: "F", likes: ["떡방아"], map: "sweet" },
  쿠키리: { gender: "M", likes: ["시럽"], map: "sweet" },
  천문학리: { gender: "M", likes: ["망원경"], map: "space" },
  별리: { gender: "F", likes: ["망원경"], map: "space" },
  파도리: { gender: "M", likes: ["파도머신"], map: "ocean" },
  펭귄리: { gender: "F", likes: ["인형 탈"], map: "ocean" },
  요정리: { gender: "F", likes: ["마법의 가루", "마법봉"], map: "dream" },
  마녀리: { gender: "F", likes: ["마법의 가루", "바람의 망토"], map: "dream" },
};

const BASE_ITEMS = ["공", "시럽", "마법봉", "나사", "바람의 망토", "장난감 기차", "인형 탈", "떡방아", "망원경", "파도머신", "마법의 가루"];

const CHARACTER_EMOJI = {
  잼민리: "🧢🦆",
  탐관오리: "🎩🦆",
  똘망리: "🎀🦆",
  모야리: "😅🦆",
  오리리: "✨🦆",
  댕댕리: "🐶🦆",
  까칠리: "😾🦆",
  써든리: "🔩🦆",
  로봇리: "🤖",
  인형리: "🧸",
  꿀떡리: "🍯🦆",
  쪼꼬리: "🍫🦆",
  과일리: "🍓🦆",
  쿠키리: "🍪",
  천문학리: "🔭🦆",
  별리: "⭐🦆",
  파도리: "🌊🦆",
  펭귄리: "🐧",
  요정리: "🧚",
  마녀리: "🧙",
};

function characterBadge(name) {
  return `${CHARACTER_EMOJI[name] || "🦆"} ${name}`;
}

const state = {
  day: 1,
  generation: 1,
  stageIndex: 0,
  duckGender: Math.random() > 0.5 ? "M" : "F",
  affection: {},
  inventory: {
    공: 1,
    시럽: 1,
    마법봉: 1,
  },
  unlockedMaps: ["hotel"],
  counters: {
    hotelVisits: 0,
    homeItemPlay: 0,
    jellyEaten: 0,
    consecutiveNightItem: 0,
  },
  flags: {
    evolvedOnRainyDay: false,
    playedAtSunset: false,
  },
  weather: "맑음",
  isNight: false,
  logs: [],
};

function stageName() {
  return STAGES[state.stageIndex];
}

function addLog(msg) {
  state.logs.unshift(`[Day ${state.day}] ${msg}`);
  state.logs = state.logs.slice(0, 30);
}

function getRelationLabel(points, characterName) {
  const level = Math.min(Math.floor(points / 20), RELATION_LEVELS.length - 1);
  const relation = RELATION_LEVELS[level];
  if (relation === "연인/단짝") {
    const char = CHARACTERS[characterName];
    return char.gender === state.duckGender ? "단짝" : "연인";
  }
  if (relation === "열애") {
    const char = CHARACTERS[characterName];
    return char.gender === state.duckGender ? "단짝" : "열애";
  }
  return relation;
}

function affectionGain(characterName, itemName) {
  const char = CHARACTERS[characterName];
  return char.likes.includes(itemName) ? 12 : 6;
}

function randomOf(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function updateUnlockedMaps() {
  for (const map of Object.values(MAPS)) {
    if (!state.unlockedMaps.includes(map.id) && map.unlock(state)) {
      state.unlockedMaps.push(map.id);
      addLog(`🌟 새 맵 해금: ${map.name}`);
    }
  }
}

function evolveIfNeeded() {
  const thresholds = [0, 3, 7, 12, 18];
  const nextIndex = state.stageIndex + 1;
  if (nextIndex < STAGES.length && state.day >= thresholds[nextIndex]) {
    state.stageIndex = nextIndex;
    addLog(`✨ 오리가 ${stageName()}(으)로 성장했어요!`);
    if (state.weather === "비") {
      state.flags.evolvedOnRainyDay = true;
    }
    if (state.stageIndex === STAGES.length - 1 && state.generation === 1) {
      addLog("🦆 1세대 성인기는 설정에 따라 일반오리 모습으로 고정됩니다.");
    }
  }
}

function canGoOut() {
  return state.stageIndex >= 1;
}

function consumeAnyItem() {
  const available = Object.entries(state.inventory).filter(([, count]) => count > 0);
  if (!available.length) return null;
  const [item] = randomOf(available);
  state.inventory[item] -= 1;
  return item;
}

function feedJelly() {
  state.counters.jellyEaten += 1;
  addLog("🍬 젤리를 먹였어요.");
  render();
}

function playAtHome() {
  const used = consumeAnyItem();
  if (!used) {
    addLog("📦 인벤토리에 아이템이 없어요.");
    render();
    return;
  }
  state.counters.homeItemPlay += 1;
  if (state.day % 2 === 0) {
    state.flags.playedAtSunset = true;
  }
  addLog(`🏠 집에서 ${used}(으)로 놀았어요.`);
  render();
}

function useNightItem() {
  const used = consumeAnyItem();
  if (!used) {
    addLog("🌙 밤에 사용할 아이템이 없어요.");
    render();
    return;
  }
  if (state.isNight) {
    state.counters.consecutiveNightItem += 1;
    addLog(`🌙 밤에 ${used} 사용 성공! (연속 ${state.counters.consecutiveNightItem}일)`);
  } else {
    state.counters.consecutiveNightItem = 0;
    addLog("☀️ 지금은 낮이라 밤 연속 조건이 초기화됐어요.");
  }
  render();
}

function maybePropose(characterName) {
  const points = state.affection[characterName] || 0;
  const relation = getRelationLabel(points, characterName);
  const inLove = relation === "연인" || relation === "열애";
  if (inLove) {
    addLog(`💍 ${characterName}가 먼저 프로포즈했어요!`);
  } else {
    addLog(`💔 ${characterName}에게 프로포즈했지만 아직 거절당했어요.`);
  }
}

function visitMap() {
  if (!canGoOut()) {
    addLog("🚼 아동기부터 외출할 수 있어요.");
    render();
    return;
  }

  const selected = document.getElementById("map-select").value;
  const map = MAPS[selected];
  if (!map || !state.unlockedMaps.includes(map.id)) {
    addLog("🔒 아직 해금되지 않은 맵입니다.");
    render();
    return;
  }

  const randomCharacter = randomOf(map.characters);
  const availableItems = Object.entries(state.inventory).filter(([, v]) => v > 0);
  const usedItem = availableItems.length ? randomOf(availableItems)[0] : null;

  if (usedItem) state.inventory[usedItem] -= 1;

  const gain = usedItem ? affectionGain(randomCharacter, usedItem) : 3;
  state.affection[randomCharacter] = (state.affection[randomCharacter] || 0) + gain;

  if (map.id === "hotel") {
    state.counters.hotelVisits += 1;
  }

  const animSec = Math.floor(Math.random() * 12) + 8;
  addLog(
    `🗺️ ${map.name}에서 ${randomCharacter}와 만났어요. ${usedItem ? `${usedItem} 사용` : "아이템 없음"} / 호감도 +${gain} / 전용 애니메이션 ${animSec}초`
  );

  if ((state.affection[randomCharacter] || 0) >= 80 && Math.random() > 0.5) {
    maybePropose(randomCharacter);
  }

  render();
}

function advanceDay() {
  state.day += 1;
  state.weather = Math.random() > 0.7 ? "비" : "맑음";
  state.isNight = Math.random() > 0.5;
  addLog(`📅 하루가 지났어요. 날씨: ${state.weather}, 시간대: ${state.isNight ? "밤" : "낮"}`);
  evolveIfNeeded();
  updateUnlockedMaps();
  render();
}

function buyItem(itemName) {
  state.inventory[itemName] = (state.inventory[itemName] || 0) + 1;
  addLog(`🛒 ${itemName} 구매 완료.`);
  render();
}

function maybeMarriageAndNextGen() {
  if (stageName() !== "성인기") {
    addLog("👶 성인기부터 결혼/출산이 가능합니다.");
    render();
    return;
  }

  const lovers = Object.entries(state.affection)
    .filter(([name, points]) => {
      const relation = getRelationLabel(points, name);
      return relation === "열애" || relation === "연인";
    })
    .map(([name]) => name);

  if (!lovers.length) {
    addLog("💭 아직 결혼 가능한 상대가 없어요.");
    render();
    return;
  }

  const partner = randomOf(lovers);
  state.generation += 1;
  state.day = 1;
  state.stageIndex = 0;
  state.duckGender = Math.random() > 0.5 ? "M" : "F";
  state.affection = {};
  state.flags.evolvedOnRainyDay = false;
  state.flags.playedAtSunset = false;
  state.counters.consecutiveNightItem = 0;
  addLog(`👪 ${partner}와 결혼! ${state.generation}세대 아기 오리가 태어났어요.`);
  addLog("🧬 부모 유전자가 랜덤으로 섞여 다음 최종진화가 결정됩니다.");
  render();
}

function renderDuckInfo() {
  const info = document.getElementById("duck-info");
  const avatar = document.getElementById("duck-avatar");
  const stage = stageName();
  avatar.textContent = stage === "유아기" ? "🥚" : stage === "성인기" ? "🦆" : "🐣";

  const availableMaps = state.unlockedMaps.length;
  info.innerHTML = `
    <div><strong>${state.generation}세대</strong> <span class="badge">${stage}</span></div>
    <div>성별: ${state.duckGender === "M" ? "남" : "여"}</div>
    <div>Day ${state.day} · 날씨 ${state.weather} · ${state.isNight ? "밤" : "낮"}</div>
    <div>해금 맵: ${availableMaps}개</div>
    <div>인벤토리: ${BASE_ITEMS.filter((item) => (state.inventory[item] || 0) > 0)
      .map((item) => `${item} x${state.inventory[item]}`)
      .join(", ") || "없음"}</div>
    <div class="action-grid single" style="margin-top:0.5rem;">
      <button id="marriage-btn">결혼/다음 세대 진행</button>
    </div>
  `;
  document.getElementById("marriage-btn").addEventListener("click", maybeMarriageAndNextGen);
}

function renderMapSelect() {
  const select = document.getElementById("map-select");
  select.innerHTML = "";

  Object.values(MAPS).forEach((map) => {
    const option = document.createElement("option");
    option.value = map.id;
    option.textContent = `${map.name}${state.unlockedMaps.includes(map.id) ? "" : " (잠김)"}`;
    option.disabled = !state.unlockedMaps.includes(map.id);
    select.appendChild(option);
  });

  const selectedMap = MAPS[select.value] || MAPS.hotel;
  const mapInfo = document.getElementById("map-info");
  mapInfo.innerHTML = `
    <p>출현 캐릭터:</p>
    <div>${selectedMap.characters.map((name) => `<span class="character-tag">${characterBadge(name)}</span>`).join("")}</div>
    <p>상점 아이템: ${selectedMap.shopItems.join(", ")}</p>
    <p>해금 조건: ${selectedMap.unlockDescription}</p>
  `;

  select.onchange = () => render();
}

function renderShop() {
  const selectedMapId = document.getElementById("map-select").value || "hotel";
  const selectedMap = MAPS[selectedMapId] || MAPS.hotel;
  const container = document.getElementById("shop-items");
  container.innerHTML = "";

  selectedMap.shopItems.forEach((item) => {
    const row = document.createElement("div");
    row.className = "item-row";
    row.innerHTML = `
      <h4>${item}</h4>
      <p>보유 수량: ${state.inventory[item] || 0}</p>
      <button data-item="${item}">구매</button>
    `;
    container.appendChild(row);
  });

  container.querySelectorAll("button[data-item]").forEach((btn) => {
    btn.addEventListener("click", () => buyItem(btn.dataset.item));
  });
}

function renderRelationships() {
  const container = document.getElementById("relationship-list");
  container.innerHTML = "";

  const known = Object.keys(state.affection);
  if (!known.length) {
    container.innerHTML = "<p>아직 만난 오리가 없어요.</p>";
    return;
  }

  known
    .sort((a, b) => state.affection[b] - state.affection[a])
    .forEach((name) => {
      const points = state.affection[name];
      const relation = getRelationLabel(points, name);
      const row = document.createElement("div");
      row.className = "rel-row";
      row.innerHTML = `
        <h4>${characterBadge(name)}</h4>
        <p>호감도: ${points}</p>
        <p>관계: ${relation}</p>
      `;
      container.appendChild(row);
    });
}

function renderLogs() {
  const logEl = document.getElementById("event-log");
  logEl.innerHTML = state.logs.map((m) => `<li>${m}</li>`).join("");
}

function render() {
  updateUnlockedMaps();
  renderDuckInfo();
  renderMapSelect();
  renderShop();
  renderRelationships();
  renderLogs();
}

function wireEvents() {
  document.getElementById("feed-jelly").addEventListener("click", feedJelly);
  document.getElementById("play-home").addEventListener("click", playAtHome);
  document.getElementById("use-night-item").addEventListener("click", useNightItem);
  document.getElementById("advance-day").addEventListener("click", advanceDay);
  document.getElementById("visit-map").addEventListener("click", visitMap);
}

addLog("🥚 달걀에서 아기 오리가 태어났어요. 이제 육성을 시작해볼까요?");
wireEvents();
render();
