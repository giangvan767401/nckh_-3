
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { UpdateProfileDto } from '../shared/dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findMe(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    // Remove sensitive data
    const { passwordHash, ...result } = user;
    return result as User;
  }

  async updateMe(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Only update name and avatarUrl
    if (dto.name) user.name = dto.name;
    if (dto.avatarUrl) user.avatarUrl = dto.avatarUrl;

    const updated = await this.userRepository.save(user);
    const { passwordHash, ...result } = updated;
    return result as User;
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    
    const { passwordHash, ...result } = user;
    return result as User;
  }
}
