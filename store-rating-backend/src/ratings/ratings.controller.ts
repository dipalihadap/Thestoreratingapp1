import {
  Controller,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto, UpdateRatingDto } from './dto/rating.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('ratings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.NORMAL_USER)
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateRatingDto) {
    return this.ratingsService.create(req.user.id, dto);
  }

  @Patch(':storeId')
  update(
    @Request() req,
    @Param('storeId') storeId: string,
    @Body() dto: UpdateRatingDto,
  ) {
    return this.ratingsService.update(req.user.id, storeId, dto);
  }
}
