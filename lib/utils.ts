import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalizeWords(str: string) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('-');
};

export function isCurrentYear(timestamp: number) {
  const now = new Date();
  const currentYear = now.getFullYear();

  const timestampDate = new Date(timestamp * 1000);
  const timestampYear = timestampDate.getFullYear();

  return currentYear === timestampYear;
}

export function isCurrentMonth(timestamp: number) {
  const now = new Date();
  const currentMonth = now.getMonth();

  const timestampDate = new Date(timestamp * 1000);
  const timestampMonth = timestampDate.getMonth();

  return currentMonth === timestampMonth;
}

export function isCurrentDay(timestamp: number) {
  const now = new Date();
  const currentDay = now.getDate();

  const timestampDate = new Date(timestamp * 1000);
  const timestampDay = timestampDate.getDate();

  return currentDay === timestampDay;
}

export function isCurrentHour(timestamp: number) {
  const now = new Date();
  const currentHour = now.getHours();

  const timestampDate = new Date(timestamp * 1000);
  const timestampHour = timestampDate.getHours();

  return currentHour === timestampHour;
}

export function isCurrentMinute(timestamp: number) {
  const now = new Date();
  const currentMinute = now.getMinutes();

  const timestampDate = new Date(timestamp * 1000);
  const timestampMinute = timestampDate.getMinutes();

  return currentMinute === timestampMinute;
}

export function addDaysToTimestamp(timestamp: number, days: number) {
  const date = new Date(timestamp * 1000);
  date.setDate(date.getDate() + days);

  return date.getTime() / 1000;
}

export function isTimestampSetToCurrentMinute(timestamp: number) {
  const now = new Date();
  const currentMinute = now.getMinutes();

  const timestampDate = new Date(timestamp * 1000);
  const timestampMinute = timestampDate.getMinutes();

  return currentMinute === timestampMinute;
}

export function isDayNumberToday(dayNumber: number) {
  const now = new Date();
  const currentDay = now.getDate();

  return currentDay === dayNumber;
}

export function isNthWeekdayOfMonth(orderNumber: keyof typeof orderMap, weekDay: keyof typeof weekDayMap) {
  const orderMap = {
    first: 1,
    second: 2,
    third: 3,
    fourth: 4,
  };

  const weekDayMap = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  if (!(orderNumber in orderMap) || !(weekDay in weekDayMap)) {
    throw new Error("Invalid input for orderNumber or weekDay");
  }

  const today = new Date();
  const targetWeekday = weekDayMap[weekDay];
  const targetOrder = orderMap[orderNumber];

  if (today.getDay() !== targetWeekday) {
    return false;
  }

  let weekdayCount = 0;
  for (let day = 1; day <= today.getDate(); day++) {
    const currentDate = new Date(today.getFullYear(), today.getMonth(), day);

    if (currentDate.getDay() === targetWeekday) {
      weekdayCount++;
    }

    if (day === today.getDate()) {
      break;
    }
  }

  return weekdayCount === targetOrder;
}

export function isTimeSetToCurrentTime(time: string) {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  const [inputHour, inputMinute] = time.split(':').map(Number);

  return inputHour === currentHour && inputMinute === currentMinute;
}

export function isTodaySetToTrue(repeatDaysObject: any) {
  const now = new Date();
  const currentDayIndex = now.getDay();

  const daysMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const currentDay = daysMap[currentDayIndex];

  return repeatDaysObject[currentDay] === true;
}

export function isTodayWeekDay(weekDay: string) {
  const now = new Date();
  const currentDayIndex = now.getDay();

  const daysMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const currentDay = daysMap[currentDayIndex];

  return weekDay === currentDay;
}

export function isNowGreaterThanDate(timestamp: number) {
  const now = new Date();
  const currentTimestamp = now.getTime() / 1000;

  return currentTimestamp > timestamp;
}

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const formatTimestampAsDateTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
  const yyyy = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');

  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`; // Format as yyyy-MM-ddThh:mm
};

export const formatTimestampAsDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
  const yyyy = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const dd = String(date.getDate()).padStart(2, '0');

  return `${yyyy}-${MM}-${dd}`; // Format as yyyy-MM-dd
};
