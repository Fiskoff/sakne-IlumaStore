// В файле filters-config.ts обновите конфигурацию для terea
export const filterConfigs = {
  iqos: {
    title: "Iqos Iluma",
    filters: [
      {
        id: "brand",
        type: "checkbox",
        label: "Модель",
        options: [
          { value: "one", label: "One" },
          { value: "standart", label: "Standart" },
          { value: "prime", label: "Prime" },
          { value: "onei", label: "I One" },
          { value: "standarti", label: "I Standart" },
          { value: "primei", label: "I Prime" },
        ],
      },
      {
        id: "price",
        type: "range",
        label: "Цена",
        min: 0,
        max: 35000,
        step: 1000,
      },
      {
        id: "color",
        type: "multiselect",
        label: "Цвет",
        options: [
          { value: "Серый", label: "Серый" },
          { value: "Зеленый", label: "Зеленый" },
          { value: "Синий", label: "Синий" },
          { value: "Бежевый", label: "Бежевый" },
          { value: "Красный", label: "Красный" },
          { value: "Черный", label: "Черный" },
          { value: "Оранжевый", label: "Оранжевый" },
          { value: "Фиолетовый", label: "Фиолетовый" },
          { value: "Желтый", label: "Желтый" },
        ],
      },
    ],
  },
  terea: {
    title: "Стики Terea",
    filters: [
      {
        id: "country",
        type: "checkbox",
        label: "Страна",
        options: [
          { value: "Казахстан", label: "Казахстан" },
          { value: "Узбекистан", label: "Узбекистан" },
          { value: "Армения", label: "Армения" },
          { value: "Индонезия", label: "Индонезия" },
          { value: "Польша", label: "Польша" },
          { value: "Япония", label: "Япония" },
          { value: "Швейцария", label: "Швейцария" },
          { value: "Европа", label: "Европа" },
        ],
      },
      {
        id: "price",
        type: "range",
        label: "Цена",
        min: 0,
        max: 12000,
        step: 1000,
      },
    ],
  },
  devices: {
    title: "Аксессуары",
    filters: [
      {
        id: "brand",
        type: "checkbox",
        label: "Модель",
        options: [
          { value: "ringsiluma", label: "Кольца Iluma" },
          { value: "capsilumaprime", label: "Крышки Iluma Prime" },
          { value: "capsilumastandart", label: "Крышки Iluma Standart" },
          { value: "holderiqosiluma", label: "Держатель Iqos Iluma" },
        ],
      },
      {
        id: "price",
        type: "range",
        label: "Цена",
        min: 0,
        max: 10000,
        step: 1000,
      },
      {
        id: "color",
        type: "multiselect",
        label: "Цвет",
        options: [
          { value: "Красный", label: "Красный" },
          { value: "Черный", label: "Черный" },
          { value: "Бежевый", label: "Бежевый" },
          { value: "Синий", label: "Синий" },
          { value: "Оранжевый", label: "Оранжевый" },
          { value: "Зеленый", label: "Зеленый" },
          { value: "Фиолетовый", label: "Фиолетовый" },
          { value: "Желтый", label: "Желтый" },
          { value: "Серый", label: "Серый" },
        ],
      },
    ],
  },
} as const;
