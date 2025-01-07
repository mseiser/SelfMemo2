"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useToast } from 'hooks/useToast';
import { useApiSwr } from 'hooks/useApiSwr';
import { User } from '@prisma/client';
import DynamicList from '@/components/ui/DynamicList';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from '@/components/ui/input';
import { mutate } from 'swr';

export default function UsersPage() {

  const url = "/api/users";

  const toast = useToast();

  const { data, error, isLoading } = useApiSwr<User[]>(url);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; role?: string }>({});

  const validateFields = () => {
    const newErrors: { email?: string; password?: string; role?: string } = {};

    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      newErrors.email = "Invalid email format.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (!role) {
      newErrors.role = "Role is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleCreateUser = async () => {
    if (!validateFields()) return;

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, password }),
      });

      if (!response.ok) {
        throw new Error("Failed to create user");
      }

      toast.success("User created!", "You have successfully created a new user.");
      setEmail("");
      setRole("");
      setPassword("");
      mutate(url);

    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Error creating user", "An error occurred while creating the user.");
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between flex-row">
        <div>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage all of your users.</CardDescription>
        </div>
        <div>
          <Sheet>
            <SheetTrigger asChild>
              <Button >Create User</Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Create User</SheetTitle>
                <SheetDescription>
                  Enter the details of the new user below.
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium">Email:</label>
                  <Input
                    value={email}
                    type='email'
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter user email"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium">Password:</label>
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type='password'
                    placeholder="Enter user role"
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium">Role:</label>

                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md"
                  >
                    <option value="" disabled>
                      Select a role
                    </option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                  {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
                </div>
              </div>
              <SheetFooter className='mt-4'>
                <Button onClick={handleCreateUser} className="mr-2">
                  Submit
                </Button>
                <SheetClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </CardHeader>
      <CardContent>

        <DynamicList
          data={data || []}
          entity="users"
          mutateKey={url}
          fields={["id", "email", "role"]}
          combineFieldsCallbacks={{}}
          fieldFormatter={{
            role: (role) => role.charAt(0).toUpperCase() + role.slice(1),
          }}
          labelFormatter={{}}
          filters={false}
          showEditButton={false}
          entityButtonText="Edit"
        />

      </CardContent>
    </Card>
  );
}
