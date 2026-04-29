export const GROUP_COLORS = [
  '#1cc29f', '#3b82f6', '#8b5cf6', '#f59e0b',
  '#ef4444', '#10b981', '#f97316', '#06b6d4',
]

export const GROUP_EMOJIS = {
  home: '🏠',
  trip: '✈️',
  couple: '💑',
  friends: '👫',
  other: '👥',
}

export const CATEGORY_EMOJIS = {
  food: '🍔',
  transport: '🚗',
  accommodation: '🏨',
  entertainment: '🎬',
  shopping: '🛍️',
  utilities: '💡',
  other: '📝',
}

export const getGroupColor = (name = '') => {
  const index = name.charCodeAt(0) % GROUP_COLORS.length
  return GROUP_COLORS[index]
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
