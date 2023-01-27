import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DataSource, Repository } from 'typeorm';
import * as request from 'supertest';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});

const GRAPHQL_ENDPOINT = '/graphql';

const testUser = {
  EMAIL: 'song@jihun.com',
  PASSWORD: '12345',
};

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let jwtToken: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    await app.init();
  });

  afterAll(async () => {
    const dataSource = new DataSource({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'songjihun',
      password: '12345',
      database: 'nuber-eats-test',
    });
    await dataSource.initialize();
    await dataSource.dropDatabase();
    await dataSource.destroy();
    app.close();
  });

  describe('createAccount', () => {
    it('should create account', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation {
          createAccount(input: {
            email:"${testUser.EMAIL}",
            password:"${testUser.PASSWORD}",
            role:Owner
          }) {
            ok
            error
          }
        }`,
        })
        .expect(200)
        .expect((response) => {
          expect(response.body.data.createAccount.ok).toBe(true);
          expect(response.body.data.createAccount.error).toBe(null);
        });
    });
    it('should fail if account already exists', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation {
          createAccount(input: {
            email:"${testUser.EMAIL}",
            password:"${testUser.PASSWORD}",
            role:Owner
          }) {
            ok
            error
          }
        }`,
        })
        .expect(200)
        .expect((response) => {
          const {
            body: {
              data: { createAccount },
            },
          } = response;
          expect(createAccount.ok).toBe(false);
          expect(createAccount.error).toBe(
            'There is a user with that email already.',
          );
        });
    });
  });

  describe('login', () => {
    it('sholud login with correct credentials', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation {
            login(input:{
              email:"${testUser.EMAIL}",
              password:"${testUser.PASSWORD}"
          }) {
            ok
            error
            token
          }
        }`,
        })
        .expect(200)
        .expect((response) => {
          const {
            body: {
              data: { login },
            },
          } = response;
          expect(login.ok).toBe(true);
          expect(login.error).toBe(null);
          expect(login.token).toEqual(expect.any(String));
          jwtToken = login.token;
        });
    });
    it('should not be able to login with wrong credentials', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation {
          login(input:{
            email:"${testUser.EMAIL}",
            password:"xxx",
          }) {
            ok
            error
            token
          }
        }`,
        })
        .expect(200)
        .expect((response) => {
          const {
            body: {
              data: { login },
            },
          } = response;
          expect(login.ok).toBe(false);
          expect(login.error).toBe('Wrong password.');
          expect(login.token).toBe(null);
        });
    });
  });

  describe('userProfile', () => {
    let userId: number;
    beforeAll(async () => {
      const [user] = await usersRepository.find();
      userId = user.id;
    });
    it("should see a user's profile", () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken)
        .send({
          query: `{
          userProfile(userId:1){
            ok
            error
            user {
              id
            }
          }
        }`,
        })
        .expect(200)
        .expect((response) => {
          const {
            body: {
              data: {
                userProfile: {
                  ok,
                  error,
                  user: { id },
                },
              },
            },
          } = response;
          console.log(response.body);
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(id).toBe(userId);
        });
    });
    it('shoud not find a profile', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken)
        .send({
          query: `{
          userProfile(userId:1){
            ok
            error
            user {
              id
            }
          }
        }`,
        })
        .expect(200)
        .expect((response) => {
          const {
            body: {
              data: {
                userProfile: { ok, error, user },
              },
            },
          } = response;

          expect(ok).toBe(false);
          expect(error).toBe('User Not Found.');
          expect(user).toBe(null);
        });
    });
  });

  it.todo('me');
  it.todo('userProfile');
  it.todo('editProfile');
  it.todo('verifyEmail');
});
