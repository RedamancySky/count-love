export interface LoveDuration {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
}

function addYears(date: Date, years: number) {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + years);
  return next;
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function calculateLoveDuration(startDate: Date, now = new Date()): LoveDuration {
  if (Number.isNaN(startDate.valueOf()) || now <= startDate) {
    return {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalDays: 0,
    };
  }

  const totalDays = Math.floor((now.valueOf() - startDate.valueOf()) / 86400000);

  let cursor = new Date(startDate);
  let years = 0;
  while (addYears(cursor, 1) <= now) {
    cursor = addYears(cursor, 1);
    years += 1;
  }

  let months = 0;
  while (addMonths(cursor, 1) <= now) {
    cursor = addMonths(cursor, 1);
    months += 1;
  }

  let days = 0;
  while (addDays(cursor, 1) <= now) {
    cursor = addDays(cursor, 1);
    days += 1;
  }

  const remainder = now.valueOf() - cursor.valueOf();
  const hours = Math.floor(remainder / 3600000);
  const minutes = Math.floor((remainder % 3600000) / 60000);
  const seconds = Math.floor((remainder % 60000) / 1000);

  return {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    totalDays,
  };
}
