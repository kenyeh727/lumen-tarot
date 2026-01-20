
import { TarotCard, Language, DeckType, DeckConfig } from './types';

// Updated Card Back: Minimalist, Matte Dark, Gold Line Art
export const CARD_BACK_PATTERN = "https://www.transparenttextures.com/patterns/stardust.png";

export const DECK_CONFIGS: Record<DeckType, DeckConfig> = {
  [DeckType.TAROT]: {
    id: DeckType.TAROT,
    label: { [Language.EN]: "THE TAROT", [Language.ZH_TW]: "命運塔羅" },
    tagline: { [Language.EN]: "The Golden Path of Soul.", [Language.ZH_TW]: "靈魂的金線軌跡。" },
    description: { [Language.EN]: "Classic wisdom with a minimalist, high-frequency aesthetic.", [Language.ZH_TW]: "極簡高頻美學，連結深層智慧。" },
    themeColor: "text-amber-400",
    bgGradient: "from-[#0a0a12] via-[#1a1a2e] to-[#0a0a12]", // Deep Indigo/Black
    cardBackImage: "https://www.transparenttextures.com/patterns/stardust.png",
    promptStyle: {
      prefix: "Tarot card illustration of ",
      suffix: ", the card name is elegantly written at the bottom center of the card, modern digital vector art, bold uniform black outlines (ligne claire), flat coloring, minimal cel-shading, no gradients, muted deep color palette (dark blues, teals, muted purples, antique gold, greys), melancholic and mysterious mood, enclosed in an ornate flat gold art nouveau inspired border frame, high quality, 8k resolution."
    }
  },
  [DeckType.LENORMAND]: {
    id: DeckType.LENORMAND,
    label: { [Language.EN]: "LENORMAND", [Language.ZH_TW]: "雷諾曼預言" },
    tagline: { [Language.EN]: "Vibrant tales of daily life.", [Language.ZH_TW]: "繪聲繪影的日常預言。" },
    description: { [Language.EN]: "School anime-style illustrations for direct intuition.", [Language.ZH_TW]: "校園動漫風格，直覺連結生活。" },
    themeColor: "text-rose-400",
    bgGradient: "from-rose-950 via-slate-900 to-indigo-950",
    cardBackImage: "https://www.transparenttextures.com/patterns/graphy.png",
    promptStyle: {
      prefix: "Lenormand card illustration of ",
      suffix: ", school anime style (shoujo manga aesthetic), vibrant pastel colors, high school setting, cel-shaded with clean linework, bright cheerful atmosphere, detailed background, enclosed in a decorative pink and white art nouveau inspired border frame with floral accents, consistent card layout, high quality digital art, masterpiece, 2:3 aspect ratio."
    }
  }
};

export const TRANSLATIONS = {
  [Language.EN]: {
    subtitle: "THE STARS ARE LISTENING",
    placeholder: "What seeks clarity today?",
    shuffling: "ALIGNING YOUR DESTINY...",
    cutting: "TAP TO CUT THE DECK",
    drawTitle: "THE FAN OF FATE",
    drawSubtitle: "Hover to sense energy. Click to reveal.",
    revealTitle: "THE ORACLE'S SCROLL",
    askAgain: "NEW CONSULTATION",
    start: "Ask Lumen",
    selectDeck: "SELECT YOUR PATH",
    tarot: "TAROT",
    lenormand: "LENORMAND",
    cards: "CARDS",
    deck: "DECK",
    summaryLabel: "THE ESSENCE",
    analysisLabel: "THE DEEP ANALYSIS",
    adviceLabel: "GUIDING STEP",
    affirmationLabel: "AFFIRMATION",
    luckyColorLabel: "LUCKY COLOR",
    luckyNumberLabel: "LUCKY NUMBER",
    upsellTitle: "HIDDEN DESTINY",
    upsellText: "The future timeline for this spread is currently veiled in darkness.",
    upsellButton: "UNLOCK THE TIMELINE",
    loadingFlavor: "The stars are aligning to reveal your truth...",
    library: "LIBRARY",
    librarySubtitle: "Explore the meanings of every card.",
    back: "BACK",
    searchPlaceholder: "Search cards...",
    upright: "Upright Meaning",
    reversed: "Reversed Meaning",
    arcana: "Arcana",
    oracle: "Oracle",
    generateArt: "Reveal Card Art"
  },
  [Language.ZH_TW]: {
    subtitle: "萬物星辰，皆在聽令",
    placeholder: "告訴我你心中的疑惑...",
    shuffling: "正在重組命運之線...",
    cutting: "輕觸牌疊以切牌",
    drawTitle: "命運之扇",
    drawSubtitle: "滑動感受能量，點擊選定您的命運。",
    revealTitle: "神諭之卷",
    askAgain: "重新諮詢",
    start: "向 Lumen 提問",
    selectDeck: "選擇你的道路",
    tarot: "塔羅",
    lenormand: "雷諾曼",
    cards: "張數",
    deck: "牌種",
    summaryLabel: "命運核心",
    analysisLabel: "深度解讀",
    adviceLabel: "指引步伐",
    affirmationLabel: "每日肯定",
    luckyColorLabel: "幸運色",
    luckyNumberLabel: "幸運數字",
    upsellTitle: "隱藏的命運",
    upsellText: "此牌陣的完整未來時間軸目前被暗影遮蔽。",
    upsellButton: "解鎖完整未來",
    loadingFlavor: "星辰正在排列，揭示您的真理...",
    library: "牌卡圖書館",
    librarySubtitle: "探索每一張牌的深層含義。",
    back: "返回",
    searchPlaceholder: "搜尋牌卡名稱...",
    upright: "正位含義",
    reversed: "逆位含義",
    arcana: "阿爾克納",
    oracle: "神諭卡",
    generateArt: "揭示卡面藝術"
  }
};

