import * as mysql2 from 'mysql2/promise';

import { initDB } from '../test/';

import { MySQLDataContext } from '../datacontext/';

import { MySQLModelGenerator } from './';

describe('MySQLModelGenerator()', () => {
  let createPoolSpy: jasmine.Spy;
  let mockPool: jasmine.SpyObj<mysql2.Pool>;
  let mockConn: jasmine.SpyObj<mysql2.PoolConnection>;
  let generator: MySQLModelGenerator;

  beforeEach((done) => {
    initDB();

    // The mysql2.createPool method is mocked, and a mocked query method (used
    // by the executer).
    mockConn = jasmine.createSpyObj('Conn', ['release', 'query']);
    mockConn.query.and.returnValue(Promise.resolve());

    mockPool = jasmine.createSpyObj('Pool', ['getConnection', 'query']);
    mockPool.getConnection.and.returnValue(Promise.resolve(mockConn));

    createPoolSpy = spyOn(mysql2, 'createPool').and.returnValue(mockPool);

    // Put the DC in a connected state.
    const connOpts = {
      host: 'formn-db',
      user: 'formn-user',
      password: 'formn-password',
      database: 'INFORMATION_SCHEMA',
      poolSize: 1,
    };

    const dataContext = new MySQLDataContext();

    dataContext
      .connect(connOpts)
      .then(() => {
        generator = new MySQLModelGenerator(dataContext);
        done();
      });
  });

  describe('.constructor()', () => {
    it('initializes.', () => {
      expect(generator).toBeTruthy();
    });
  });

  describe('.generateModels()', () => {
    const usersSchema = require('../test/query/users-schema.json');
    const phoneNumbersSchema = require('../test/query/phone-numbers-schema.json');

    it('pulls tables, columns, and key column usage for the database.', (done) => {
      mockPool.query.and.returnValue(Promise.resolve([[]]));

      generator
        .generateModels('formn_test_db')
        .then(() => {
          const sql = mockPool.query.calls.argsFor(0)[0];

          //console.log(sql);

          expect(sql.indexOf('FROM    `TABLES`')).not.toBe(-1);
          expect(sql.indexOf('INNER JOIN `COLUMNS`')).not.toBe(-1);
          expect(sql.indexOf('LEFT OUTER JOIN `KEY_COLUMN_USAGE`')).not.toBe(-1);

          done();
        });
    });

    it('generates a model for the table.', (done) => {
      mockPool.query.and.returnValue(Promise.resolve([[...usersSchema, ...phoneNumbersSchema]]));

      generator
        .generateModels('formn_test_db')
        .then(models => {
          expect(models[0]).toBe(
`import { Table, Column, OneToMany } from 'formn';

import { PhoneNumber } from './phone-number.entity';

@Table({name: 'users'})
export class User {
  @Column({hasDefault: true, isNullable: false})
  createdOn: Date;

  @Column({maxLength: 255})
  firstName: string;

  @Column({maxLength: 255})
  lastName: string;

  @Column({name: 'userID', isPrimary: true, isGenerated: true, isNullable: false})
  id: number;

  @OneToMany<User, PhoneNumber>(() => PhoneNumber, (l, r) => [l.id, r.userId])
  phoneNumbers: PhoneNumber[];
}
`);

          expect(models[1]).toBe(
`import { Table, Column, ManyToOne } from 'formn';

import { User } from './user.entity';

@Table({name: 'phone_numbers'})
export class PhoneNumber {
  @Column({isNullable: false, maxLength: 255})
  phoneNumber: string;

  @Column({name: 'phoneNumberID', isPrimary: true, isGenerated: true, isNullable: false})
  id: number;

  @Column({maxLength: 255})
  type: string;

  @Column({name: 'userID', isNullable: false})
  userId: number;

  @ManyToOne<PhoneNumber, User>(() => User, (l, r) => [l.userId, r.id])
  user: User;
}
`);
          done();
        });
    });
  });
});

