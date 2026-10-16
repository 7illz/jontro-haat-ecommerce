const { pricing } = require('../config/env');

const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const getPublicPricing = () => ({
  flatShippingPrice: pricing.flatShippingPrice,
  taxRate: pricing.taxRate,
  currencyCode: pricing.currencyCode,
  currencySymbol: pricing.currencySymbol,
});

const calculateTotals = (itemsPrice, discountPercentage = 0) => {
  const trustedItemsPrice = roundMoney(itemsPrice);
  const discountPrice = roundMoney(trustedItemsPrice * (discountPercentage / 100));
  const discountedSubtotal = roundMoney(trustedItemsPrice - discountPrice);
  const taxPrice = roundMoney(discountedSubtotal * pricing.taxRate);
  const totalPrice = roundMoney(discountedSubtotal + pricing.flatShippingPrice + taxPrice);
  return {
    itemsPrice: trustedItemsPrice,
    discountPrice,
    taxPrice,
    shippingPrice: pricing.flatShippingPrice,
    totalPrice,
  };
};

module.exports = { roundMoney, getPublicPricing, calculateTotals };