// --- DATASET: TAROT & LENORMAND DATA (Keep existing arrays) ---
const MAJOR_DATA = [
  { en: "The Fool", cn: "愚者", k_en: ["Beginnings", "Innocence", "Leap of Faith"], k_cn: ["新的開始", "純真", "信仰之躍"], desc: "0 - The Spirit of Aether" },
  { en: "The Magician", cn: "魔術師", k_en: ["Manifestation", "Resourcefulness", "Power"], k_cn: ["顯化", "資源豐富", "力量"], desc: "I - Willpower" },
  { en: "The High Priestess", cn: "女祭司", k_en: ["Intuition", "Unconscious", "Inner Voice"], k_cn: ["直覺", "潛意識", "內在聲音"], desc: "II - Wisdom" },
  { en: "The Empress", cn: "皇后", k_en: ["Fertility", "Nature", "Abundance"], k_cn: ["豐饒", "自然", "富足"], desc: "III - Motherhood" },
  { en: "The Emperor", cn: "皇帝", k_en: ["Authority", "Structure", "Control"], k_cn: ["權威", "結構", "控制"], desc: "IV - Order" },
  { en: "The Hierophant", cn: "教皇", k_en: ["Tradition", "Conformity", "Morality"], k_cn: ["傳統", "從眾", "道德"], desc: "V - Belief" },
  { en: "The Lovers", cn: "戀人", k_en: ["Partnership", "Duality", "Union"], k_cn: ["伴侶", "二元性", "結合"], desc: "VI - Choice" },
  { en: "The Chariot", cn: "戰車", k_en: ["Control", "Willpower", "Victory"], k_cn: ["控制", "意志力", "勝利"], desc: "VII - Direction" },
  { en: "Strength", cn: "力量", k_en: ["Courage", "Persuasion", "Influence"], k_cn: ["勇氣", "說服", "影響力"], desc: "VIII - Fortitude" },
  { en: "The Hermit", cn: "隱士", k_en: ["Introspection", "Solitude", "Guidance"], k_cn: ["內省", "獨處", "指引"], desc: "IX - Soul Searching" },
  { en: "Wheel of Fortune", cn: "命運之輪", k_en: ["Karma", "Cycles", "Destiny"], k_cn: ["業力", "循環", "命運"], desc: "X - Change" },
  { en: "Justice", cn: "正義", k_en: ["Fairness", "Truth", "Law"], k_cn: ["公平", "真理", "法律"], desc: "XI - Balance" },
  { en: "The Hanged Man", cn: "吊人", k_en: ["Pause", "Surrender", "New Perspective"], k_cn: ["暫停", "臣服", "新觀點"], desc: "XII - Sacrifice" },
  { en: "Death", cn: "死神", k_en: ["Endings", "Change", "Transformation"], k_cn: ["結束", "改變", "轉化"], desc: "XIII - Rebirth" },
  { en: "Temperance", cn: "節制", k_en: ["Balance", "Moderation", "Patience"], k_cn: ["平衡", "適度", "耐心"], desc: "XIV - Alchemy" },
  { en: "The Devil", cn: "惡魔", k_en: ["Shadow Self", "Attachment", "Restriction"], k_cn: ["陰影自我", "依戀", "束縛"], desc: "XV - Bondage" },
  { en: "The Tower", cn: "高塔", k_en: ["Sudden Change", "Upheaval", "Chaos"], k_cn: ["驟變", "動盪", "混亂"], desc: "XVI - Destruction" },
  { en: "The Star", cn: "星星", k_en: ["Hope", "Faith", "Purpose"], k_cn: ["希望", "信念", "目標"], desc: "XVII - Healing" },
  { en: "The Moon", cn: "月亮", k_en: ["Illusion", "Fear", "Subconscious"], k_cn: ["幻象", "恐懼", "潛意識"], desc: "XVIII - Mystery" },
  { en: "The Sun", cn: "太陽", k_en: ["Positivity", "Fun", "Warmth"], k_cn: ["積極", "樂趣", "溫暖"], desc: "XIX - Joy" },
  { en: "Judgement", cn: "審判", k_en: ["Judgement", "Rebirth", "Inner Calling"], k_cn: ["審判", "重生", "內在召喚"], desc: "XX - Absolution" },
  { en: "The World", cn: "世界", k_en: ["Completion", "Integration", "Accomplishment"], k_cn: ["完成", "整合", "成就"], desc: "XXI - Fulfillment" }
];

