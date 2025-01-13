import { CreateUserDto, UpdateUserDto } from "@/lib/validations/user";
import IUserRepository from "repositories/IUserRepository";
import { UserRepository } from "repositories/UserRepository";
import bcrypt from "bcryptjs";

export class UserService {
    private static instance: UserService;

    private userRepository: IUserRepository;

    private constructor() {
        this.userRepository = new UserRepository();
    }

    public static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }

        return UserService.instance;
    }

    async registerUser(user: CreateUserDto) {

        //check if user already exists
        const existingUser = await this.getUserByEmail(user.email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        // Hash the user's password
        const hashedPassword = await bcrypt.hash(user.password, 10);

        // Create the new user
        const newUser = {
            ...user,
            password: hashedPassword, // Use hashed password
        };

        return await this.userRepository.create(newUser);
    }

    async getAllUsers() {
        return await this.userRepository.getAll();
    }

    async deleteUser(userID: string) {
        return await this.userRepository.delete(userID);
    }

    async getUserById(userID: string) {
        try {
            const user = await this.userRepository.getById(userID);

            return user;
        } catch {
            return null;
        }
    }

    async getUserByEmail(email: string) {
        try {
            const user = await this.userRepository.getByEmail(email);

            return user;
        } catch {
            return null;
        }
    }

    async updateUser(user: UpdateUserDto) {
        return await this.userRepository.update(user);
    }

    async createDefaultAdminUser() {

        if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
            throw new Error('ADMIN_EMAIL, ADMIN_NAME, and ADMIN_PASSWORD must be set in the environment variables');
        }

        const adminUser: CreateUserDto = {
            firstName: 'Admin',
            lastName: 'User',
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            role: 'admin',
        };

        return await this.registerUser(adminUser);
    }
}