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

  const handleCreateUser = async () => {
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
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>Manage all of your users.</CardDescription>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="mt-4">Create User</Button>
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
              </div>
              <div>
                <label className="block text-sm font-medium">Password:</label>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type='password'
                  placeholder="Enter user role"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Role:</label>
                <Input
                  value={role}
                  type='text'
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Enter user role"
                />
              </div>
            </div>
            <SheetFooter>
              <Button onClick={handleCreateUser} className="mr-2">
                Submit
              </Button>
              <SheetClose asChild>
                <Button variant="secondary">Cancel</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </CardHeader>
      <CardContent>

        <DynamicList
          data={data || []}
          entity="users"
          mutateKey={url}
          fields={["id", "email", "role"]}
          combineFieldsCallbacks={{}}
          fieldFormatter={{}}
          labelFormatter={{}}
          filters={false}
          showEditButton={false}
          entityButtonText="Edit"
        />

      </CardContent>
    </Card>
  );
}
