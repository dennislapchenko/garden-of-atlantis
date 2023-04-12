import data from "./data.json";
export const currency = data.currency;
export const money = (amt) => {
  return Math.round(amt).toLocaleString() + currency;
}
const getFinalSourceAmt = (amt) => {
  return amt * data.source_proc.dry_percent * (1 - data.source_proc.testing_percent);
}
const arraySum = (arraychik) => {
  return Object.values(arraychik).reduce((accum, curr) => accum + curr, 0);
}
const arraySumWithPricePerUnit = (arraychik) => {
  return Object.values(arraychik).reduce((accum, curr) => accum + (curr.amount * curr.price_per_unit), 0);
}
export const emptyRow = (headers) => {
  return Object.fromEntries(headers.map((key) => [key, ""]))
}

export const spend = {
  startup: {
    headers: ["item", "total"],
    data: Object.entries(data.startup).flatMap(([key, value]) => ({
      item: key,
      total: money(value)
    })),
    total: arraySum(data.startup)
  },
  monthly: {
    headers: ["item", "total"],
    data: Object.entries(data.monthly).flatMap(([key, value]) => ({
      item: key,
      total: money(value)
    })),
    total: arraySum(data.monthly),
    total_annual: arraySum(data.monthly) * 12
  },
  operation: {
    headers: ["item", "price", "quantity", "total"],
    data: Object.entries(data.operation).flatMap(([key, value]) => ({
      item: key,
      price: `${value.price_per_unit} ${currency}/${value.unit}`,
      quantity: value.amount.toLocaleString(),
      total: money(value.price_per_unit * value.amount)
    })),
    total: arraySumWithPricePerUnit(data.operation)
  },
  source: {
    headers: ["item", "price", "quantity", "total"],
    data: Object.entries(data.sources).flatMap(([key, value]) => ({
      item: key,
      price: `${value.price_per_unit} ${currency}/${value.unit}`,
      quantity: value.amount.toLocaleString(),
      total: money(value.price_per_unit * value.amount)
    })),
    total: arraySumWithPricePerUnit(data.sources)
  }
}

export const package_info = data.source_proc.packages.map(({ size, percent }) => ({
  size: `${size}g`,
  percentage: `${percent * 100}%`
}));

export const packageHeaders = data.source_proc.packages.flatMap(({ size }) => ([
  `g${size}`,
  `g${size}_total`,
]));

export const source_proc = {
  headers: ["source", "raw_kg", "dry_kg", "testing_kg", ...packageHeaders, "total"],
  data: Object.entries(data.sources).map(([source, { amount }]) => {
    const dry_kg = amount * data.source_proc.dry_percent;
    const testing_kg = dry_kg * data.source_proc.testing_percent;
    const final_available_amount_in_grams = getFinalSourceAmt(amount) * 1000;
    const packageData = data.source_proc.packages.reduce((acc, { size, percent, price }) => {
      const packageCount = final_available_amount_in_grams * percent / size;
      const packageTotal = packageCount * price;
      return {
        ...acc,
        [`g${size}`]: `${packageCount.toLocaleString()} packages`,
        [`g${size}_total`]: money(packageTotal),
      };
    }, {});
    const packageTotal = data.source_proc.packages.reduce((acc, { size }) => {
      const key = `g${size}_total`;
      return key in packageData ? acc + parseFloat(packageData[key].replace("$", "").replace(/,/g, "")) : acc;
    }, 0);
    return {
      source,
      raw_kg: amount.toLocaleString(),
      dry_kg: dry_kg.toLocaleString(),
      testing_kg: testing_kg.toLocaleString(),
      ...packageData,
      total: money(packageTotal),
    };
  }),
  total_amount_in_kg: Object.values(data.sources).reduce((accum, curr) => accum + curr.amount, 0),
  hours_to_dry: Object.values(data.sources).reduce((accum, curr) => accum + curr.amount, 0) / data.source_proc.drying.batch_size_kg  * data.source_proc.drying.batch_time_hr
}

export const sources_revenue_total = source_proc.data.reduce((acc, { source, ...rest }) => {
  const packageTotal = data.source_proc.packages.reduce((total, { size }) => {
    const key = `g${size}_total`;
    return key in rest ? total + parseFloat(rest[key].replace("$", "").replace(/,/g, "")) : total;
  }, 0);
  return acc + packageTotal;
}, 0);

const source_revenue_total_after_amazon = sources_revenue_total * (1 - data.revenue_proc.amazon_fee_percent)

export const revenue = {
  headers: ["year", "revenue", "cost_of_source", "gross_profit", "operating_expenses", "annual_expenses", "startup_expenses", "net_profit"],
  data: [{
    year: 1,
    revenue: money(source_revenue_total_after_amazon) + ` (after Amazon fee of ${money(sources_revenue_total * data.revenue_proc.amazon_fee_percent)})`,
    cost_of_source: money(spend.source.total),
    gross_profit: money(source_revenue_total_after_amazon - spend.source.total),
    operating_expenses: money(spend.operation.total),
    annual_expenses: money(spend.monthly.total_annual),
    startup_expenses: money(spend.startup.total),
    net_profit: money(source_revenue_total_after_amazon - spend.source.total - spend.operation.total - spend.monthly.total_annual - spend.startup.total),
  },
    {
      year: 2,
      revenue: money(source_revenue_total_after_amazon*1.5) + ` (after Amazon fee of ${money(sources_revenue_total * 1.5 * data.revenue_proc.amazon_fee_percent)})`,
      cost_of_source: money(spend.source.total*1.5),
      gross_profit: money(source_revenue_total_after_amazon*1.5 - spend.source.total*1.5),
      operating_expenses: money(spend.operation.total*1.5),
      annual_expenses: money(spend.monthly.total_annual*1.5),
      startup_expenses: money(spend.startup.total*0),
      net_profit: money((source_revenue_total_after_amazon - spend.source.total - spend.operation.total - spend.monthly.total_annual)*1.5)+" (+50%)",
    },
    {
      year: 3,
      revenue: money(source_revenue_total_after_amazon*2) + ` (after Amazon fee of ${money(sources_revenue_total * 2 * data.revenue_proc.amazon_fee_percent)})`,
      cost_of_source: money(spend.source.total*2),
      gross_profit: money(source_revenue_total_after_amazon*2 - spend.source.total*2),
      operating_expenses: money(spend.operation.total*2),
      annual_expenses: money(spend.monthly.total_annual*2),
      startup_expenses: money(spend.startup.total*0),
      net_profit: money((source_revenue_total_after_amazon - spend.source.total - spend.operation.total - spend.monthly.total_annual)*2)+" (+50%)",
    }]
}
