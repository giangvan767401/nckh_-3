
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConflictException } from '@nestjs/common';

// Fix: Declaring global test functions for environment compatibility
declare var describe: any;
declare var it: any;
declare var expect: any;
declare var beforeEach: any;
declare var jest: any;

describe('AuthService', () => {
  let service: AuthService;
  let repo: any;

  const mockUser = {
    id: '1',
    email: 'test@student.com',
    passwordHash: 'hashed',
    role: UserRole.STUDENT,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockReturnValue(mockUser),
            save: jest.fn().mockResolvedValue(mockUser),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    repo = module.get(getRepositoryToken(User));
  });

  it('should register a new user', async () => {
    const result = await service.register({
      name: 'Test',
      email: 'test@student.com',
      password: 'password123',
      role: UserRole.STUDENT,
    });
    expect(result.user.email).toEqual('test@student.com');
    expect(result.access_token).toBeDefined();
  });

  it('should throw conflict error if email exists', async () => {
    repo.findOne.mockResolvedValue(mockUser);
    await expect(service.register({
      name: 'Test',
      email: 'test@student.com',
      password: 'password123',
      role: UserRole.STUDENT,
    })).rejects.toThrow(ConflictException);
  });
});
