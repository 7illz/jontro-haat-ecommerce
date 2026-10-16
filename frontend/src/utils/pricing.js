export const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export const calculatePricing = ({ itemsPrice, discountPercentage = 0, pricing }) => {
  const roundedItemsPrice = roundMoney(itemsPrice);
  const discountPrice = roundMoney(roundedItemsPrice * (discountPercentage / 100));
  const discountedSubtotal = roundMoney(roundedItemsPrice - discountPrice);
  const taxPrice = roundMoney(discountedSubtotal * pricing.taxRate);
  return {
    itemsPrice: roundedItemsPrice,
    discountPrice,
    taxPrice,
    shippingPrice: pricing.flatShippingPrice,
    totalPrice: roundMoney(discountedSubtotal + pricing.flatShippingPrice + taxPrice),
  };
};

export const formatMoney = (amount, pricing) =>
  `${pricing.currencySymbol}${Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
