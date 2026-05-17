import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto, UserFilterDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto) {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({ ...dto, password: hashed });
    await this.userRepository.save(user);
    const { password, ...result } = user;
    return result;
  }

  async findAll(filters: UserFilterDto) {
    const query = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.address',
        'user.role',
        'user.createdAt',
      ]);

    if (filters.name) {
      query.andWhere('user.name ILIKE :name', { name: `%${filters.name}%` });
    }
    if (filters.email) {
      query.andWhere('user.email ILIKE :email', { email: `%${filters.email}%` });
    }
    if (filters.address) {
      query.andWhere('user.address ILIKE :address', { address: `%${filters.address}%` });
    }
    if (filters.role) {
      query.andWhere('user.role = :role', { role: filters.role });
    }

    const allowedSort = ['name', 'email', 'address', 'role', 'createdAt'];
    const sortField = allowedSort.includes(filters.sortBy ?? '')
      ? `user.${filters.sortBy}`
      : 'user.createdAt';
    const sortOrder = filters.sortOrder || 'DESC';
    query.orderBy(sortField, sortOrder as 'ASC' | 'DESC');

    return query.getMany();
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['ownedStore', 'ratings', 'ratings.store'],
    });
    if (!user) throw new NotFoundException('User not found');
    const { password, ...result } = user;
    return result;
  }

  async getDashboardStats() {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.manager.getRepository('stores').count(),
      this.userRepository.manager.getRepository('ratings').count(),
    ]);
    return { totalUsers, totalStores, totalRatings };
  }
}
