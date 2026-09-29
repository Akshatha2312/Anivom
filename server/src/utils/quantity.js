const isPositiveIntegerQuantity = (quantity) =>
  typeof quantity === 'number' && Number.isInteger(quantity) && quantity > 0;

module.exports = { isPositiveIntegerQuantity };