import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { CreateStoreDto, StoreFilterDto } from './dto/store.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(dto: CreateStoreDto) {
    const store = this.storeRepository.create({
      name: dto.name,
      email: dto.email,
      address: dto.address,
    });
    if (dto.ownerId) {
      const owner = await this.userRepository.findOne({ where: { id: dto.ownerId } });
      if (owner) store.owner = owner;
    }
    return this.storeRepository.save(store);
  }

  async findAll(filters: StoreFilterDto, userId?: string) {
    const query = this.storeRepository
      .createQueryBuilder('store')
      .leftJoin('store.ratings', 'rating')
      .addSelect('COALESCE(AVG(rating.value), 0)', 'averageRating')
      .groupBy('store.id');

    if (userId) {
      query.addSelect(
        (sub) =>
          sub
            .select('r.value')
            .from('ratings', 'r')
            .where('r.userId = :uid AND r.storeId = store.id', { uid: userId }),
        'userRating',
      );
    }

    if (filters.name) {
      query.andWhere('store.name ILIKE :name', { name: `%${filters.name}%` });
    }
    if (filters.address) {
      query.andWhere('store.address ILIKE :address', { address: `%${filters.address}%` });
    }
    if (filters.email) {
      query.andWhere('store.email ILIKE :email', { email: `%${filters.email}%` });
    }

    const allowedSort = ['name', 'email', 'address', 'createdAt'];
    const sortField = allowedSort.includes(filters.sortBy ?? '')
      ? `store.${filters.sortBy}`
      : 'store.createdAt';
    const sortOrder = filters.sortOrder || 'DESC';
    query.orderBy(sortField, sortOrder as 'ASC' | 'DESC');

    const raw = await query.getRawAndEntities();

    return raw.entities.map((store, i) => ({
      ...store,
      averageRating: parseFloat(raw.raw[i]?.averageRating) || 0,
      userRating: raw.raw[i]?.userRating ?? null,
    }));
  }

  async findOne(id: string) {
    const store = await this.storeRepository.findOne({
      where: { id },
      relations: ['ratings', 'ratings.user', 'owner'],
    });
    if (!store) throw new NotFoundException('Store not found');
    return store;
  }

  async getStoreOwnerDashboard(ownerId: string) {
    const store = await this.storeRepository
      .createQueryBuilder('store')
      .leftJoinAndSelect('store.owner', 'owner')
      .leftJoinAndSelect('store.ratings', 'rating')
      .leftJoinAndSelect('rating.user', 'ratingUser')
      .where('owner.id = :ownerId', { ownerId })
      .getOne();

    if (!store) throw new NotFoundException('No store found for this owner');

    const averageRating =
      store.ratings.length > 0
        ? store.ratings.reduce((sum, r) => sum + r.value, 0) / store.ratings.length
        : 0;

    const raters = store.ratings.map((r) => ({
      userId: r.user.id,
      name: r.user.name,
      email: r.user.email,
      rating: r.value,
      ratedAt: r.updatedAt,
    }));

    return {
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
      },
      averageRating: Math.round(averageRating * 100) / 100,
      totalRatings: store.ratings.length,
      raters,
    };
  }
}
