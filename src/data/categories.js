export const CATEGORIES = [
  { id: 'food', label: 'Comida y Restaurantes', icon: '🍔', color: '#f97316' },
  { id: 'transport', label: 'Transporte', icon: '🚗', color: '#3b82f6' },
  { id: 'housing', label: 'Vivienda', icon: '🏠', color: '#8b5cf6' },
  { id: 'health', label: 'Salud', icon: '💊', color: '#10b981' },
  { id: 'entertainment', label: 'Entretenimiento', icon: '🎬', color: '#ec4899' },
  { id: 'education', label: 'Educación', icon: '📚', color: '#06b6d4' },
  { id: 'clothing', label: 'Ropa y Calzado', icon: '👕', color: '#f59e0b' },
  { id: 'savings', label: 'Ahorros', icon: '💰', color: '#6366f1' },
  { id: 'subscriptions', label: 'Suscripciones', icon: '📱', color: '#a855f7' },
  { id: 'groceries', label: 'Supermercado', icon: '🛒', color: '#84cc16' },
  { id: 'travel', label: 'Viajes', icon: '✈️', color: '#0ea5e9' },
  { id: 'gifts', label: 'Regalos', icon: '🎁', color: '#f43f5e' },
  { id: 'sport', label: 'Deporte', icon: '⚽', color: '#14b8a6' },
  { id: 'beauty', label: 'Belleza y Cuidado', icon: '💄', color: '#e879f9' },
  { id: 'other', label: 'Otros', icon: '📦', color: '#64748b' },
];

export const getCategoryById = (id) =>
  CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];

export const PAYMENT_METHODS = [
  { id: 'cash', label: 'Efectivo', icon: '💵' },
  { id: 'card_debit', label: 'Tarjeta Débito', icon: '💳' },
  { id: 'card_credit', label: 'Tarjeta Crédito', icon: '💳' },
  { id: 'transfer', label: 'Transferencia', icon: '🏦' },
  { id: 'digital', label: 'Pago Digital', icon: '📲' },
];

export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'Dólar estadounidense' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'MXN', symbol: '$', label: 'Peso mexicano' },
  { code: 'ARS', symbol: '$', label: 'Peso argentino' },
  { code: 'COP', symbol: '$', label: 'Peso colombiano' },
  { code: 'CLP', symbol: '$', label: 'Peso chileno' },
  { code: 'PEN', symbol: 'S/', label: 'Sol peruano' },
  { code: 'BRL', symbol: 'R$', label: 'Real brasileño' },
];
