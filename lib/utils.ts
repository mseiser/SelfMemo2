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

export function isTimestampSetToCurrentMinute(timestamp: number) {
  const now = new Date();
  const currentMinute = now.getMinutes();

  const timestampDate = new Date(timestamp * 1000);
  const timestampMinute = timestampDate.getMinutes();

  return currentMinute === timestampMinute;
}


export function isTimeSetToCurrentTime(time: string) {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  const [inputHour, inputMinute] = time.split(':').map(Number);

  return inputHour === currentHour && inputMinute === currentMinute;
}

export function isTodaySetToTrue(dayObject: any) {
  const now = new Date();
  const currentDayIndex = now.getDay();

  const daysMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const currentDay = daysMap[currentDayIndex];

  return dayObject[currentDay] === true;
}

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}