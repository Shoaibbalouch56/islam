import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

const PLAN_BY_ROLE: Record<Role, string> = {
  USER: 'Free',
  STUDENT: 'Student',
  TEACHER: 'Teacher',
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) return null;
    const { password: _password, ...result } = user;
    return result;
  }

  async getProfile(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password: _password, ...safeUser } = user;
    return {
      ...safeUser,
      plan: PLAN_BY_ROLE[user.role],
      joinedAt: user.createdAt,
    };
  }

  async deleteAccount(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.prisma.user.delete({ where: { id } });
    return { message: 'Account deleted successfully' };
  }

  async updateProfile(id: number, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.phone && dto.phone !== user.phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone: dto.phone },
      });
      if (existingPhone) {
        throw new ConflictException('Phone number already in use');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: dto,
    });

    const { password: _password, ...result } = updated;
    return result;
  }
}
