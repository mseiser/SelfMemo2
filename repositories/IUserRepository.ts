import { CreateUserDto } from "@/lib/validations/user";
import { User } from "@prisma/client";

export default interface IUserRepository {
    create(entity: CreateUserDto): Promise<User>;
    update(entity: User): Promise<User>;
    delete(id: string): Promise<User>;
    getById(id: string): Promise<User | null>;
    getAll(): Promise<User[]>;
    getByEmail(email: string): Promise<User | null>;
}