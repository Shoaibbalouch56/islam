import { BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { MailerService } from '../mailer/mailer.service';
import { PrismaService } from 'prisma/prisma.service';
import { Role } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    pendingUser: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    passwordReset: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mailerMock = {
    sendOtp: jest.fn().mockResolvedValue(undefined),
  };

  const jwtMock = {
    sign: jest.fn().mockReturnValue('test-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: MailerService, useValue: mailerMock },
        { provide: JwtService, useValue: jwtMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should reject duplicate email', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 1, email: 'a@b.com' });

      await expect(
        service.register({
          email: 'a@b.com',
          password: 'pass123',
          confirmPassword: 'pass123',
          fullName: 'Test User',
          role: Role.USER,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should store pending user in database and send OTP', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.pendingUser.upsert.mockResolvedValue({ id: 1 });

      const result = await service.register({
        email: 'new@b.com',
        password: 'pass123',
        confirmPassword: 'pass123',
        fullName: 'New User',
        role: Role.STUDENT,
        countryCode: '+92',
        phone: '3001234567',
        gender: 'MALE',
        age: 25,
      });

      expect(result.message).toBe('OTP sent to your email');
      expect(prismaMock.pendingUser.upsert).toHaveBeenCalled();
      expect(mailerMock.sendOtp).toHaveBeenCalledWith(
        'new@b.com',
        expect.any(String),
      );
    });
  });

  describe('verifyOtp', () => {
    it('should reject invalid OTP', async () => {
      prismaMock.pendingUser.findUnique.mockResolvedValue({
        email: 'new@b.com',
        otpHash: '$2b$10$invalidhashvalue',
        expiresAt: new Date(Date.now() + 60000),
        attempts: 0,
        password: 'hash',
        fullName: 'New User',
        role: Role.USER,
      });

      await expect(
        service.verifyOtp('new@b.com', '000000'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('forgotPassword', () => {
    it('should reject unknown user', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.forgotPassword('missing@b.com')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should upsert password reset record', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 1, email: 'a@b.com' });
      prismaMock.passwordReset.upsert.mockResolvedValue({ id: 1 });

      const result = await service.forgotPassword('a@b.com');

      expect(result.message).toBe('OTP sent to your email');
      expect(prismaMock.passwordReset.upsert).toHaveBeenCalled();
    });
  });
});
