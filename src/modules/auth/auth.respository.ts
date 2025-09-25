import { AppDataSource } from '../../config/db.config';
import { User } from '../../entities/user.entities';
import { MoreThan } from 'typeorm';

export class authRepository {
    private repo = AppDataSource.getRepository(User);
    
    async findByEmail(email: string): Promise<User | null> {
        return await this.repo.findOne({ where: { email} });
    }

    async createUser(userData: Partial<User>): Promise<User> {
        const user = AppDataSource.getRepository(User).create(userData);
        return await AppDataSource.getRepository(User).save(user);
    }

    async findByResetToken(token: string): Promise<User | null> {
        return await this.repo.findOne({ where: { resetToken: token } });
    }

    async findByValidResetToken(token: string, now: Date): Promise<User | null> {
        return await this.repo.findOne({ where: { resetToken: token, resetTokenExpiry: MoreThan(now) } });
    }

    async save(user: User): Promise<User> {
        return await this.repo.save(user);
    }
}