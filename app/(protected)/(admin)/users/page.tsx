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
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
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
        body: JSON.stringify({ email, role, password, firstName, lastName }),
      });

      if (!response.ok) {
        const errorData = await response.json(); // Parse the response body
        throw new Error(errorData.message || `Failed to create the user. Status: ${response.status}`);
      }

      toast.success("User created!", "You have successfully created a new user.");
      setEmail("");
      setRole("");
      setPassword("");
      mutate(url);

    } catch (error: any) {
      toast.error("Error creating user", error.message);
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
                  <label className="block text-sm font-medium mb-2">First-Name</label>
                  <Input
                    value={firstName}
                    type='text'
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter First-Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last-Name</label>
                  <Input
                    value={lastName}
                    type='text'
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter Last-Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">E-Mail</label>
                  <Input
                    value={email}
                    type='email'
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter E-Mail"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type='password'
                    placeholder="Enter password"
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
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
          fields={["id", "email", "firstName", "lastName", "role"]}
          combineFieldsCallbacks={{}}
          fieldFormatter={{
            role: (role) => role.charAt(0).toUpperCase() + role.slice(1),
          }}
          labelFormatter={{
            firstName: () => "First Name",
            lastName: () => "Last Name",
          }}
          filters={false}
          showEditButton={true}
          entityButtonText="Edit"
        />

      </CardContent>
    </Card>
  );
}
