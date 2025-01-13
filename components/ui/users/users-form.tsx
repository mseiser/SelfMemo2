'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User } from '@prisma/client';
import { useToast } from 'hooks/useToast';
import { useRouter } from 'next/navigation';
import { formatTimestampAsDate, formatTimestampAsDateTime } from '@/lib/utils';

type UserFormDataType = {
  id: string;
  email: string;
  password: string;
  role: string;
  firstName: string;
  lastName: string;
}

interface UserFormProps {
  user?: User;
}

const defaultUserValues: UserFormDataType = {
  id: '',
  email: '',
  password: '',
  role: '',
  firstName: '',
  lastName: '',
};

export default function UserForm({ user }: UserFormProps) {
  const toast = useToast();
  const router = useRouter();
  const [isUpdate, setIsUpdate] = useState(false);
  const [userFormData, setUserFormData] = useState<UserFormDataType>(defaultUserValues);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setIsUpdate(true);
      setUserFormData(user as UserFormDataType);
    }
  }, [user]);

  // handle form input changes for basic fields (name, description, type)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserFormData((prev) => ({
      ...prev,
      [name]: name === 'timestamp' || name === 'warningNumber' || name === 'warningIntervalNumber' ? Number(value) : value,
    }));
  };
  const handleWarningCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserFormData((prev) => ({
      ...prev,
      hasWarnings: event.target.checked,
    }));
  };

  // handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      const newFormData = {
        ...userFormData,
      };

      if (isUpdate) {
        await axios.put(`/api/users/${userFormData.id ?? ''}`, newFormData);
        toast.success('User updated!', 'You have successfully updated the user.');
      } else {
        await axios.post('/api/users', newFormData);
        toast.success('User created!', 'You have successfully created a new user.');
      }
      router.push('/users');
    } catch (error) {
      console.error(error);

      if (isUpdate) {
        toast.error('Failed to update user.', 'An error occurred while updating the user.');
      } else {
        toast.error('Failed to create user.', 'An error occurred while creating the user.');
      }

    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <form onSubmit={handleSubmit}>

      {/* FirstName */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
          First Name
        </label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          value={userFormData.firstName}
          onChange={handleChange}
          className={`w-full p-2 border rounded-lg ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
        />
        {formErrors.firstName && <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>}
      </div>

      {/* SurName */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
          Last Name
        </label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          value={userFormData.lastName}
          onChange={handleChange}
          className={`w-full p-2 border rounded-lg ${formErrors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
        />
        {formErrors.lastName && <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>}
      </div>

      {/* Email */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={userFormData.email}
          onChange={handleChange}
          className={`w-full p-2 border rounded-lg ${formErrors.email ? 'border-red-500' : 'border-gray-300'
            }`}
        />
        {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
      </div>

      {/* Role */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
          Role
        </label>
        <select
          id="role"
          name="role"
          value={userFormData.role}
          onChange={handleChange}
          className={`w-full p-2 border rounded-lg ${formErrors.role ? 'border-red-500' : 'border-gray-300'
            }`}
        >
          <option value="" disabled>
            Select a role
          </option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        {formErrors.role && <p className="text-red-500 text-sm mt-1">{formErrors.role}</p>}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-300"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Sending...' : (isUpdate ? 'Update User' : 'Create User')}
      </button>
    </form>
  );
};
