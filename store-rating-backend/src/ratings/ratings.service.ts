import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './entities/rating.entity';
import { Store } from '../stores/entities/store.entity';
import { CreateRatingDto, UpdateRatingDto } from './dto/rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
  ) {}

  async create(userId: string, dto: CreateRatingDto) {
    const store = await this.storeRepository.findOne({
      where: { id: dto.storeId },
    });
    if (!store) throw new NotFoundException('Store not found');

    const existing = await this.ratingRepository.findOne({
      where: { user: { id: userId }, store: { id: dto.storeId } },
    });
    if (existing) throw new ConflictException('You have already rated this store');

    const rating = this.ratingRepository.create({
      value: dto.value,
      user: { id: userId },
      store: { id: dto.storeId },
    });
    return this.ratingRepository.save(rating);
  }

  async update(userId: string, storeId: string, dto: UpdateRatingDto) {
    const rating = await this.ratingRepository.findOne({
      where: { user: { id: userId }, store: { id: storeId } },
    });
    if (!rating) throw new NotFoundException('Rating not found');

    rating.value = dto.value;
    return this.ratingRepository.save(rating);
  }
}
