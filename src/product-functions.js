const priceFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 2,
});

function validatePrice(price) {
  if (typeof price !== 'number' || !Number.isFinite(price) || price < 0) {
    throw new RangeError('Цена должна быть конечным неотрицательным числом');
  }
}

export function formatPrice(price) {
  validatePrice(price);
  return priceFormatter.format(price);
}

export function calculateDiscount(price, discountPercent) {
  validatePrice(price);
  if (typeof discountPercent !== 'number' || !Number.isFinite(discountPercent) ||
      discountPercent < 0 || discountPercent > 100) {
    throw new RangeError('Скидка должна быть числом от 0 до 100');
  }
  return Math.round(price * discountPercent) / 100;
}

export function calculateFinalPrice(price, discountPercent) {
  return Math.round((price - calculateDiscount(price, discountPercent)) * 100) / 100;
}

export function getProductStatus(product, availableStock = product.stock) {
  return product.isAvailable && availableStock > 0 ? 'В наличии' : 'Нет в наличии';
}

export function createProductSummary(product, availableStock = product.stock) {
  const initialPrice = product.oldPrice > 0 ? product.oldPrice : product.price;
  const price = calculateFinalPrice(initialPrice, product.discountPercent);
  return `${product.name}: ${formatPrice(price)}. Статус: ${getProductStatus(product, availableStock)}.`;
}

