import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { CoffeesModule } from '../../src/coffees/coffees.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';
import { WrapResponseInterceptor } from '../../src/common/interceptors/wrap-response.interceptor';
import { TimeoutInterceptor } from '../../src/common/interceptors/timeout.interceptor';
import { CreateCoffeeDto } from '../../src/coffees/dto/create-coffee.dto';
import { UpdateCoffeeDto } from 'src/coffees/dto/update-coffee.dto';

jest.setTimeout(60000);
describe('[Feature] Coffees - /coffees', () => {
  const coffee = {
    name: 'Shipreck Roast',
    brand: 'Buddy Brew',
    flavors: ['chocalate', 'vanilla'],
  };
  const updateCoffeeDto: UpdateCoffeeDto = {
    name: 'Nescafe',
  };
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        CoffeesModule,
        await TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5433,
          username: 'postgres',
          password: 'pas123',
          database: 'postgres',
          autoLoadEntities: true,
          synchronize: true,
        }),
      ],
    }).compile();

    app = await moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    // app.useGlobalFilters(new HttpExceptionFilter());
    // app.useGlobalInterceptors(
    //   new WrapResponseInterceptor(),
    //   new TimeoutInterceptor(),
    // );

    await app.init();
  });

  it('Create [POST /]', async () => {
    return await request(app.getHttpServer())
      .post('/coffees')
      .send(coffee as CreateCoffeeDto)
      .expect(HttpStatus.CREATED)
      .then(({ body }) => {
        const expectedCoffee = jasmine.objectContaining({
          ...coffee,
          flavors: jasmine.arrayContaining(
            coffee.flavors.map((name) => jasmine.objectContaining({ name })),
          ),
        });
        expect(body).toEqual(expectedCoffee);
      });
  });
  it('Get all [GET /]', async () => {
    return await request(app.getHttpServer())
      .get(`/coffees`)
      .expect(HttpStatus.OK)
      .then(({ body }) => {
        const expectedCoffees = jasmine.arrayContaining([
          jasmine.objectContaining({
            ...coffee,
            flavors: jasmine.arrayContaining(
              coffee.flavors.map((name) => jasmine.objectContaining({ name })),
            ),
          }),
        ]);
        expect(body).toEqual(expectedCoffees);
      });
  });
  it('Get one [GET /:id]', async () => {
    return await request(app.getHttpServer())
      .get('/coffees/1')
      .expect(HttpStatus.OK)
      .then(({ body }) => {
        const expectedCoffee = jasmine.objectContaining({
          ...coffee,
          flavors: jasmine.arrayContaining(
            coffee.flavors.map((name) => jasmine.objectContaining({ name })),
          ),
        });
        expect(body).toEqual(expectedCoffee);
      });
  });
  it('Update one [PATCH /:id]', async () => {
    return await request(app.getHttpServer())
      .patch('/coffees/1')
      .send(updateCoffeeDto)
      .expect(HttpStatus.OK)
      .then(({ body }) => {
        const expectedCoffee = jasmine.objectContaining({
          ...updateCoffeeDto,
        });
        expect(body).toEqual(expectedCoffee);
      });
  });
  it('Delete one [DELETE /:id]', async () => {
    return await request(app.getHttpServer())
      .delete('/coffees/1')
      .expect(HttpStatus.OK)
      .then(({ body }) => {
        const expectedCoffee = jasmine.objectContaining({
          ...coffee,
          ...updateCoffeeDto,
          flavors: jasmine.arrayContaining(
            coffee.flavors.map((name) => jasmine.objectContaining({ name })),
          ),
        });
        expect(body).toEqual(expectedCoffee);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
