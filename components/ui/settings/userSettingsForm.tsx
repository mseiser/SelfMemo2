"use client";
import { User } from '@prisma/client';
import { FC, useState } from 'react';
import { UpdateUserDto } from '@/lib/validations/user';
import { useToast } from 'hooks/useToast';
import { Button } from '../button';
import { UpdateUserPasswordDto } from '@/lib/validations/user';

interface INFUserSettingsFormProps {
    user: User;
}

type INFUpdateUserPasswordDto = Omit<UpdateUserPasswordDto, 'id'>;


const UserSettingsForm: FC<INFUserSettingsFormProps> = ({ user }) => {

    const [updateUser, setUpdateUser] = useState<UpdateUserDto>({ ...user, role: user.role as "user" | "admin" });
    const [updateUserPassword, setUpdateUserPassword] = useState<INFUpdateUserPasswordDto>({ currentPassword: '', newPassword: '' });
    const [secondUserPassword, setSecondUserPassword] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const toast = useToast();


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setUpdateUser((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'secondPassword') {
            setSecondUserPassword(value);
            return;
        }

        setUpdateUserPassword((prev) => ({
            ...prev,
            [name]: value,
        }));
    }


    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/users/${updateUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateUser),
            });

            if (!response.ok) {
                const errorData = await response.json(); // Parse the response body
                throw new Error(errorData.message || `An error occurred: ${response.status}`);
            }

            toast.success('Settings updated!', 'You have successfully updated the user settings.');

        } catch (error: any) {
            console.error(error);
            toast.error('An error occurred while saving user settings', error.message);
        }
    }

    const checkForPasswordErrors = () => {

        if (updateUserPassword.currentPassword === '' || updateUserPassword.newPassword === '' || secondUserPassword === '') {
            setPasswordError('Please fill all the fields');
            return true
        }

        if (updateUserPassword.newPassword !== secondUserPassword) {
            setPasswordError('Passwords do not match');
            return true;
        }

        if (updateUserPassword.newPassword.length < 4) {
            setPasswordError('Password must be at least 4 characters long');
            return true;
        }

        setPasswordError(null);
        return false;
    }

    const onSubmitPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (checkForPasswordErrors()) return;

        try {
            const response = await fetch(`/api/users/${updateUser.id}/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateUserPassword),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `An error occurred: ${response.status}`);
            }

            toast.success('Password updated!', 'You have successfully updated your password.');

        } catch (error: any) {
            console.error(error);
            toast.error('An error occurred while saving user password', error.message);
        }
    }

    return (
        <div>
            <form onSubmit={onSubmit}>
                <div className="space-y-12  border-b border-gray-900/10 pb-12">
                    <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
                        <div>
                            <h2 className="text-base/7 font-semibold text-gray-900">Personal Information</h2>
                            <p className="mt-1 text-sm/6 text-gray-600">Use a permanent address where you can receive mail.</p>
                        </div>

                        <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
                            <div className="sm:col-span-3">
                                <label htmlFor="firstName" className="block text-sm/6 font-medium text-gray-900">
                                    First name
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="firsName"
                                        name="firstName"
                                        type="text"
                                        value={updateUser.firstName || ''}
                                        onChange={handleChange}
                                        autoComplete="given-name"
                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="lastName" className="block text-sm/6 font-medium text-gray-900">
                                    Last name
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        value={updateUser.lastName || ''}
                                        onChange={handleChange}
                                        type="text"
                                        autoComplete="family-name"
                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-6">
                                <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                                    Email address
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={updateUser.email || ''}
                                        onChange={handleChange}
                                        autoComplete="email"
                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <Button type="submit">
                            Save
                        </Button>
                    </div>
                </div>


            </form>
            <form onSubmit={onSubmitPassword} >
                <div className="space-y-12 mt-12">
                    <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
                        <div>
                            <h2 className="text-base/7 font-semibold text-gray-900">Change Password</h2>
                            <p className="mt-1 text-sm/6 text-gray-600">Update your password associated with your account.</p>
                        </div>

                        <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
                            <div className="sm:col-span-6">
                                <label htmlFor="currentPassword" className="block text-sm/6 font-medium text-gray-900">
                                    Current Password
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="currentPassword"
                                        name="currentPassword"
                                        type="password"
                                        value={updateUserPassword.currentPassword}
                                        onChange={handleChangePassword}
                                        autoComplete="password"
                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                    />
                                </div>
                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="newPassword" className="block text-sm/6 font-medium text-gray-900">
                                    New Password
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="newPassword"
                                        name="newPassword"
                                        type="password"
                                        value={updateUserPassword.newPassword}
                                        onChange={handleChangePassword}
                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                    />
                                </div>
                            </div>
                            <div className="sm:col-span-3">
                                <label htmlFor="secondPassword" className="block text-sm/6 font-medium text-gray-900">
                                    Confirm New Password
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="secondPassword"
                                        name="secondPassword"
                                        type="password"
                                        value={secondUserPassword}
                                        onChange={handleChangePassword}
                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                    />
                                </div>

                            </div>

                            {passwordError && <div className="sm:col-span-6"><p className="text-red-500 text-sm mt-1">{passwordError}</p></div>}


                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <Button type="submit">
                        Save
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default UserSettingsForm;