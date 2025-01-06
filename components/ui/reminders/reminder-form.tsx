'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { z } from 'zod';
import { CreateReminderSchema } from '@/lib/validations/reminder';
import { Reminder } from '@prisma/client';

type ReminderFormInputs = z.infer<typeof CreateReminderSchema>;

interface ReminderFormProps {
  reminder?: Reminder;
}

const defaultReminderValues = {
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

  useEffect(() => {
    if (reminder) {
      setIsUpdate(true);
      setFormData({
        userId: reminder.userId,
        name: reminder.name || defaultReminderValues.name,
        description: reminder.description || defaultReminderValues.description,
        type: reminder.type || defaultReminderValues.type,
        config: reminder.config || defaultReminderValues.config,
        isDisabled: reminder.isDisabled || defaultReminderValues.isDisabled,
        belongsTo: reminder.belongsTo || null,
      });

      switch(formData.type) {
        case 'one-time':
          setOneTimeTimestamp(formatDate(JSON.parse(reminder.config).timestamp));
          break;
        case 'daily':
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
    // if (!validateForm()) return;

    setIsSubmitting(true);
    try {

      let newConfig = createNewConfig(formData.config, formData.type);

      const newFormData = {
        ...formData,
        config: JSON.stringify(newConfig),
      };

      await axios.put('/api/reminders', newFormData);
      alert('Reminder created successfully!');
      setFormData(defaultReminderValues);
    } catch (error) {
      console.error(error);
      alert('Failed to create reminder.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const createNewConfig = (config: string, type: string): string => {
    try {
      let newConfig = JSON.parse(config);

      switch(type) {
        case 'one-time':
          newConfig.timestamp = new Date((document.getElementById('oneTimeDateTimestamp') as HTMLInputElement).value).getTime() / 1000;
          break;
        case 'daily':
          newConfig.time = (document.getElementById('dailyTime') as HTMLInputElement).value;
          newConfig.repeat = {
            monday: (document.getElementById('repeatMonday') as HTMLInputElement).checked,
            tuesday: (document.getElementById('repeatTuesday') as HTMLInputElement).checked,
            wednesday: (document.getElementById('repeatWednesday') as HTMLInputElement).checked,
            thursday: (document.getElementById('repeatThursday') as HTMLInputElement).checked,
            friday: (document.getElementById('repeatFriday') as HTMLInputElement).checked,
            saturday: (document.getElementById('repeatSaturday') as HTMLInputElement).checked,
            sunday: (document.getElementById('repeatSunday') as HTMLInputElement).checked,
          };
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
          <input value={JSON.parse(formData.config).time} type="time" id="dailyTime" name="dailyTime" className={`w-full p-2 border rounded-lg ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`} />
          <p className="mt-2">Repeat:</p>
          <p>
            <input type="checkbox" id="repeatMonday" name="repeatMonday" defaultChecked /> Monday
            <input type="checkbox" id="repeatTuesday" name="repeatTuesday" className="ml-2" defaultChecked /> Tuesday
            <input type="checkbox" id="repeatWednesday" name="repeatWednesday" className="ml-2" defaultChecked /> Wednesday
            <input type="checkbox" id="repeatThursday" name="repeatThursday" className="ml-2" defaultChecked /> Thursday
            <input type="checkbox" id="repeatFriday" name="repeatFriday" className="ml-2" defaultChecked /> Friday
            <input type="checkbox" id="repeatSaturday" name="repeatSaturday" className="ml-2" defaultChecked /> Saturday
            <input type="checkbox" id="repeatSunday" name="repeatSunday" className="ml-2" defaultChecked /> Sunday
          </p>
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
