export function calculateProductPrice(params: {
  filamentCosts: number[];
  printingHours: number;
  energyCostPerKwh: number;
  packagingCost: number;
  platformCommission: number;
  taxPercentage: number;
  profitMarginPercentage: number;
  printerWattage?: number;
}): {
  filamentCost: number;
  energyCost: number;
  packagingCost: number;
  subtotal: number;
  platformCommissionValue: number;
  taxValue: number;
  totalCost: number;
  profitValue: number;
  finalPrice: number;
} {
  const {
    filamentCosts,
    printingHours,
    energyCostPerKwh,
    packagingCost,
    platformCommission,
    taxPercentage,
    profitMarginPercentage,
    printerWattage = 200,
  } = params;

  // Custo total de filamento
  const filamentCost = filamentCosts.reduce((sum, cost) => sum + cost, 0);

  // Custo de energia: (Wattage / 1000) * horas * custo por kWh
  const energyCost = (printerWattage / 1000) * printingHours * energyCostPerKwh;

  // Subtotal dos custos diretos
  const subtotal = filamentCost + energyCost + packagingCost;

  // Calcula preço com margem de lucro
  const priceWithProfit = subtotal * (1 + profitMarginPercentage / 100);

  // Calcula comissão da plataforma
  const platformCommissionValue = priceWithProfit * (platformCommission / 100);

  // Calcula imposto
  const taxValue = priceWithProfit * (taxPercentage / 100);

  // Custo total incluindo comissões e impostos
  const totalCost = subtotal + platformCommissionValue + taxValue;

  // Valor do lucro
  const profitValue = priceWithProfit - subtotal;

  // Preço final de venda
  const finalPrice = totalCost + profitValue;

  return {
    filamentCost: Number(filamentCost.toFixed(2)),
    energyCost: Number(energyCost.toFixed(2)),
    packagingCost: Number(packagingCost),
    subtotal: Number(subtotal.toFixed(2)),
    platformCommissionValue: Number(platformCommissionValue.toFixed(2)),
    taxValue: Number(taxValue.toFixed(2)),
    totalCost: Number(totalCost.toFixed(2)),
    profitValue: Number(profitValue.toFixed(2)),
    finalPrice: Number(finalPrice.toFixed(2)),
  };
}

export function calculateFilamentCost(
  pricePerGram: number,
  gramsUsed: number,
): number {
  return Number((pricePerGram * gramsUsed).toFixed(2));
}

export function calculatePricePerGram(
  totalValue: number,
  totalGrams: number,
): number {
  return Number((totalValue / totalGrams).toFixed(4));
}

export function predictStockBreakage(
  currentStock: number,
  averageDailyUsage: number,
  daysToPredict: number = 30,
): {
  willBreak: boolean;
  daysUntilBreakage: number;
  recommendedPurchase: number;
} {
  const projectedUsage = averageDailyUsage * daysToPredict;
  const willBreak = currentStock < projectedUsage;
  const daysUntilBreakage = willBreak
    ? Math.floor(currentStock / averageDailyUsage)
    : -1;
  const recommendedPurchase = willBreak
    ? Math.ceil(projectedUsage - currentStock)
    : 0;

  return {
    willBreak,
    daysUntilBreakage,
    recommendedPurchase,
  };
}
