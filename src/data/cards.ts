import type { ArmCard, DishCard, ExploreCard, Ingredient, Ingredients, PointCard, PointCardValue } from "../types/game";

export const ingredientLabels: Record<Ingredient, { label: string; emoji: string }> = {
  meat: { label: "고기", emoji: "🍖" },
  mushroom: { label: "버섯", emoji: "🍄" },
  herb: { label: "허브", emoji: "🌿" },
  fish: { label: "생선", emoji: "🐟" },
  grain: { label: "곡물", emoji: "🌾" }
};

export const ingredientKeys = Object.keys(ingredientLabels) as Ingredient[];

export const emptyIngredients = (): Ingredients => ({
  meat: 0,
  mushroom: 0,
  herb: 0,
  fish: 0,
  grain: 0
});

export const createPointDeck = (): PointCard[] => {
  const config: Array<[PointCardValue, number]> = [
    [1, 10],
    [0, 4],
    [-1, 6],
    [3, 7],
    [-3, 3]
  ];
  return config.flatMap(([value, count]) =>
    Array.from({ length: count }, (_, index) => ({
      id: `${value}-${index}-${Math.random().toString(36).slice(2)}`,
      value
    }))
  );
};

export const arms: ArmCard[] = [
  { id: "tongs", name: "집게팔", emoji: "🦴", cost: 1, description: "식재료 칸에서 획득 +1" },
  { id: "basket", name: "바구니팔", emoji: "🌾", cost: 2, description: "휴대량 +3" },
  { id: "axe", name: "도끼팔", emoji: "🦴", cost: 2, description: "부정적 탐색 이벤트 1회 무시" },
  { id: "ladle", name: "국자팔", emoji: "🍳", cost: 2, description: "요리 포인트 비용 -1" },
  { id: "fishing", name: "낚싯대팔", emoji: "🐟", cost: 1, description: "생선 획득 시 +1" },
  { id: "hook", name: "갈고리팔", emoji: "🦴", cost: 2, description: "탐색 칸에서 식재료를 얻으면 +1개" },
  { id: "golden", name: "황금 셰프팔", emoji: "🍳", cost: 3, description: "완성 요리마다 +2점" },
  { id: "cart", name: "수레팔", emoji: "🌾", cost: 3, description: "휴대량 +5" }
];

const makeIngredients = (entries: Partial<Ingredients>): Ingredients => ({
  ...emptyIngredients(),
  ...entries
});

