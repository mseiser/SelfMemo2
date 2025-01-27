import { User } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import IUserRepository from "./IUserRepository";
import { CreateUserDto, UpdateUserDto } from "@/lib/validations/user";

export class UserRepository extends BaseRepository implements IUserRepository {

    async create(user: CreateUserDto): Promise<User> {
        return await this.prisma.user.create({
            data: user,
        });
    }

    async update(user: UpdateUserDto): Promise<User> {
        return await this.prisma.user.update({
            where: {
                id: user.id,
            },
            data: user,
        });
    }

    async delete(id: string): Promise<User> {
        return await this.prisma.user.delete({
            where: {
                id: id,
            },
        });
    }

    async getById(id: string): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where: {
                id: id
            },
        });
    }

    async getAll(): Promise<User[]> {
        return await this.prisma.user.findMany();
    }

    async getWhere(where: any): Promise<User[]> {
        return await this.prisma.user.findMany({
            where: where
        });
    }

    async getByEmail(email: string): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where: {
                email: email,
            },/*
            select: {
                name: true,
                emailVerified: true,
            },*/
        });
    }

    async updatePassword(id: string, newPassword: string): Promise<User> {
        return await this.prisma.user.update({
            where: {
                id: id,
            },
            data: {
                password: newPassword,
            },
        });
    }

}