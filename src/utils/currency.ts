
export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatNumber = (value: number, decimalPlaces: number = 2): string => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  }).format(value);
};

export const parseCurrency = (value: string): number => {
  // Remove currency symbols and parse as float
  const cleanValue = value.replace(/[₹,\s]/g, '');
  return parseFloat(cleanValue) || 0;
};
