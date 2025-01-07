import { prisma } from "@/lib/db";
import { CreateReminderDto, UpdateReminderDto } from "@/lib/validations/reminder";
import { Reminder } from "@prisma/client";
import IReminderRepository from "repositories/IReminderRepository";
import { ReminderRepository } from "repositories/ReminderRepository";
import nodemailer from 'nodemailer';
import { UserService } from "./UserService";

export class ReminderService {
    private static instance: ReminderService;
    private reminderRepository: IReminderRepository;

    private constructor() {
        this.reminderRepository = new ReminderRepository();
    }

    public static getInstance(): ReminderService {
        if (!ReminderService.instance) {
            ReminderService.instance = new ReminderService();
        }

        return ReminderService.instance;
    }

    async createReminder(reminder: CreateReminderDto) {
        return await this.reminderRepository.create(reminder);
    }

    async updateReminder(reminder: UpdateReminderDto) {
        return await this.reminderRepository.update(reminder);
    }

    async getAll() {
        return await this.reminderRepository.getAll();
    }

    async getAllByUserId(userId: string) {
        return await this.reminderRepository.getAllByUserId(userId);
    }

    async getSingleWithChildReminders(reminderId: string) {
        const reminderWithChildren = await prisma.reminder.findUnique({
            where: { id: reminderId },
            include: {
              childReminders: true,
            },
        });

        return reminderWithChildren;
    }

    async triggerReminder(reminder: Reminder) {
        console.log(`Triggering reminder: ${reminder.id}`);

        var smtpTransport = nodemailer.createTransport({
            host: "mail.smtp2go.com",
            port: 465,
            secure: true,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
        });

        const userService = UserService.getInstance();
        const user = await userService.getUserById(reminder.userId);
          
        smtpTransport.sendMail({
            from: "dev@weisl.cc",
            to: user?.email,
            subject: "SelfMemo Reminder: " + reminder.name,
            text: reminder.description,
        },
            function (error, response) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Message sent: " + response);
                }
            }
        );
    }

    // async registerUser(user: CreateUserDto) {
    //     //check if user already exists
    //     const existingUser = await this.getUserByEmail(user.email);
    //     if (existingUser) {
    //         throw new Error('User already exists');
    //     }

    //     // Hash the user's password
    //     const hashedPassword = await bcrypt.hash(user.password, 10);

    //     // Create the new user
    //     const newUser = {
    //         ...user,
    //         password: hashedPassword, // Use hashed password
    //     };


    //     return await this.ReminderRepository.create(newUser);
    // }

    // async getAllUsers() {
    //     return await this.ReminderRepository.getAll();
    // }

    // async deleteUser(userID: string) {
    //     return await this.ReminderRepository.delete(userID);
    // }

    // async getUserById(userID: string) {
    //     try {
    //         const user = await this.ReminderRepository.getById(userID);

    //         return user;
    //     } catch {
    //         return null;
    //     }
    // }

    // async getUserByEmail(email: string) {
    //     try {
    //         const user = await this.ReminderRepository.getByEmail(email);

    //         return user;
    //     } catch {
    //         return null;
    //     }
    // }

    // async createDefaultAdminUser() {

    //     if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    //         throw new Error('ADMIN_EMAIL, ADMIN_NAME, and ADMIN_PASSWORD must be set in the environment variables');
    //     }

    //     const adminUser: CreateUserDto = {
    //         email: process.env.ADMIN_EMAIL,
    //         password: process.env.ADMIN_PASSWORD,
    //         role: 'admin',
    //     };

    //     return await this.registerUser(adminUser);
    // }
}