'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { z } from 'zod';
import { CreateReminderSchema, UpdateReminderSchema } from '@/lib/validations/reminder';
import { Reminder } from '@prisma/client';
import { redirect } from 'next/dist/server/api-utils';

type ReminderFormInputs = {
  id: string;
  userId: string;
  name: string;
  description: string;
  type: string;
  config: string;
  isDisabled: boolean;
  belongsTo: string | null;
};

interface ReminderFormProps {
  reminder?: Reminder;
}

const defaultReminderValues: ReminderFormInputs = {
  id: '',
  userId: '',
  name: '',
  description: '',
  type: 'one-time',
  config: '{}',
  isDisabled: false,
  belongsTo: null,
};

export default function ReminderForm({ reminder }: ReminderFormProps) {
  const [isUpdate, setIsUpdate] = useState(false);
  const [formData, setFormData] = useState<ReminderFormInputs>(defaultReminderValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
    const yyyy = date.getFullYear();
    const MM = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
  
    return `${yyyy}-${MM}-${dd}T${hh}:${mm}`; // Format as yyyy-MM-ddThh:mm
  };

  const [oneTimeTimestamp, setOneTimeTimestamp] = useState<string>(formatDate(Math.round(new Date().getTime() / 1000)));
  const handleOneTimeTimestampChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOneTimeTimestamp(e.target.value);
  };

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

  useEffect(() => {
    if (reminder) {
      setIsUpdate(true);
      setFormData(reminder);

      switch(reminder.type) {
        case 'one-time':
          setOneTimeTimestamp(formatDate(JSON.parse(reminder.config).timestamp));
          break;
        case 'daily':
          setDailyTime(JSON.parse(reminder.config).time as string);
          setDays(JSON.parse(reminder.config).repeat);
          break;
        default:
          break;
      };
    }
  }, [reminder]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'timestamp' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {

      let newConfig = createNewConfig(formData.config, formData.type);

      const newFormData = {
        ...formData,
        config: JSON.stringify(newConfig),
      };
      
      if (isUpdate) {
        await axios.put(`/api/reminders/${formData.id ?? ''}`, newFormData);
        alert('Reminder updated successfully!');
      } else {
        await axios.post('/api/reminders', newFormData);
        alert('Reminder created successfully!');
      }
    } catch (error) {
      console.error(error);

      if (isUpdate) {
        alert('Failed to update reminder.');
      } else {
        alert('Failed to create reminder.');
      }
      
    } finally {
      setIsSubmitting(false);
    }
  };

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
      }

      return newConfig;
    } catch {
      return config;
    }
  }

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
          value={formData.name}
          onChange={handleChange}
          className={`w-full p-2 border rounded-lg ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
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
          value={formData.description}
          className={`w-full p-2 border rounded-lg ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
        ></textarea>
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* Type */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2" htmlFor="type">
          Type
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className={`w-full p-2 border rounded-lg ${
            errors.type ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="one-time">One-time</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {formData.type === 'one-time' && (
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="oneTimeDateTimestamp">
            One-Time
          </label>
          <input onChange={handleOneTimeTimestampChange} value={oneTimeTimestamp} type="datetime-local" id="oneTimeDateTimestamp" name="oneTimeDateTimestamp" className={`w-full p-2 border rounded-lg ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`} />
        </div>
      )}
      {formData.type === 'daily' && (
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="dailyTime">
            Daily
          </label>
          <input onChange={handleDailyTimeChange} value={dailyTime} type="time" id="dailyTime" name="dailyTime" className={`w-full p-2 border rounded-lg ${
            errors.name ? 'border-red-500' : 'border-gray-300'
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