const SUITS_MAP = {
  "Wands": { cn: "權杖", k_en: ["Action", "Creativity", "Passion"], k_cn: ["行動", "創造力", "熱情"] },
  "Cups": { cn: "聖杯", k_en: ["Emotion", "Relationships", "Intuition"], k_cn: ["情感", "關係", "直覺"] },
  "Swords": { cn: "寶劍", k_en: ["Intellect", "Communication", "Conflict"], k_cn: ["智力", "溝通", "衝突"] },
  "Pentacles": { cn: "錢幣", k_en: ["Material", "Wealth", "Work"], k_cn: ["物質", "財富", "工作"] }
};

const RANKS_MAP = [
  { en: "Ace", cn: "一", k: ["New Beginning", "Potential"], k_cn: ["新開始", "潛力"] },
  { en: "2", cn: "二", k: ["Balance", "Partnership"], k_cn: ["平衡", "夥伴關係"] },
  { en: "3", cn: "三", k: ["Expansion", "Collaboration"], k_cn: ["擴張", "合作"] },
  { en: "4", cn: "四", k: ["Structure", "Stability"], k_cn: ["結構", "穩定"] },
  { en: "5", cn: "五", k: ["Conflict", "Loss"], k_cn: ["衝突", "損失"] },
  { en: "6", cn: "六", k: ["Harmony", "Generosity"], k_cn: ["和諧", "慷慨"] },
  { en: "7", cn: "七", k: ["Assessment", "Perseverance"], k_cn: ["評估", "堅持"] },
  { en: "8", cn: "八", k: ["Mastery", "Action"], k_cn: ["精通", "行動"] },
  { en: "9", cn: "九", k: ["Fruition", "Attainment"], k_cn: ["成果", "成就"] },
  { en: "10", cn: "十", k: ["Completion", "End of Cycle"], k_cn: ["完成", "週期結束"] },
  { en: "Page", cn: "侍衛", k: ["Messenger", "Curiosity"], k_cn: ["信使", "好奇心"] },
  { en: "Knight", cn: "騎士", k: ["Action", "Drive"], k_cn: ["行動", "驅動力"] },
  { en: "Queen", cn: "王后", k: ["Nurturing", "Influence"], k_cn: ["滋養", "影響力"] },
  { en: "King", cn: "國王", k: ["Authority", "Mastery"], k_cn: ["權威", "掌控"] }
];

