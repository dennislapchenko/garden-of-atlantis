import rawDataLarge from "./data_large.json";
import rawDataPilot from "./data_pilot.json";

const data_large = rawDataLarge;
const data_pilot = rawDataPilot;

export const currency = data_large.currency;
export const money = (amt) => {
  return Math.round(amt).toLocaleString() + currency;
}
export const demoney = (amtFormatted) => {
  return parseFloat(amtFormatted.replace("$", "").replace(/,/g, ""))
}
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
const getFinalSourceAmt = (amt) => {
  return amt * data_large.source_proc.dry_percent * (1 - data_large.source_proc.testing_percent);
}
const arraySum = (arraychik) => {
  return Object.values(arraychik).reduce((accum, curr) => accum + curr, 0);
}
const arraySumWithPricePerUnit = (arraychik) => {
  return Object.values(arraychik).reduce((accum, curr) => accum + (curr.amount * curr.price_per_unit), 0);
}
const arraySumTotalWithDeMoney = (arraychik) => {
  return Object.values(arraychik).reduce((accum, curr) => accum + demoney(curr.total), 0);
}
export const emptyRow = (headers) => {
  return Object.fromEntries(headers.map((key) => [key, ""]))
}

export class Datka {
  parse(use) {
    const data = use === 'data_large' ? data_large : data_pilot

    const source_totals = {
      raw_kg: Object.values(data.sources).reduce((accum, curr) => accum + curr.amount, 0),
      dry_kg: Object.values(data.sources).reduce((accum, curr) => accum + curr.amount, 0) * data.source_proc.dry_percent,
    }

    const packageHeaders = data.source_proc.packages.flatMap(({size}) => ([
      `g${size}`,
      `g${size}_total`,
    ]))

    const source_proc = {
      headers: ["source", "raw_kg", "dry_kg", "testing_kg", ...packageHeaders, "total"],
      data: Object.entries(data.sources).map(([source, {amount}]) => {
        const dry_kg = amount * data.source_proc.dry_percent;
        const testing_kg = dry_kg * data.source_proc.testing_percent;
        const final_available_amount_in_grams = getFinalSourceAmt(amount) * 1000;
        const packageData = data.source_proc.packages.reduce((acc, {size, percent, price}) => {
          const packageCount = final_available_amount_in_grams * percent / size;
          const packageTotal = packageCount * price;
          return {
            ...acc,
            [`g${size}`]: `${packageCount.toLocaleString()} packages`,
            [`g${size}_total`]: money(packageTotal),
          };
        }, {});
        const packageTotal = data.source_proc.packages.reduce((acc, {size}) => {
          const key = `g${size}_total`;
          return key in packageData ? acc + demoney(packageData[key]) : acc;
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
      totals: source_totals,
      hours_to_dry: source_totals.raw_kg / data.source_proc.drying.batch_size_kg * data.source_proc.drying.batch_time_hr,
      hours_to_ground: source_totals.dry_kg / data.source_proc.grinding.batch_size_kg * data.source_proc.grinding.batch_time_hr,
      hours_to_packaged: source_totals.dry_kg / data.source_proc.packaging.batch_size_kg * data.source_proc.packaging.batch_time_hr,
    }

    const source_proc_time_energy_cost = {
      headers: ["process", "total_source", "batch_size_kg", "batch_time_hr", "hours_to_complete", "days_to_complete", "kw_per_hr", "total_kw", "price"],
      data: [
        {name: "drying", total_source_key: "raw_kg", hrs_to_complete_key: "hours_to_dry"},
        {name: "grinding", total_source_key: "dry_kg", hrs_to_complete_key: "hours_to_ground"},
        {name: "packaging", total_source_key: "dry_kg", hrs_to_complete_key: "hours_to_packaged"}
      ].map((process) => {
        const proc = data.source_proc[process.name]
        const hrs_to_complete = source_proc[process.hrs_to_complete_key]
        const total_kw = proc.energy_per_hour_kw * hrs_to_complete

        return {
          process: capitalize(process.name),
          total_source: source_proc.totals[process.total_source_key],
          batch_size_kg: proc.batch_size_kg,
          batch_time_hr: proc.batch_time_hr,
          kw_per_hr: proc.energy_per_hour_kw,
          total_kw: total_kw.toFixed(1),
          price: money(total_kw * data.operation.Electricity.price_per_unit),
          hours_to_complete: hrs_to_complete,
          days_to_complete: (hrs_to_complete / 24).toFixed(1)
        };
      })
    }

    //used by eval() from json values
    const totalElectricityByAllInstruments = parseFloat(Object.values(source_proc_time_energy_cost.data).reduce((accum, val) => accum + parseFloat(val.total_kw), 0).toFixed(2))
    //used by eval() from json values
    const packageCount = Object.values(source_proc.data).reduce((acc, src) => {
      let innerAcc = 0
      for (let key in src) {
        let pkgs = src[key]
        innerAcc += pkgs.includes("packages") ? parseFloat(pkgs.replace(/,/g, "").replace(" packages", "")) : 0
      }
      return acc + innerAcc
    }, 0)

    const spend_operation_data = Object.entries(data.operation).flatMap(([key, value]) => ({
      item: key,
      price: `${value.price_per_unit} ${currency}/${value.unit}`,
      quantity: (() => {
        try {
          return eval(value.amount);
        } catch (e) {
          return value.amount;
        }
      })().toLocaleString(),
      total: money(value.price_per_unit * (() => {
        try {
          return eval(value.amount);
        } catch (e) {
          return value.amount;
        }
      })())
    }))

    const spend = {
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
        data: spend_operation_data,
        total: arraySumTotalWithDeMoney(spend_operation_data)
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

    const sources_revenue_total = source_proc.data.reduce((acc, {source, ...rest}) => {
      const packageTotal = data.source_proc.packages.reduce((total, {size}) => {
        const key = `g${size}_total`;
        return key in rest ? total + parseFloat(rest[key].replace("$", "").replace(/,/g, "")) : total;
      }, 0);
      return acc + packageTotal;
    }, 0)

    const source_revenue_total_after_amazon = sources_revenue_total * (1 - data.revenue_proc.amazon_fee_percent)

    return {
      data: data,

      source_proc: source_proc,
      sources_revenue_total: sources_revenue_total,
      source_proc_time_energy_cost: source_proc_time_energy_cost,
      spend: spend,

      package_info: {
        headers: ["size", "percentage", "price", "price_per_kg", "profit_per_gram"],
        data: data.source_proc.packages.map((pack) => ({
          size: `${pack.size}g`,
          percentage: `${pack.percent * 100}%`,
          price: `${pack.price}${data.currency}`,
          price_per_kg: money(1000*pack.price/pack.size),
          profit_per_gram: (((pack.price/pack.size)-(data.sources.Blueberry.price_per_unit/(1000*data_large.source_proc.dry_percent))) / (data.sources.Blueberry.price_per_unit/(1000*data_large.source_proc.dry_percent)) * 100).toLocaleString()+"%"
        }))
      },

      revenue: {
        headers: ["year", "revenue", "cost_of_source", "gross_profit", "operating_expenses", "annual_expenses", "startup_expenses", "net_profit"],
        data: [
          {
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
            revenue: money(source_revenue_total_after_amazon * 1.5) + ` (after Amazon fee of ${money(sources_revenue_total * 1.5 * data.revenue_proc.amazon_fee_percent)})`,
            cost_of_source: money(spend.source.total * 1.5),
            gross_profit: money(source_revenue_total_after_amazon * 1.5 - spend.source.total * 1.5),
            operating_expenses: money(spend.operation.total * 1.5),
            annual_expenses: money(spend.monthly.total_annual * 1.5),
            startup_expenses: money(0),
            net_profit: money((source_revenue_total_after_amazon - spend.source.total - spend.operation.total - spend.monthly.total_annual) * 1.5) + " (+50%)",
          },
          {
            year: 3,
            revenue: money(source_revenue_total_after_amazon * 2) + ` (after Amazon fee of ${money(sources_revenue_total * 2 * data.revenue_proc.amazon_fee_percent)})`,
            cost_of_source: money(spend.source.total * 2),
            gross_profit: money(source_revenue_total_after_amazon * 2 - spend.source.total * 2),
            operating_expenses: money(spend.operation.total * 2),
            annual_expenses: money(spend.monthly.total_annual * 2),
            startup_expenses: money(0),
            net_profit: money((source_revenue_total_after_amazon - spend.source.total - spend.operation.total - spend.monthly.total_annual) * 2) + " (+50%)",
          }]
      }
    }
  }
}
