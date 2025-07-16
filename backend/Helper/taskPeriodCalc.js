
const calculateTaskPeriod = (startTime, period) => {
  const startDate = new Date(startTime);

  // If `period` is an ISO date string, return it directly
  if (!isNaN(Date.parse(period))) {
    return new Date(period).toISOString();
  }

  // Regex to match dynamic period inputs like "1 year", "6 months"
  const periodRegex = /^(\d+)\s*(year|month|week|day)s?$/i;

  const match = periodRegex.exec(period);
  if (!match) {
    throw new Error(`Invalid task period format: ${period}`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case "year":
      startDate.setFullYear(startDate.getFullYear() + value);
      break;
    case "month":
      startDate.setMonth(startDate.getMonth() + value);
      break;
    case "week":
      startDate.setDate(startDate.getDate() + value * 7);
      break;
    case "day":
      startDate.setDate(startDate.getDate() + value);
      break;
    default:
      throw new Error(`Unsupported time unit: ${unit}`);
  }

  return startDate.toISOString();
};

module.exports = calculateTaskPeriod;