const generateFullTarotDeck = (): TarotCard[] => {
  const deck: TarotCard[] = [];
  MAJOR_DATA.forEach((card, i) => {
    deck.push({
      id: i,
      name: card.en,
      name_i18n: { [Language.EN]: card.en, [Language.ZH_TW]: card.cn },
      desc: { [Language.EN]: "Major Arcana", [Language.ZH_TW]: "大阿爾克納" },
      keywords: { [Language.EN]: card.k_en, [Language.ZH_TW]: card.k_cn },
      meaningUpright: {
        [Language.EN]: `The ${card.en} represents a significant soul lesson. In the upright position, it suggests that the energy of ${card.k_en[0].toLowerCase()} is flowing freely.`,
        [Language.ZH_TW]: `${card.cn}代表著重要的靈魂課題。在正位時，它暗示著${card.k_cn[0]}的能量正在自由流動。`
      },
      meaningReversed: {
        [Language.EN]: `Reversed, The ${card.en} suggests internalizing this energy. You might be resisting the lesson of ${card.k_en[1].toLowerCase()}.`,
        [Language.ZH_TW]: `逆位的${card.cn}建議將這股能量內化。你可能正在抗拒${card.k_cn[1]}的課題。`
      }
    });
  });
  Object.entries(SUITS_MAP).forEach(([suitEn, suitData], sIdx) => {
    RANKS_MAP.forEach((rank, rIdx) => {
      const nameEn = `${rank.en} of ${suitEn}`;
      const nameCn = `${suitData.cn}${rank.cn}`;
      deck.push({
        id: 100 + sIdx * 14 + rIdx,
        name: nameEn,
        name_i18n: { [Language.EN]: nameEn, [Language.ZH_TW]: nameCn },
        desc: { [Language.EN]: "Minor Arcana", [Language.ZH_TW]: "小阿爾克納" },
        keywords: { [Language.EN]: [...suitData.k_en, ...rank.k], [Language.ZH_TW]: [...suitData.k_cn, ...rank.k_cn] },
        meaningUpright: {
          [Language.EN]: `In the element of ${suitEn}, the ${rank.en} brings a message of ${rank.k[0].toLowerCase()}.`,
          [Language.ZH_TW]: `在${suitData.cn}的元素中，這張牌帶來了${rank.k_cn[0]}的訊息。`
        },
        meaningReversed: {
          [Language.EN]: `Reversed, the energy of ${suitEn} may be blocked. Watch out for issues regarding ${rank.k[1].toLowerCase()}.`,
          [Language.ZH_TW]: `逆位時，${suitData.cn}的能量可能受阻。請留意關於${rank.k_cn[1]}的問題。`
        }
      });
    });
  });
  return deck;
};

