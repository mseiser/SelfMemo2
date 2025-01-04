import { prisma } from "@/lib/db";
import { PrismaClient } from "@prisma/client";

export class BaseRepository {
    protected prisma: PrismaClient;
    constructor() {
        this.prisma = prisma;
    }
}