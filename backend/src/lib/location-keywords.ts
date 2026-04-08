/**
 * Bilingual (Vietnamese / English) keyword dictionaries for search query parsing.
 * Used in [3] Query Parsing to split intent from location modifiers.
 *
 * All keys are lowercased / unaccented so they match after normalizeQuery().
 */

/** Maps normalized admin-level keywords → canonical type */
export const ADMIN_LEVEL_KEYWORDS: Record<
  string,
  "district" | "ward" | "city" | "province" | "street"
> = {
  // Districts
  quan: "district",
  "quận": "district",
  "q.": "district",
  q: "district",
  district: "district",
  dist: "district",
  // Wards
  phuong: "ward",
  "phường": "ward",
  "p.": "ward",
  ward: "ward",
  xa: "ward",
  "xã": "ward",
  // Cities
  "thanh pho": "city",
  "thành phố": "city",
  "tp.": "city",
  tp: "city",
  city: "city",
  // Provinces
  tinh: "province",
  "tỉnh": "province",
  province: "province",
  // Streets / alleys
  duong: "street",
  "đường": "street",
  "d.": "street",
  hem: "street",
  "hẻm": "street",
  ngo: "street",
  "ngõ": "street",
  street: "street",
  road: "street",
  st: "street",
  rd: "street",
  ave: "street",
};

/** City name aliases → canonical normalized value for district_name / city_name filtering */
export const CITY_ALIASES: Record<string, string> = {
  hcm: "ho chi minh",
  "hồ chí minh": "ho chi minh",
  "ho chi minh city": "ho chi minh",
  saigon: "ho chi minh",
  "sài gòn": "ho chi minh",
  "sai gon": "ho chi minh",
  sgn: "ho chi minh",
  hn: "ha noi",
  "hà nội": "ha noi",
  hanoi: "ha noi",
  "ha noi": "ha noi",
  dn: "da nang",
  "đà nẵng": "da nang",
  "da nang": "da nang",
  ct: "can tho",
  "cần thơ": "can tho",
  "can tho": "can tho",
  hp: "hai phong",
  "hải phòng": "hai phong",
  "hai phong": "hai phong",
};

/**
 * Vietnamese → English food/place synonyms for query expansion.
 * Keys are normalized (unaccented lowercase). Values are alternative search terms.
 */
export const VI_SYNONYMS: Record<string, string[]> = {
  // Food & drink
  pho: ["bun bo", "mi quang", "chao"],
  "bun bo": ["pho bo hue", "bun hue"],
  "banh mi": ["banh my", "o banh mi"],
  "com tam": ["com suon", "com tam suon"],
  "hu tieu": ["hu tiu", "mi hoanh thanh"],
  "ca phe": ["cafe", "coffee", "tra da"],
  "tra sua": ["bubble tea", "tra trai cay", "ca phe sua"],
  cafe: ["ca phe", "coffee shop", "quan cafe"],
  coffee: ["ca phe", "cafe"],
  "banh xeo": ["banh cuon", "banh khot"],
  "goi cuon": ["cuon tuoi", "cha gio"],
  "lau": ["hot pot", "lau nuong"],
  pizza: ["banh pizza", "quan pizza"],
  burger: ["hamburger", "fast food"],
  // Place categories
  "nha hang": ["quan an", "restaurant", "eating"],
  "quan an": ["nha hang", "com binh dan"],
  restaurant: ["nha hang", "quan an"],
  "khach san": ["hotel", "nha nghi", "resort"],
  hotel: ["khach san", "nha nghi"],
  "cho": ["market", "sieu thi nho"],
  market: ["cho", "cho dem"],
  "sieu thi": ["supermarket", "hypermarket", "cua hang"],
  supermarket: ["sieu thi"],
  "cua hang": ["shop", "tiem"],
  shop: ["cua hang", "tiem"],
  "tiem thuoc": ["nha thuoc", "pharmacy"],
  pharmacy: ["nha thuoc", "tiem thuoc"],
  "benh vien": ["hospital", "phong kham"],
  hospital: ["benh vien"],
  "truong hoc": ["school", "truong"],
  school: ["truong hoc"],
  "cong vien": ["park", "vuon hoa"],
  park: ["cong vien", "khu vui choi"],
};

/** English → Vietnamese synonyms (reverse direction) */
export const EN_SYNONYMS: Record<string, string[]> = {
  restaurant: ["nha hang", "quan an"],
  cafe: ["ca phe", "quan ca phe"],
  coffee: ["ca phe"],
  hotel: ["khach san"],
  market: ["cho"],
  supermarket: ["sieu thi"],
  hospital: ["benh vien"],
  school: ["truong hoc"],
  park: ["cong vien"],
  pharmacy: ["nha thuoc"],
};
