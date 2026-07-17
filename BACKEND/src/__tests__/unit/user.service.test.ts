import { UserService } from '../../services/user.service';
import { UserRepository } from '../../repositories/user.repository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../../config/email';

jest.mock('../../repositories/user.repository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../config/email');

const MockUserRepository = UserRepository as jest.MockedClass<typeof UserRepository>;

describe('UserService Unit Tests (5 cases)', () => {
  let userService: UserService;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      findByEmail: jest.fn(),
      findByEmailWithPasswordResetFields: jest.fn(),
      createUser: jest.fn(),
      findById: jest.fn(),
      updateUser: jest.fn(),
    };
    // Make the UserRepository constructor return our mock instance
    MockUserRepository.mockImplementation(() => mockRepo);
    userService = new UserService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('register - success', async () => {
    mockRepo.findByEmail.mockResolvedValue(null);
    mockRepo.createUser.mockResolvedValue({
      fullName: 'Test User',
      email: 'test@example.com',
      phoneNumber: '+123456',
    });
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPwd');

    const result = await userService.register({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'plainPwd',
      phoneNumber: '+123456',
    });

    expect(mockRepo.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(bcrypt.hash).toHaveBeenCalledWith('plainPwd', 10);
    expect(mockRepo.createUser).toHaveBeenCalledWith({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'hashedPwd',
      phoneNumber: '+123456',
    });
    expect(result.message).toBe('Registration successful');
  });

  test('register - duplicate email throws', async () => {
    mockRepo.findByEmail.mockResolvedValue({ email: 'test@example.com' });
    await expect(
      userService.register({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'plainPwd',
        phoneNumber: '+123456',
      })
    ).rejects.toThrow('Email already registered');
  });

  test('login - success returns token', async () => {
    const user = { _id: 'uid', email: 'test@example.com', password: '$2a$10$hashedPwd' };
    mockRepo.findByEmail.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue('jwtToken');

    const result = await userService.login({ email: 'test@example.com', password: 'plainPwd' });
    expect(bcrypt.compare).toHaveBeenCalledWith('plainPwd', '$2a$10$hashedPwd');
    expect(jwt.sign).toHaveBeenCalled();
    expect(result.token).toBe('jwtToken');
  });

  test('login - wrong password throws', async () => {
    const user = { _id: 'uid', email: 'test@example.com', password: '$2a$10$hashedPwd' };
    mockRepo.findByEmail.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(userService.login({ email: 'test@example.com', password: 'badPwd' })).rejects.toThrow();
  });

  test('requestPasswordReset - sends email when eligible', async () => {
    const user = {
      email: 'test@example.com',
      password: 'hashedPwd',
      resetPasswordRequestCount: 0,
      resetPasswordRequestWindowStartedAt: undefined,
    };
    mockRepo.findByEmailWithPasswordResetFields.mockResolvedValue(user);
    (bcrypt.hash as jest.Mock).mockResolvedValue('codeHash');
    (sendEmail as jest.Mock).mockResolvedValue(undefined);

    await userService.requestPasswordReset('test@example.com');
    expect(sendEmail).toHaveBeenCalled();
    expect(mockRepo.findByEmailWithPasswordResetFields).toHaveBeenCalledWith('test@example.com');
  });
});
