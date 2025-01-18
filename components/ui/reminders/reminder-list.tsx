'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Reminder } from '@prisma/client';
import { capitalizeWords } from '@/lib/utils';

const ReminderList: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const response = await axios.get('/api/reminders');
        setReminders(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch reminders');
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, []);

  if (loading) {
    return <div className="text-center py-4 text-lg font-semibold">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500 font-semibold">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {reminders.length === 0 ? (
        <div className="text-center text-gray-500">No reminders found.</div>
      ) : (
        <ul className="space-y-4">
          {reminders.map((reminder) => (
            <li
              key={reminder.id}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition duration-200 bg-white flex justify-between items-center"
            >
              <div>
                <div className="text-lg font-semibold">{reminder.name}</div>
                <div className="text-gray-500">
                  <p>Type: {capitalizeWords(reminder.type)}</p>
                </div>
              </div>
              <div>
                <a href={`/reminders/${reminder.id}`} className="rounded bg-indigo-600 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Edit</a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReminderList;
