import { products } from './data';
import { calculateDiscount, calculateFinalPrice, createProductSummary, formatPrice, getProductStatus } from './product-functions';

const product = products[0];
const originalPrice = product.oldPrice || product.price;

console.groupCollapsed('Практическая работа — данные и функции товара');
console.log('Объект товара', product);
console.table({
  formatPrice: formatPrice(product.price),
  calculateDiscount: calculateDiscount(originalPrice, product.discountPercent),
  calculateFinalPrice: calculateFinalPrice(originalPrice, product.discountPercent),
  getProductStatus: getProductStatus(product),
  createProductSummary: createProductSummary(product),
});
console.groupEnd();

