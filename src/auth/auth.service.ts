import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthProvider, Role, User } from '@prisma/client';

import * as bcrypt from 'bcrypt';

import { PrismaService } from 'prisma/prisma.service';

import * as admin from 'firebase-admin';

import { MailerService } from '../mailer/mailer.service';

import { GoogleLoginDto } from './dto/google-login.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  private generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private getOtpExpiry() {
    return new Date(Date.now() + OTP_TTL_MS);
  }

  private async hashOtp(otp: string) {
    return bcrypt.hash(otp, 10);
  }

  private async verifyOtpHash(otp: string, otpHash: string) {
    return bcrypt.compare(otp, otpHash);
  }

  private formatUserResponse(user: User) {
    const { password: _password, ...safeUser } = user;
    return safeUser;
  }

  private signToken(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    if (dto.phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone: dto.phone },
      });
      if (existingPhone) {
        throw new ConflictException('User with this phone already exists');
      }
    }

    const otp = this.generateOtp();
    const expiresAt = this.getOtpExpiry();
    const otpHash = await this.hashOtp(otp);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    await this.prisma.pendingUser.upsert({
      where: { email: dto.email },
      create: {
        email: dto.email,
        password: hashedPassword,
        fullName: dto.fullName,
        phone: dto.phone,
        countryCode: dto.countryCode,
        role: dto.role,
        gender: dto.gender,
        age: dto.age,
        otpHash,
        expiresAt,
      },
      update: {
        password: hashedPassword,
        fullName: dto.fullName,
        phone: dto.phone,
        countryCode: dto.countryCode,
        role: dto.role,
        gender: dto.gender,
        age: dto.age,
        otpHash,
        expiresAt,
        attempts: 0,
      },
    });

    await this.mailerService.sendOtp(dto.email, otp);

    return { message: 'OTP sent to your email' };
  }

  async verifyOtp(email: string, otp: string) {
    const pending = await this.prisma.pendingUser.findUnique({
      where: { email },
    });

    if (!pending) {
      throw new BadRequestException('OTP not found or expired');
    }

    if (new Date() > pending.expiresAt) {
      await this.prisma.pendingUser.delete({ where: { email } });
      throw new BadRequestException('OTP expired');
    }

    if (pending.attempts >= MAX_OTP_ATTEMPTS) {
      await this.prisma.pendingUser.delete({ where: { email } });
      throw new BadRequestException(
        'Too many failed attempts. Request a new OTP.',
      );
    }

    const isValid = await this.verifyOtpHash(otp, pending.otpHash);
    if (!isValid) {
      await this.prisma.pendingUser.update({
        where: { email },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('Invalid OTP');
    }

    const newUser = await this.prisma.user.create({
      data: {
        email: pending.email,
        password: pending.password,
        fullName: pending.fullName,
        phone: pending.phone,
        countryCode: pending.countryCode,
        role: pending.role,
        gender: pending.gender,
        age: pending.age,
        isEmailVerified: true,
        provider: AuthProvider.EMAIL,
      },
    });

    await this.prisma.pendingUser.delete({ where: { email } });

    return {
      access_token: this.signToken(newUser),
      user: this.formatUserResponse(newUser),
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const otp = this.generateOtp();
    const expiresAt = this.getOtpExpiry();
    const otpHash = await this.hashOtp(otp);

    await this.prisma.passwordReset.upsert({
      where: { email },
      create: { email, otpHash, expiresAt },
      update: { otpHash, expiresAt, attempts: 0 },
    });

    await this.mailerService.sendOtp(email, otp);

    return { message: 'OTP sent to your email' };
  }

  async verifyResetOtp(email: string, otp: string) {
    await this.validatePasswordResetOtp(email, otp);
    return { message: 'OTP verified' };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    await this.validatePasswordResetOtp(email, otp);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    await this.prisma.passwordReset.delete({ where: { email } });

    return { message: 'Password reset successful' };
  }

  private async validatePasswordResetOtp(email: string, otp: string) {
    const reset = await this.prisma.passwordReset.findUnique({
      where: { email },
    });

    if (!reset) {
      throw new BadRequestException('OTP not found or expired');
    }

    if (new Date() > reset.expiresAt) {
      await this.prisma.passwordReset.delete({ where: { email } });
      throw new BadRequestException('OTP expired');
    }

    if (reset.attempts >= MAX_OTP_ATTEMPTS) {
      await this.prisma.passwordReset.delete({ where: { email } });
      throw new BadRequestException(
        'Too many failed attempts. Request a new OTP.',
      );
    }

    const isValid = await this.verifyOtpHash(otp, reset.otpHash);
    if (!isValid) {
      await this.prisma.passwordReset.update({
        where: { email },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('Invalid OTP');
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      access_token: this.signToken(user),
      user: this.formatUserResponse(user),
    };
  }

  async googleLogin(dto: GoogleLoginDto) {
    return this.handleSocialLogin(dto.idToken, dto.role);
  }

  private async handleSocialLogin(idToken: string, role?: Role) {
    let decoded: admin.auth.DecodedIdToken;

    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch {
      throw new UnauthorizedException('Invalid Google token');
    }

    const email = decoded.email;
    if (!email) {
      throw new UnauthorizedException('Email not available from Google');
    }

    const fullName = decoded.name ?? email.split('@')[0];
    const avatar = decoded.picture ?? null;
    const googleId = decoded.uid;

    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { googleId }],
      },
    });

    if (!user) {
      if (!role) {
        throw new BadRequestException(
          'Role is required for new Google sign-ups. Choose USER, STUDENT, or TEACHER.',
        );
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(
        `google:${googleId}:${salt}`,
        10,
      );

      user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          fullName,
          avatar,
          role,
          googleId,
          provider: AuthProvider.GOOGLE,
          isEmailVerified: decoded.email_verified ?? true,
        },
      });
    } else if (!user.googleId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId,
          provider: AuthProvider.GOOGLE,
          avatar: user.avatar ?? avatar,
          isEmailVerified: true,
        },
      });
    }

    return {
      access_token: this.signToken(user),
      user: this.formatUserResponse(user),
    };
  }
}