export const dishes: DishCard[] = [
  { id: "steak", name: "좀비 스테이크", emoji: "🍖", ingredients: makeIngredients({ meat: 2, herb: 1 }), cost: 1, score: 8, description: "씹을수록 묘하게 살아나는 좀비식 단백질 코스." },
  { id: "soup", name: "버섯 수프", emoji: "🍄", ingredients: makeIngredients({ mushroom: 2, herb: 1 }), cost: 0, score: 6, description: "으스스한 향이 올라오는 따뜻한 생존 수프." },
  { id: "pie", name: "생선 파이", emoji: "🐟", ingredients: makeIngredients({ fish: 2, grain: 1 }), cost: 1, score: 7, description: "비늘은 바삭하고 속은 촉촉한 종말 파이." },
  { id: "salad", name: "뇌 모양 샐러드", emoji: "🌿", ingredients: makeIngredients({ herb: 2, mushroom: 1 }), cost: 0, score: 5, description: "모양만 수상하고 맛은 산뜻한 샐러드." },
  { id: "goldenMeal", name: "황금 좀비 정식", emoji: "🍳", ingredients: makeIngredients({ meat: 2, fish: 1, herb: 1, grain: 1 }), cost: 2, score: 14, description: "해독약 심사위원도 고개를 끄덕일 완성형 정식." },
  { id: "risotto", name: "허브 리조또", emoji: "🌿", ingredients: makeIngredients({ herb: 2, grain: 2 }), cost: 1, score: 7, description: "느릿하게 저어 만든 초록빛 회복 요리." },
  { id: "burger", name: "해골 버거", emoji: "🦴", ingredients: makeIngredients({ meat: 1, grain: 2, herb: 1 }), cost: 1, score: 8, description: "뼈 모양 장식이 귀여운 든든한 버거." },
  { id: "curry", name: "좀비 카레", emoji: "🍖", ingredients: makeIngredients({ meat: 1, mushroom: 1, grain: 1, herb: 1 }), cost: 2, score: 10, description: "진한 향신료로 멘탈을 붙잡는 카레." },
  { id: "fishStew", name: "생선 스튜", emoji: "🐟", ingredients: makeIngredients({ fish: 2, herb: 1, mushroom: 1 }), cost: 2, score: 10, description: "깊은 냄비에서 끓어오르는 바다의 한 숟갈." },
  { id: "omelet", name: "버섯 오믈렛", emoji: "🍳", ingredients: makeIngredients({ mushroom: 2, grain: 1 }), cost: 0, score: 6, description: "계란은 없지만 팬 기술로 설득하는 오믈렛." },
  { id: "sandwich", name: "썩지 않은 샌드위치", emoji: "🌾", ingredients: makeIngredients({ grain: 2, meat: 1, herb: 1 }), cost: 1, score: 8, description: "아직 멀쩡하다는 사실만으로도 귀한 샌드위치." },
  { id: "platter", name: "고기 플래터", emoji: "🍖", ingredients: makeIngredients({ meat: 3, herb: 1 }), cost: 2, score: 11, description: "화끈한 양으로 심사장을 조용하게 만드는 접시." },
  { id: "pizza", name: "허브 피자", emoji: "🌿", ingredients: makeIngredients({ herb: 2, grain: 2, mushroom: 1 }), cost: 2, score: 11, description: "초록 토핑이 눈을 뜨게 만드는 바삭한 피자." },
  { id: "porridge", name: "심야 곡물죽", emoji: "🌾", ingredients: makeIngredients({ grain: 3, herb: 1 }), cost: 0, score: 7, description: "새벽에도 부담 없는 부드러운 생존식." },
  { id: "lastSupper", name: "셰프의 최후의 만찬", emoji: "🍳", ingredients: makeIngredients({ meat: 2, mushroom: 2, herb: 2, fish: 1, grain: 1 }), cost: 3, score: 18, description: "좀비 셰프 인생을 건 마지막 시그니처 코스." }
];

export const exploreCards: ExploreCard[] = [
  { id: "forward2", title: "냄새를 따라 전진", description: "앞으로 2칸 이동" },
  { id: "back2", title: "발목 삐끗", description: "뒤로 2칸 이동", negative: true },
  { id: "gain1", title: "찬장 발견", description: "랜덤 식재료 1개 획득" },
  { id: "lose1", title: "봉지 찢어짐", description: "식재료 1개 잃음", negative: true },
  { id: "skip", title: "멍한 좀비 모드", description: "다음 턴 스킵", negative: true },
  { id: "cookDiscount", title: "레시피 번뜩임", description: "다음 요리 비용 -1" },
  { id: "push", title: "비틀비틀 밀치기", description: "다른 플레이어 1칸 밀기" },
  { id: "extraHerb", title: "비밀 허브 화분", description: "허브 1개 획득" },
  { id: "armDiscount", title: "부품 할인", description: "다음 팔 구매 비용 -1" },
  { id: "nearestKitchen", title: "주방 냄새 감지", description: "가장 가까운 주방 방향 2칸 이동" },
  { id: "gain2", title: "버려진 식료품 상자", description: "랜덤 식재료 2개 획득" },
  { id: "loseFish", title: "미끄러운 생선 탈주", description: "생선 전부 잃음", negative: true },
  { id: "swap", title: "위치 대혼란", description: "다른 플레이어와 위치 교환" },
  { id: "steal", title: "슬쩍 한입", description: "다른 플레이어 식재료 1개 훔치기" },
  { id: "gainGrain", title: "곡물 자루 발견", description: "곡물 1개 획득" },
  { id: "gainMeat", title: "수상한 고기 상자", description: "고기 1개 획득" },
  { id: "nearestIngredient", title: "식재료 냄새 추적", description: "가장 가까운 식재료 칸 이동" },
  { id: "moveBonus", title: "다리 워밍업", description: "이번 턴 이동 +1" },
  { id: "legBreak", title: "다리 고장", description: "즉시 -2칸", negative: true },
  { id: "gainMushroom", title: "축축한 버섯 상자", description: "버섯 1개 획득" }
];
