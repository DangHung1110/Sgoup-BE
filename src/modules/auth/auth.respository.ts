import { AppDataSource } from '../../config/db.config';
import { User } from '../../entities/user.entities';

export class authRepository {
    private repo = AppDataSource.getRepository(User);
    
    async findByEmail(email: string): Promise<User | null> {
        return await this.repo.findOne({ where: { email} });
    }

    async createUser(userData: Partial<User>): Promise<User> {
        const user = AppDataSource.getRepository(User).create(userData);
        return await AppDataSource.getRepository(User).save(user);
    }
}