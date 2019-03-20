import * as mysql2 from 'mysql2/promise';
import * as fs from 'fs';

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
          const modelStrings = models.map(model => model.toString());

          expect(modelStrings[0]).toBe(
`import { Table, Column, OneToMany } from 'formn';

import { PhoneNumber } from './phone-number.entity';

@Table({name: 'users'})
export class User {
  @Column({hasDefault: true, isNullable: false, sqlDataType: 'timestamp'})
  createdOn: Date;

  @Column({maxLength: 255, sqlDataType: 'varchar'})
  firstName: string;

  @Column({maxLength: 255, sqlDataType: 'varchar'})
  lastName: string;

  @Column({name: 'userID', isPrimary: true, isGenerated: true, isNullable: false, sqlDataType: 'int'})
  id: number;

  @OneToMany<User, PhoneNumber>(() => PhoneNumber, (l, r) => [l.id, r.userId])
  phoneNumbers: PhoneNumber[];
}
`);

          expect(modelStrings[1]).toBe(
`import { Table, Column, ManyToOne } from 'formn';

import { User } from './user.entity';

@Table({name: 'phone_numbers'})
export class PhoneNumber {
  @Column({isNullable: false, maxLength: 255, sqlDataType: 'varchar'})
  phoneNumber: string;

  @Column({name: 'phoneNumberID', isPrimary: true, isGenerated: true, isNullable: false, sqlDataType: 'int'})
  id: number;

  @Column({maxLength: 255, sqlDataType: 'varchar'})
  type: string;

  @Column({name: 'userID', isNullable: false, sqlDataType: 'int'})
  userId: number;

  @ManyToOne<PhoneNumber, User>(() => User, (l, r) => [l.userId, r.id])
  user: User;
}
`);
          done();
        });
    });

    it('writes the files to disk.', (done) => {
      const files: string[] = [];

      spyOn(fs, 'writeFile').and.callFake((file: string, data: string, opts: any, callback: Function) => {
        files.push(file);
        callback();
      });

      spyOn(fs, 'stat').and.callFake((path: string, callback: Function) =>
        callback(new Error('file not found...')));

      spyOn(fs, 'mkdir').and.callFake((path: string, opts: object, callback: Function) =>
        callback());

      mockPool.query.and.returnValue(Promise.resolve([[...usersSchema, ...phoneNumbersSchema]]));

      generator
        .generateModels('formn_test_db', '/fake/path')
        .then(models => {
          expect(fs.mkdir).toHaveBeenCalled();
          expect(files.length).toBe(2);
          expect(files[0]).toBe('/fake/path/user.entity.ts');
          expect(files[1]).toBe('/fake/path/phone-number.entity.ts');
          done();
        });
    });
  });
});