const LENORMAND_DATA = [
  { en: "Rider", cn: "騎士", k: ["News", "Speed"], k_cn: ["消息", "速度"], detail_en: "News coming soon.", detail_cn: "消息即將到來。" },
  { en: "Clover", cn: "幸運草", k: ["Luck", "Small joy"], k_cn: ["幸運", "小確幸"], detail_en: "A stroke of luck.", detail_cn: "一陣幸運。" },
  // ... (Full Lenormand data omitted for brevity, assuming it matches original file)
  { en: "Ship", cn: "船", k: ["Travel", "Distance"], k_cn: ["旅行", "距離"], detail_en: "Travel.", detail_cn: "旅行。" },
  { en: "House", cn: "房子", k: ["Home", "Stability"], k_cn: ["家庭", "穩定"], detail_en: "Domestic life.", detail_cn: "家庭生活。" },
  { en: "Tree", cn: "樹", k: ["Health", "Growth"], k_cn: ["健康", "成長"], detail_en: "Health and roots.", detail_cn: "健康與根基。" },
  { en: "Clouds", cn: "雲", k: ["Confusion", "Doubts"], k_cn: ["困惑", "懷疑"], detail_en: "Confusion ahead.", detail_cn: "前方的困惑。" },
  { en: "Snake", cn: "蛇", k: ["Betrayal", "Complication"], k_cn: ["背叛", "複雜"], detail_en: "Watch out for betrayal.", detail_cn: "小心背叛。" },
  { en: "Coffin", cn: "棺材", k: ["Ending", "Grief"], k_cn: ["結束", "悲傷"], detail_en: "An ending.", detail_cn: "一個結束。" },
  { en: "Bouquet", cn: "花束", k: ["Gift", "Appreciation"], k_cn: ["禮物", "感激"], detail_en: "A gift.", detail_cn: "一份禮物。" },
  { en: "Scythe", cn: "鐮刀", k: ["Danger", "Sudden"], k_cn: ["危險", "突然"], detail_en: "Sudden cut.", detail_cn: "突然的切斷。" },
  { en: "Whip", cn: "鞭子", k: ["Conflict", "Repetition"], k_cn: ["衝突", "重複"], detail_en: "Conflict.", detail_cn: "衝突。" },
  { en: "Birds", cn: "鳥", k: ["Communication", "Gossip"], k_cn: ["溝通", "八卦"], detail_en: "Talk and gossip.", detail_cn: "談話與八卦。" },
  { en: "Child", cn: "小孩", k: ["New", "Innocent"], k_cn: ["新事物", "純真"], detail_en: "New beginning.", detail_cn: "新的開始。" },
  { en: "Fox", cn: "狐狸", k: ["Work", "Cunning"], k_cn: ["工作", "狡猾"], detail_en: "Work or cunning.", detail_cn: "工作或狡猾。" },
  { en: "Bear", cn: "熊", k: ["Power", "Protection"], k_cn: ["權力", "保護"], detail_en: "Power.", detail_cn: "權力。" },
  { en: "Stars", cn: "星星", k: ["Hope", "Clarity"], k_cn: ["希望", "清晰"], detail_en: "Hope.", detail_cn: "希望。" },
  { en: "Stork", cn: "鸛鳥", k: ["Change", "Movement"], k_cn: ["改變", "移動"], detail_en: "Change.", detail_cn: "改變。" },
  { en: "Dog", cn: "狗", k: ["Friend", "Loyalty"], k_cn: ["朋友", "忠誠"], detail_en: "Loyalty.", detail_cn: "忠誠。" },
  { en: "Tower", cn: "塔", k: ["Authority", "Isolation"], k_cn: ["權威", "孤立"], detail_en: "Authority.", detail_cn: "權威。" },
  { en: "Garden", cn: "花園", k: ["Public", "Society"], k_cn: ["公眾", "社交"], detail_en: "Social life.", detail_cn: "社交生活。" },
  { en: "Mountain", cn: "山", k: ["Obstacle", "Delay"], k_cn: ["障礙", "延遲"], detail_en: "Blockages.", detail_cn: "障礙。" },
  { en: "Crossroad", cn: "路口", k: ["Choice", "Options"], k_cn: ["選擇", "選項"], detail_en: "Decisions.", detail_cn: "決定。" },
  { en: "Mice", cn: "老鼠", k: ["Loss", "Stress"], k_cn: ["損失", "壓力"], detail_en: "Stress.", detail_cn: "壓力。" },
  { en: "Heart", cn: "愛心", k: ["Love", "Passion"], k_cn: ["愛", "熱情"], detail_en: "Love.", detail_cn: "愛。" },
  { en: "Ring", cn: "戒指", k: ["Commitment", "Contract"], k_cn: ["承諾", "合約"], detail_en: "Commitment.", detail_cn: "承諾。" },
  { en: "Book", cn: "書", k: ["Secret", "Knowledge"], k_cn: ["秘密", "知識"], detail_en: "Secrets.", detail_cn: "秘密。" },
  { en: "Letter", cn: "信", k: ["Message", "Document"], k_cn: ["訊息", "文件"], detail_en: "Written news.", detail_cn: "書面消息。" },
  { en: "Man", cn: "男人", k: ["Male", "Masculine"], k_cn: ["男性", "陽性"], detail_en: "Male figure.", detail_cn: "男性人物。" },
  { en: "Woman", cn: "女人", k: ["Female", "Feminine"], k_cn: ["女性", "陰性"], detail_en: "Female figure.", detail_cn: "女性人物。" },
  { en: "Lily", cn: "百合", k: ["Wisdom", "Peace"], k_cn: ["智慧", "和平"], detail_en: "Peace.", detail_cn: "和平。" },
  { en: "Sun", cn: "太陽", k: ["Success", "Energy"], k_cn: ["成功", "能量"], detail_en: "Success.", detail_cn: "成功。" },
  { en: "Moon", cn: "月亮", k: ["Emotion", "Recognition"], k_cn: ["情感", "認可"], detail_en: "Emotions.", detail_cn: "情感。" },
  { en: "Key", cn: "鑰匙", k: ["Solution", "Destiny"], k_cn: ["解決方案", "命運"], detail_en: "Solution.", detail_cn: "解決方案。" },
  { en: "Fish", cn: "魚", k: ["Money", "Flow"], k_cn: ["金錢", "流動"], detail_en: "Abundance.", detail_cn: "豐盛。" },
  { en: "Anchor", cn: "錨", k: ["Stability", "Goal"], k_cn: ["穩定", "目標"], detail_en: "Stability.", detail_cn: "穩定。" },
  { en: "Cross", cn: "十字架", k: ["Burden", "Faith"], k_cn: ["負擔", "信仰"], detail_en: "Burden.", detail_cn: "負擔。" }
];

const generateLenormandDeck = (): TarotCard[] => {
  return LENORMAND_DATA.map((card, i) => ({
    id: 200 + i,
    name: card.en,
    name_i18n: { [Language.EN]: card.en, [Language.ZH_TW]: card.cn },
    desc: { [Language.EN]: "Lenormand Oracle", [Language.ZH_TW]: "雷諾曼神諭" },
    keywords: { [Language.EN]: card.k, [Language.ZH_TW]: card.k_cn },
    meaningUpright: { [Language.EN]: card.detail_en, [Language.ZH_TW]: card.detail_cn },
    meaningReversed: { [Language.EN]: "", [Language.ZH_TW]: "" }
  }));
};

export const FULL_DECK: TarotCard[] = generateFullTarotDeck();
export const LENORMAND_DECK: TarotCard[] = generateLenormandDeck();
