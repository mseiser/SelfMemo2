'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Reminder } from '@prisma/client';
import { useToast } from 'hooks/useToast';
import { useRouter } from 'next/navigation';
import { formatTimestampAsDate, formatTimestampAsDateTime } from '@/lib/utils';

type ReminderFormDataType = {
  id: string;
  userId: string;
  name: string;
  description: string;
  type: string;
  config: string;
  isDisabled: boolean;
  belongsTo: string | null;
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
  type: 'one-time',
  config: '{}',
  isDisabled: false,
  belongsTo: null,
  lastSent: null,
  hasWarnings: false,
  warningNumber: null,
  warningInterval: null,
  warningIntervalNumber: null,
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

      switch(reminder.type) {
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
      
      console.log(newFormData);
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

      switch(type) {
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

  /** WARNING PROPS */
  // const [warningInterval, setWarningInterval] = useState<string>('minutes');
  // const handleWarningIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setWarningInterval(e.target.value);
  // };
  // const [warningNumber, setWarningNumber] = useState<number>(1);
  // const handleWarningNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setWarningNumber(parseInt(e.target.value));
  // };
  // const [warningIntervalNumber, setWarningIntervalNumber] = useState<number>(1);
  // const handleWarningIntervalNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setWarningIntervalNumber(parseInt(e.target.value));
  // };

  return (
    <form onSubmit={handleSubmit}>

      {/* Name */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={reminderFormData.name}
          onChange={handleChange}
          className={`w-full p-2 border rounded-lg ${
            formErrors.name ? 'border-red-500' : 'border-gray-300'
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
          className={`w-full p-2 border rounded-lg ${
            formErrors.name ? 'border-red-500' : 'border-gray-300'
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
          id="type"
          name="type"
          value={reminderFormData.type}
          onChange={handleChange}
          className={`w-full p-2 border rounded-lg ${
            formErrors.type ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="one-time">One-time</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="n-weekly">N-Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
      
      {/* REMINDER TYPE */}
      {reminderFormData.type === 'one-time' && (
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="oneTimeDateTimestamp">
            One-Time
          </label>
          <input onChange={handleOneTimeTimestampChange} value={oneTimeTimestamp} type="datetime-local" id="oneTimeDateTimestamp" name="oneTimeDateTimestamp" className={`w-full p-2 border rounded-lg ${
            formErrors.name ? 'border-red-500' : 'border-gray-300'
          }`} />
        </div>
      )}
      {reminderFormData.type === 'daily' && (
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="dailyTime">
            Daily
          </label>
          <input onChange={handleDailyTimeChange} value={dailyTime} type="time" id="dailyTime" name="dailyTime" className={`w-full p-2 border rounded-lg ${
            formErrors.name ? 'border-red-500' : 'border-gray-300'
          }`} />
          <p className="mt-2">Repeat:</p>
          <div>
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
          <label className="block text-gray-700 font-medium mb-2" htmlFor="weeklyDay">
            Weekly
          </label>
          This event occurs every
          <select
            id="weeklyDay"
            name="weeklyDay"
            value={weeklyDay}
            onChange={handleWeeklyDayChange}
            className={`w-full p-2 border rounded-lg ${
              formErrors.type ? 'border-red-500' : 'border-gray-300'
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
          at
          <input onChange={handleWeeklyTimeChange} value={weeklyTime} type="time" id="weeklyTime" name="weeklyTime" className={`w-full p-2 border rounded-lg ${
            formErrors.name ? 'border-red-500' : 'border-gray-300'
          }`} />
        </div>
      )}
      {reminderFormData.type === 'n-weekly' && (
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="weeklyDay">
            N-Weekly
          </label>
          This event occurs every
          <input onChange={handleNWeeklyWeeksChange} value={nWeeklyWeeks} type="number" min="1" id="nWeeklyWeeks" name="nWeeklyWeeks" className={`w-full p-2 border rounded-lg ${
            formErrors.name ? 'border-red-500' : 'border-gray-300'
          }`} />
          weeks starting 
          <input onChange={handleNWeeklyDateChange} value={nWeeklyDate} type="date" id="nWeeklyDate" name="nWeeklyDate" className={`w-full p-2 border rounded-lg ${
            formErrors.name ? 'border-red-500' : 'border-gray-300'
          }`} />
          at
          <input onChange={handleNWeeklyTimeChange} value={nWeeklyTime} type="time" id="nWeeklyTime" name="nWeeklyTime" className={`w-full p-2 border rounded-lg ${
            formErrors.name ? 'border-red-500' : 'border-gray-300'
          }`} />
        </div>
      )}
      {reminderFormData.type === 'monthly' && (
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="weeklyDay">
            Monthly
          </label>
          This event occurs at
          <input onChange={handleMonthlyTimeChange} value={monthlyTime} type="time" id="monthlyTime" name="monthlyTime" className={`w-full p-2 border rounded-lg ${
            formErrors.name ? 'border-red-500' : 'border-gray-300'
          }`} />
          <div className="flex items-center">
            <input
              checked={monthlyType === "monthlyType1"}
              onChange={handleMonthlyTypeChange}
              value="monthlyType1"
              id="monthlyType1" name="monthlyType" type="radio" className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden" />
            <label htmlFor="monthlyType1" className="ml-3 text-sm/6 font-medium text-gray-900 flex items-center">
              <span>on the</span>
              <input onChange={handleMonthlyDayChange} value={monthlyDay} type="number" min="1" max="31" id="monthlyDay" name="monthlyDay" className={`w-[50px] p-2 mx-2 border rounded-lg ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`} />
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
                className={`mx-2 p-2 border rounded-lg ${
                  formErrors.type ? 'border-red-500' : 'border-gray-300'
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
                className={`mx-2 p-2 border rounded-lg ${
                  formErrors.type ? 'border-red-500' : 'border-gray-300'
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
          <label className="block text-gray-700 font-medium mb-2" htmlFor="weeklyDay">
            Yearly
          </label>
          This event occurs every
          <select
            id="yearlyMonth"
            name="yearlyMonth"
            value={yearlyMonth}
            onChange={handleYearlyMonthChange}
            className={`mx-2 p-2 border rounded-lg ${
              formErrors.type ? 'border-red-500' : 'border-gray-300'
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
          <div className="flex items-center">
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
                className={`mx-2 p-2 border rounded-lg ${
                  formErrors.type ? 'border-red-500' : 'border-gray-300'
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
                className={`mx-2 p-2 border rounded-lg ${
                  formErrors.type ? 'border-red-500' : 'border-gray-300'
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
          at
          <input onChange={handleYearlyTimeChange} value={yearlyTime} type="time" id="yearlyTime" name="yearlyTime" className={`w-full p-2 border rounded-lg ${
            formErrors.name ? 'border-red-500' : 'border-gray-300'
          }`} />     
        </div>
      )}

      {/* Warnings */}
      <input
        className="mb-4"
        type="checkbox"
        name="hasWarnings"
        id="hasWarnings"
        checked={reminderFormData.hasWarnings}
        onChange={handleWarningCheckboxChange}
      /> <label htmlFor="hasWarnings">Enable Warning Reminders</label>
      {reminderFormData.hasWarnings && (
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="type">
            Warning Reminders
          </label>
          Additionally, before sending the final reminder, send me
          <input onChange={handleChange} value={reminderFormData.warningNumber ?? undefined} id="warningNumber" name="warningNumber" type="number" className="mx-2 w-12 p-2 border rounded-lg" />
          reminder(s)
          <input onChange={handleChange} value={reminderFormData.warningIntervalNumber ?? undefined} id="warningIntervalNumber" name="warningIntervalNumber" type="number" className="mx-2 w-12 p-2 border rounded-lg" />
          <select
            id="warningInterval"
            name="warningInterval"
            value={reminderFormData.warningInterval ?? undefined}
            onChange={handleChange}
            className={`mx-2 p-2 border rounded-lg ${
              formErrors.warningInterval ? 'border-red-500' : 'border-gray-300'
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
          </select>
          apart.
        </div>
      )}
      

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-300"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Sending...' : (isUpdate ? 'Update Reminder' : 'Create Reminder')}
      </button>
    </form>
  );
};
