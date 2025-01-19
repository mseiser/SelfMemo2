'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Reminder } from '@prisma/client';
import { useToast } from 'hooks/useToast';
import { useRouter } from 'next/navigation';
import { formatTimestampAsDate, formatTimestampAsDateTime } from '@/lib/utils';
import { Button } from '../button';

type ReminderFormDataType = {
  id: string;
  userId: string;
  name: string;
  description: string;
  type: string;
  config: string;
  isDisabled: boolean;
  lastSent: string | null;
  hasWarnings: boolean;
  warningNumber: number | null;
  warningInterval: string | null;
  warningIntervalNumber: number | null;
};

interface ReminderFormProps {
  reminder?: Reminder;
}

const defaultReminderValues: ReminderFormDataType = {
  id: '',
  userId: '',
  name: '',
  description: '',
  type: '',
  config: '{}',
  isDisabled: false,
  lastSent: null,
  hasWarnings: false,
  warningNumber: 1,
  warningInterval: 'minute',
  warningIntervalNumber: 1,
};

export default function ReminderForm({ reminder }: ReminderFormProps) {
  const toast = useToast();
  const router = useRouter();
  const [isUpdate, setIsUpdate] = useState(false);
  const [reminderFormData, setReminderFormData] = useState<ReminderFormDataType>(defaultReminderValues);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // check if we are updating a reminder or creating a new one
  useEffect(() => {
    if (reminder) {
      setIsUpdate(true);
      setReminderFormData(reminder);
      const config = JSON.parse(reminder.config);

      switch (reminder.type) {
        case 'one-time':
          setOneTimeTimestamp(formatTimestampAsDateTime(config.timestamp));
          break;
        case 'daily':
          setDailyTime(config.time as string);
          setDays(config.repeat);
          break;
        case 'weekly':
          setWeeklyDay(config.day as string);
          setWeeklyTime(config.time as string);
          break;
        case 'n-weekly':
          setNWeeklyWeeks(config.weeks);
          setNWeeklyDate(formatTimestampAsDate(config.date));
          setNWeeklyTime(config.time as string);
          break;
        case 'monthly':
          setMonthlyType(config.type as string);
          setMonthlyTime(config.time as string);
          setMonthlyDay(config.day);
          setMonthlyOrderNumber(config.orderNumber as string);
          setMonthlyWeekDay(config.weekDay as string);
          break;
        case 'yearly':
          setYearlyType(config.type as string);
          setYearlyMonth(config.month as string);
          setYearlyDay(config.day);
          setYearlyOrderNumber(config.orderNumber as string);
          setYearlyWeekDay(config.weekDay as string);
          setYearlyTime(config.time as string);
          break;
        case 'n-yearly':
          setNYearlyYears(config.years);
          setNYearlyType(config.type as string);
          setNYearlyMonth(config.month as string);
          setNYearlyDay(config.day);
          setNYearlyOrderNumber(config.orderNumber as string);
          setNYearlyWeekDay(config.weekDay as string);
          setNYearlyTime(config.time as string);
          break;
        default:
          break;
      };
    }
  }, [reminder]);

  // handle form input changes for basic fields (name, description, type)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReminderFormData((prev) => ({
      ...prev,
      [name]: (name === 'timestamp' || name === 'warningNumber' || name === 'warningIntervalNumber') ? Number(value) : value,
    }));
  };
  const handleWarningCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReminderFormData((prev) => ({
      ...prev,
      hasWarnings: event.target.checked,
    }));
  };

  const handleIsActiveCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    setReminderFormData((prev) => ({
      ...prev,
      isDisabled: !event.target.checked,
    }));

  }

  // handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      let newConfig = createNewConfig(reminderFormData.config, reminderFormData.type);

      const newFormData = {
        ...reminderFormData,
        config: JSON.stringify(newConfig),
      };

      if (isUpdate) {
        await axios.put(`/api/reminders/${reminderFormData.id ?? ''}`, newFormData);
        toast.success('Reminder updated!', 'You have successfully updated the reminder.');
      } else {
        await axios.post('/api/reminders', newFormData);
        toast.success('Reminder created!', 'You have successfully created a new reminder.');
      }
      router.push('/reminders');
    } catch (error) {
      console.error(error);

      if (isUpdate) {
        toast.error('Failed to update reminder.', 'An error occurred while updating the reminder.');
      } else {
        toast.error('Failed to create reminder.', 'An error occurred while creating the reminder.');
      }

    } finally {
      setIsSubmitting(false);
    }
  };

  // create new config (json properties of reminder type)
  const createNewConfig = (config: string, type: string): string => {
    try {
      let newConfig = JSON.parse(config);

      switch (type) {
        case 'one-time':
          newConfig.timestamp = new Date(oneTimeTimestamp).getTime() / 1000;
          break;
        case 'daily':
          newConfig.time = dailyTime;
          newConfig.repeat = days;
          break;
        case 'weekly':
          newConfig.time = weeklyTime;
          newConfig.day = weeklyDay;
          break;
        case 'n-weekly':
          newConfig.weeks = nWeeklyWeeks;
          newConfig.date = new Date(nWeeklyDate).getTime() / 1000;
          newConfig.time = nWeeklyTime;
          break;
        case 'monthly':
          newConfig.type = monthlyType;
          newConfig.time = monthlyTime;
          newConfig.day = monthlyDay;
          newConfig.orderNumber = monthlyOrderNumber;
          newConfig.weekDay = monthlyWeekDay;
          break;
        case 'yearly':
          newConfig.type = yearlyType;
          newConfig.month = yearlyMonth;
          newConfig.day = yearlyDay;
          newConfig.orderNumber = yearlyOrderNumber;
          newConfig.weekDay = yearlyWeekDay;
          newConfig.time = yearlyTime;
        case 'n-yearly':
          newConfig.years = nYearlyYears;
          newConfig.type = nYearlyType;
          newConfig.month = nYearlyMonth;
          newConfig.day = nYearlyDay;
          newConfig.orderNumber = nYearlyOrderNumber;
          newConfig.weekDay = nYearlyWeekDay;
          newConfig.time = nYearlyTime;
          break;
        default:
          break;
      }

      return newConfig;
    } catch {
      return config;
    }
  }

  /** ONE TIME PROPS */
  const [oneTimeTimestamp, setOneTimeTimestamp] = useState<string>(formatTimestampAsDateTime(Math.round(new Date().getTime() / 1000)));
  const handleOneTimeTimestampChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOneTimeTimestamp(e.target.value);
  };

  /** DAILY PROPS */
  const [dailyTime, setDailyTime] = useState<string>('00:00');
  const handleDailyTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDailyTime(e.target.value);
  };
  const [days, setDays] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true,
  });
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setDays((prevDays) => ({
      ...prevDays,
      [name]: checked,
    }));
  };

  /** WEEKLY PROPS */
  const [weeklyDay, setWeeklyDay] = useState<string>('monday');
  const handleWeeklyDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setWeeklyDay(e.target.value);
  };
  const [weeklyTime, setWeeklyTime] = useState<string>('00:00');
  const handleWeeklyTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWeeklyTime(e.target.value);
  };

  /** N-WEEKLY PROPS */
  const [nWeeklyWeeks, setNWeeklyWeeks] = useState<number>(1);
  const handleNWeeklyWeeksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNWeeklyWeeks(parseInt(e.target.value));
  };
  const [nWeeklyDate, setNWeeklyDate] = useState<string>(formatTimestampAsDate(Math.round(new Date().getTime() / 1000)));
  const handleNWeeklyDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNWeeklyDate(e.target.value);
  };
  const [nWeeklyTime, setNWeeklyTime] = useState<string>('00:00');
  const handleNWeeklyTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNWeeklyTime(e.target.value);
  };

  /** MONTHLY PROPS */
  const [monthlyType, setMonthlyType] = useState<string>('monthlyType1');
  const handleMonthlyTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonthlyType(e.target.value);
  };
  const [monthlyTime, setMonthlyTime] = useState<string>('00:00');
  const handleMonthlyTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonthlyTime(e.target.value);
  };
  const [monthlyDay, setMonthlyDay] = useState<number>(1);
  const handleMonthlyDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonthlyDay(parseInt(e.target.value));
  };
  const [monthlyOrderNumber, setMonthlyOrderNumber] = useState<string>('first');
  const handleMonthlyOrderNumberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMonthlyOrderNumber(e.target.value);
  };
  const [monthlyWeekDay, setMonthlyWeekDay] = useState<string>('monday');
  const handleMonthlyWeekDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMonthlyWeekDay(e.target.value);
  };

  /** YEARLY PROPS */
  const [yearlyType, setYearlyType] = useState<string>('yearlyType1');
  const handleYearlyTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYearlyType(e.target.value);
  };
  const [yearlyMonth, setYearlyMonth] = useState<string>('january');
  const handleYearlyMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setYearlyMonth(e.target.value);
  };
  const [yearlyDay, setYearlyDay] = useState<number>(1);
  const handleYearlyDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYearlyDay(parseInt(e.target.value));
  };
  const [yearlyOrderNumber, setYearlyOrderNumber] = useState<string>('first');
  const handleYearlyOrderNumberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setYearlyOrderNumber(e.target.value);
  };
  const [yearlyWeekDay, setYearlyWeekDay] = useState<string>('monday');
  const handleYearlyWeekDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setYearlyWeekDay(e.target.value);
  };
  const [yearlyTime, setYearlyTime] = useState<string>('00:00');
  const handleYearlyTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYearlyTime(e.target.value);
  };

  /** N-YEARLY PROPS */
  const [nYearlyYears, setNYearlyYears] = useState<number>(1);
  const handleNYearlyYearsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNYearlyYears(parseInt(e.target.value));
  };
  const [nYearlyType, setNYearlyType] = useState<string>('yearlyType1');
  const handleNYearlyTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNYearlyType(e.target.value);
  };
  const [nYearlyMonth, setNYearlyMonth] = useState<string>('january');
  const handleNYearlyMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNYearlyMonth(e.target.value);
  };
  const [nYearlyDay, setNYearlyDay] = useState<number>(1);
  const handleNYearlyDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNYearlyDay(parseInt(e.target.value));
  };
  const [nYearlyOrderNumber, setNYearlyOrderNumber] = useState<string>('first');
  const handleNYearlyOrderNumberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNYearlyOrderNumber(e.target.value);
  };
  const [nYearlyWeekDay, setNYearlyWeekDay] = useState<string>('monday');
  const handleNYearlyWeekDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNYearlyWeekDay(e.target.value);
  };
  const [nYearlyTime, setNYearlyTime] = useState<string>('00:00');
  const handleNYearlyTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNYearlyTime(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit}>

      {/* Name */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
          Name
        </label>
        <input
          required
          id="name"
          name="name"
          type="text"
          value={reminderFormData.name}
          onChange={handleChange}
          className={`w-full p-2 border rounded-lg ${formErrors.name ? 'border-red-500' : 'border-gray-300'
            }`}
        />
        {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          onChange={handleChange}
          value={reminderFormData.description}
          className={`w-full p-2 border rounded-lg ${formErrors.name ? 'border-red-500' : 'border-gray-300'
            }`}
        ></textarea>
        {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
      </div>

      {/* Type */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2" htmlFor="type">
          Type
        </label>
        <select
          required
          id="type"
          name="type"
          value={reminderFormData.type}
          onChange={handleChange}
          className={`w-full p-2 border rounded-lg ${formErrors.type ? 'border-red-500' : 'border-gray-300'
            }`}
        >
          <option></option>
          <option value="one-time">One-time</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="n-weekly">N-Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
          <option value="n-yearly">N-Yearly</option>
        </select>
      </div>

      {/* REMINDER TYPE */}
      <div className="p-4 pt-2">
        {reminderFormData.type === 'one-time' && (
          <div className="mb-4">
            <div className="my-2">This event occurs once at</div>
            <input onChange={handleOneTimeTimestampChange} value={oneTimeTimestamp} type="datetime-local" id="oneTimeDateTimestamp" name="oneTimeDateTimestamp" className={`w-full p-2 border rounded-lg ${formErrors.name ? 'border-red-500' : 'border-gray-300'
              }`} />
          </div>
        )}

        {reminderFormData.type === 'daily' && (
          <div className="mb-4">
            <div className="my-2">This event occurs daily at</div>
            <input onChange={handleDailyTimeChange} value={dailyTime} type="time" id="dailyTime" name="dailyTime" className={`w-full p-2 border rounded-lg ${formErrors.name ? 'border-red-500' : 'border-gray-300'
              }`} />
            <div className="my-2">and should be repeated on:</div>
            <div className="flex items-center space-x-4">
              {Object.entries(days).map(([day, isChecked]) => (
                <div key={day}>
                  <label>
                    <input
                      className="mr-2"
                      type="checkbox"
                      name={day}
                      checked={isChecked}
                      onChange={handleCheckboxChange}
                    />
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {reminderFormData.type === 'weekly' && (
          <div className="mb-4">
            <div className="my-2">This event occurs every</div>
            <select
              id="weeklyDay"
              name="weeklyDay"
              value={weeklyDay}
              onChange={handleWeeklyDayChange}
              className={`w-full p-2 border rounded-lg ${formErrors.type ? 'border-red-500' : 'border-gray-300'
                }`}
            >
              <option value="monday">Monday</option>
              <option value="tuesday">Tuesday</option>
              <option value="wednesday">Wednesday</option>
              <option value="thursday">Thursday</option>
              <option value="friday">Friday</option>
              <option value="saturday">Saturday</option>
              <option value="sunday">Sunday</option>
            </select>
            <div className="my-2">at</div>
            <input onChange={handleWeeklyTimeChange} value={weeklyTime} type="time" id="weeklyTime" name="weeklyTime" className={`w-full p-2 border rounded-lg ${formErrors.name ? 'border-red-500' : 'border-gray-300'
              }`} />
          </div>
        )}

        {reminderFormData.type === 'n-weekly' && (
          <div className="mb-4">
            <div className="my-2">This event occurs every</div>
            <input onChange={handleNWeeklyWeeksChange} value={nWeeklyWeeks} type="number" min="1" id="nWeeklyWeeks" name="nWeeklyWeeks" className={`w-full p-2 border rounded-lg ${formErrors.name ? 'border-red-500' : 'border-gray-300'
              }`} />
            <div className="my-2">week(s), starting</div>
            <input onChange={handleNWeeklyDateChange} value={nWeeklyDate} type="date" id="nWeeklyDate" name="nWeeklyDate" className={`w-full p-2 border rounded-lg ${formErrors.name ? 'border-red-500' : 'border-gray-300'
              }`} />
            <div className="my-2">at</div>
            <input onChange={handleNWeeklyTimeChange} value={nWeeklyTime} type="time" id="nWeeklyTime" name="nWeeklyTime" className={`w-full p-2 border rounded-lg ${formErrors.name ? 'border-red-500' : 'border-gray-300'
              }`} />
          </div>
        )}

        {reminderFormData.type === 'monthly' && (
          <div className="mb-4">
            <div className="my-2">This event occurs at</div>
            <input onChange={handleMonthlyTimeChange} value={monthlyTime} type="time" id="monthlyTime" name="monthlyTime" className={`w-full p-2 border rounded-lg ${formErrors.name ? 'border-red-500' : 'border-gray-300'
              }`} />
            <div className="flex items-center my-2">
              <input
                checked={monthlyType === "monthlyType1"}
                onChange={handleMonthlyTypeChange}
                value="monthlyType1"
                id="monthlyType1" name="monthlyType" type="radio" className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden" />
              <label htmlFor="monthlyType1" className="ml-3 text-sm/6 font-medium text-gray-900 flex items-center">
                <span>on the</span>
                <input onChange={handleMonthlyDayChange} value={monthlyDay} type="number" min="1" max="31" id="monthlyDay" name="monthlyDay" className={`w-14 p-2 mx-2 border rounded-lg ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`} />
                <span>day of every month.</span>
              </label>
            </div>
            <div className="flex items-center">
              <input
                checked={monthlyType === "monthlyType2"}
                onChange={handleMonthlyTypeChange}
                value="monthlyType2"
                id="monthlyType2" name="monthlyType" type="radio" className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden" />
              <label htmlFor="monthlyType2" className="ml-3 text-sm/6 font-medium text-gray-900 flex items-center">
                <span>on the</span>
                <select
                  id="monthlyOrderNumber"
                  name="monthlyOrderNumber"
                  value={monthlyOrderNumber}
                  onChange={handleMonthlyOrderNumberChange}
                  className={`mx-2 p-2 border rounded-lg ${formErrors.type ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="first">first</option>
                  <option value="second">second</option>
                  <option value="third">third</option>
                  <option value="fourth">fourth</option>
                </select>
                <select
                  id="monthlyWeekDay"
                  name="monthlyWeekDay"
                  value={monthlyWeekDay}
                  onChange={handleMonthlyWeekDayChange}
                  className={`mx-2 p-2 border rounded-lg ${formErrors.type ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="monday">Monday</option>
                  <option value="tuesday">Tuesday</option>
                  <option value="wednesday">Wednesday</option>
                  <option value="thursday">Thursday</option>
                  <option value="friday">Friday</option>
                  <option value="saturday">Saturday</option>
                  <option value="sunday">Sunday</option>
                </select>
                <span>of every month.</span>
              </label>
            </div>
          </div>
        )}

        {reminderFormData.type === 'yearly' && (
          <div className="mb-4">
            <div className="my-2">This event occurs every</div>
            <select
              id="yearlyMonth"
              name="yearlyMonth"
              value={yearlyMonth}
              onChange={handleYearlyMonthChange}
              className={`p-2 border rounded-lg ${formErrors.type ? 'border-red-500' : 'border-gray-300'
                }`}
            >
              <option value="january">January</option>
              <option value="february">February</option>
              <option value="march">March</option>
              <option value="april">April</option>
              <option value="may">May</option>
              <option value="june">June</option>
              <option value="july">July</option>
              <option value="august">August</option>
              <option value="september">September</option>
              <option value="october">October</option>
              <option value="november">November</option>
              <option value="december">December</option>
            </select>
            <div className="flex items-center my-2">
              <input
                checked={yearlyType === "yearlyType1"}
                onChange={handleYearlyTypeChange}
                value="yearlyType1"
                id="yearlyType1" name="yearlyType" type="radio" className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden" />
              <label htmlFor="yearlyType1" className="ml-3 text-sm/6 font-medium text-gray-900 flex items-center">
                <span>on the</span>
                <input onChange={handleYearlyDayChange} value={yearlyDay} type="number" min="1" max="31" id="yearlyDay" name="yearlyDay" className={`w-[50px] p-2 mx-2 border rounded-lg ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`} />
                <span>day of the month.</span>
              </label>
            </div>
            <div className="flex items-center">
              <input
                checked={yearlyType === "yearlyType2"}
                onChange={handleYearlyTypeChange}
                value="yearlyType2"
                id="yearlyType2" name="yearlyType" type="radio" className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden" />
              <label htmlFor="yearlyType2" className="ml-3 text-sm/6 font-medium text-gray-900 flex items-center">
                <span>on the</span>
                <select
                  id="yearlyOrderNumber"
                  name="yearlyOrderNumber"
                  value={yearlyOrderNumber}
                  onChange={handleYearlyOrderNumberChange}
                  className={`mx-2 p-2 border rounded-lg ${formErrors.type ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="first">first</option>
                  <option value="second">second</option>
                  <option value="third">third</option>
                  <option value="fourth">fourth</option>
                </select>
                <select
                  id="yearlyWeekDay"
                  name="yearlyWeekDay"
                  value={yearlyWeekDay}
                  onChange={handleYearlyWeekDayChange}
                  className={`mx-2 p-2 border rounded-lg ${formErrors.type ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="monday">Monday</option>
                  <option value="tuesday">Tuesday</option>
                  <option value="wednesday">Wednesday</option>
                  <option value="thursday">Thursday</option>
                  <option value="friday">Friday</option>
                  <option value="saturday">Saturday</option>
                  <option value="sunday">Sunday</option>
                </select>
                <span>of the month</span>
              </label>
            </div>
            <div className="my-2">at</div>
            <input onChange={handleYearlyTimeChange} value={yearlyTime} type="time" id="yearlyTime" name="yearlyTime" className={`w-full p-2 border rounded-lg ${formErrors.name ? 'border-red-500' : 'border-gray-300'
              }`} />
          </div>
        )}

        {reminderFormData.type === 'n-yearly' && (
          <div className="mb-4">
            <div className="my-2">This event occurs every</div>
            <input onChange={handleNYearlyYearsChange} value={nYearlyYears} type="number" min="1" id="nYearlyYears" name="nYearlyYears" className={`w-full p-2 border rounded-lg ${formErrors.nYearlyYears ? 'border-red-500' : 'border-gray-300'
              }`} />
            <div className="my-2">year(s), every</div>
            <select
              id="nYearlyMonth"
              name="nYearlyMonth"
              value={nYearlyMonth}
              onChange={handleNYearlyMonthChange}
              className={`p-2 border rounded-lg ${formErrors.nYearlyMonth ? 'border-red-500' : 'border-gray-300'
                }`}
            >
              <option value="january">January</option>
              <option value="february">February</option>
              <option value="march">March</option>
              <option value="april">April</option>
              <option value="may">May</option>
              <option value="june">June</option>
              <option value="july">July</option>
              <option value="august">August</option>
              <option value="september">September</option>
              <option value="october">October</option>
              <option value="november">November</option>
              <option value="december">December</option>
            </select>
            <div className="flex items-center my-2">
              <input
                checked={nYearlyType === "yearlyType1"}
                onChange={handleNYearlyTypeChange}
                value="yearlyType1"
                id="nYearlyType1" name="nYearlyType" type="radio" className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden" />
              <label htmlFor="nYearlyType1" className="ml-3 text-sm/6 font-medium text-gray-900 flex items-center">
                <span>on the</span>
                <input onChange={handleNYearlyDayChange} value={nYearlyDay} type="number" min="1" max="31" id="nYearlyDay" name="nYearlyDay" className={`w-[50px] p-2 mx-2 border rounded-lg ${formErrors.nYearlyDay ? 'border-red-500' : 'border-gray-300'}`} />
                <span>day of the month.</span>
              </label>
            </div>
            <div className="flex items-center">
              <input
                checked={nYearlyType === "yearlyType2"}
                onChange={handleNYearlyTypeChange}
                value="yearlyType2"
                id="nYearlyType2" name="yearlyType" type="radio" className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden" />
              <label htmlFor="nYearlyType2" className="ml-3 text-sm/6 font-medium text-gray-900 flex items-center">
                <span>on the</span>
                <select
                  id="nYearlyOrderNumber"
                  name="nYearlyOrderNumber"
                  value={nYearlyOrderNumber}
                  onChange={handleNYearlyOrderNumberChange}
                  className={`mx-2 p-2 border rounded-lg ${formErrors.type ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="first">first</option>
                  <option value="second">second</option>
                  <option value="third">third</option>
                  <option value="fourth">fourth</option>
                </select>
                <select
                  id="nYearlyWeekDay"
                  name="nYearlyWeekDay"
                  value={nYearlyWeekDay}
                  onChange={handleNYearlyWeekDayChange}
                  className={`mx-2 p-2 border rounded-lg ${formErrors.type ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="monday">Monday</option>
                  <option value="tuesday">Tuesday</option>
                  <option value="wednesday">Wednesday</option>
                  <option value="thursday">Thursday</option>
                  <option value="friday">Friday</option>
                  <option value="saturday">Saturday</option>
                  <option value="sunday">Sunday</option>
                </select>
                <span>of the month</span>
              </label>
            </div>
            <div className="my-2">at</div>
            <input onChange={handleNYearlyTimeChange} value={nYearlyTime} type="time" id="nYearlyTime" name="nYearlyTime" className={`w-full p-2 border rounded-lg ${formErrors.nYearlyTime ? 'border-red-500' : 'border-gray-300'
              }`} />
          </div>
        )}
      </div>

      {/* Warnings */}
      <div className="mb-5">
        <input
          className=""
          type="checkbox"
          name="hasWarnings"
          id="hasWarnings"
          checked={reminderFormData.hasWarnings}
          onChange={handleWarningCheckboxChange}
        /> <label htmlFor="hasWarnings">Enable Warning Reminders</label>
        {reminderFormData.hasWarnings && (
          <div className="mb-4">
            Additionally, before sending the final reminder, send me
            <input onChange={handleChange} value={reminderFormData.warningNumber ?? undefined} id="warningNumber" name="warningNumber" type="number" className="mx-2 w-14 p-2 border rounded-lg" />
            reminder(s)
            <input onChange={handleChange} value={reminderFormData.warningIntervalNumber ?? undefined} id="warningIntervalNumber" name="warningIntervalNumber" type="number" className="mx-2 w-14 p-2 border rounded-lg" />
            <select
              id="warningInterval"
              name="warningInterval"
              value={reminderFormData.warningInterval ?? undefined}
              onChange={handleChange}
              className={`mx-2 p-2 border rounded-lg ${formErrors.warningInterval ? 'border-red-500' : 'border-gray-300'
                }`}
            >
              <option></option>
              {reminderFormData.type === 'one-time' && (
                <>
                  <option value="minute">Minute(s)</option>
                  <option value="hour">Hour(s)</option>
                  <option value="day">Day(s)</option>
                  <option value="week">Week(s)</option>
                  <option value="month">Month(s)</option>
                  <option value="year">Year(s)</option>
                </>
              )}
              {reminderFormData.type === 'daily' && (
                <>
                  <option value="minute">Minute(s)</option>
                  <option value="hour">Hour(s)</option>
                </>
              )}
              {(reminderFormData.type === 'weekly' || reminderFormData.type === 'n-weekly') && (
                <>
                  <option value="minute">Minute(s)</option>
                  <option value="day">Day(s)</option>
                  <option value="hour">Hour(s)</option>
                </>
              )}
              {reminderFormData.type === 'monthly' && (
                <>
                  <option value="minute">Minute(s)</option>
                  <option value="hour">Hour(s)</option>
                  <option value="day">Day(s)</option>
                  <option value="week">Week(s)</option>
                </>
              )}
              {reminderFormData.type === 'yearly' && (
                <>
                  <option value="minute">Minute(s)</option>
                  <option value="hour">Hour(s)</option>
                  <option value="day">Day(s)</option>
                  <option value="week">Week(s)</option>
                  <option value="month">Month(s)</option>
                </>
              )}
              {reminderFormData.type === 'n-yearly' && (
                <>
                  <option value="minute">Minute(s)</option>
                  <option value="hour">Hour(s)</option>
                  <option value="day">Day(s)</option>
                  <option value="week">Week(s)</option>
                  <option value="month">Month(s)</option>
                </>
              )}
            </select>
            apart.
          </div>
        )}
      </div>
      <div className="mb-4">
        <input
          type="checkbox"
          name="isDisabled"
          id="isDisabled"
          checked={!reminderFormData.isDisabled}
          onChange={handleIsActiveCheckboxChange}
        /> <label htmlFor="hasWarnings">Is active</label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className=" disabled:bg-gray-300"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Sending...' : (isUpdate ? 'Update Reminder' : 'Create Reminder')}
      </Button>
    </form>
  );
};
