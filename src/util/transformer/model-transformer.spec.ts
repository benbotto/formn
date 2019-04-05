import { initDB, PhoneNumber, User, Product } from '../../test/';

import { ModelTransformer } from '../';

describe('ModelTransformer()', () => {
  beforeEach(() => initDB());

  describe('.transform()', () => {
    const transformer: ModelTransformer = new ModelTransformer();

    it('rejects with an error if the object is not a valid Entity.', (done) => {
      const phone = {
        id: 'not-an-int'
      };

      transformer
        .transform(phone, PhoneNumber)
        .catch(err => {
          expect(err.errors.length).toBe(1);
          expect(err.errors[0].field).toBe('id');
          done();
        });
    });

    it('returns an instance of the Entity.', (done) => {
      const phone = {
        id: 42
      };

      transformer
        .transform(phone, PhoneNumber)
        .then(ent => {
          expect(ent instanceof PhoneNumber).toBe(true);
          done();
        });
    });

    it('ignores undefined properties.', (done) => {
      const phone = {
      };

      transformer
        .transform(phone, PhoneNumber)
        .then(ent => {
          expect(ent.id).not.toBeDefined();
          expect(ent.phoneNumber).not.toBeDefined();
          expect(ent.type).not.toBeDefined();
          expect(ent.userID).not.toBeDefined();
          expect(ent.user).not.toBeDefined();
          done();
        });
    });

    it('sets null properties to null.', (done) => {
      const phone = {
        type: null as any
      };

      transformer
        .transform(phone, PhoneNumber)
        .then(ent => {
          expect(ent.type).toBeNull();
          done();
        });
    });

    it('copies matching data types directly.', async () => {
      const user = {
        id:        42,
        first:     'Joe',
        createdOn: new Date(2019, 0)
      };

      const userEnt = await transformer
        .transform(user, User);

      expect(userEnt.id).toBe(42);
      expect(userEnt.first).toBe('Joe');
      expect(userEnt.createdOn.getFullYear()).toBe(2019);
      expect(userEnt.createdOn.getMonth()).toBe(0);

      const prod = {
        isActive: true
      };

      const prodEnt = await transformer
        .transform(prod, Product);

      expect(prodEnt.isActive).toBe(true);
    });

    it('rejects if a related entity is invalid.', (done) => {
      const user = {
        id: 42,
        phoneNumbers: [
          {id: 'not-an-int'}
        ]
      };

      transformer
        .transform(user, User)
        .catch(err => {
          expect(err.errors.length).toBe(1);
          expect(err.errors[0].field).toBe('id');
          done();
        });
    });

    it('returns an empty array of related entities.', (done) => {
      const user = {
        id: 42,
        phoneNumbers: [] as any
      };

      transformer
        .transform(user, User)
        .then(u => {
          expect(u instanceof User).toBe(true);
          expect(u.phoneNumbers.length).toBe(0);
          done();
        });
    });

    it('skips sub-resources if they\'re not defined.', (done) => {
      const user = {
        id: 42
      };

      transformer
        .transform(user, User)
        .then(u => {
          expect(u.phoneNumbers).not.toBeDefined();
          done();
        });
    });

    it('returns an array of related entities.', (done) => {
      const user = {
        id: 42,
        phoneNumbers: [
          {id: 1},
          {id: 2},
        ]
      };

      transformer
        .transform(user, User)
        .then(u => {
          expect(u instanceof User).toBe(true);
          expect(u.phoneNumbers.length).toBe(2);
          expect(u.phoneNumbers[0] instanceof PhoneNumber).toBe(true);
          expect(u.phoneNumbers[1] instanceof PhoneNumber).toBe(true);
          expect(u.phoneNumbers[0].id).toBe(1);
          expect(u.phoneNumbers[1].id).toBe(2);
          done();
        });
    });

    it('returns a null related entity.', (done) => {
      const phone = {
        id: 1,
        user: null as any
      };

      transformer
        .transform(phone, PhoneNumber)
        .then(pn => {
          expect(pn instanceof PhoneNumber).toBe(true);
          expect(pn.id).toBe(1);
          expect(pn.user).toBeNull();
          done();
        });
    });

    it('returns a single related entity.', (done) => {
      const phone = {
        id: 1,
        user: {
          id: 2,
          phoneNumbers: [
            {id: 3},
            {id: 4},
          ]
        }
      };

      transformer
        .transform(phone, PhoneNumber)
        .then(pn => {
          expect(pn instanceof PhoneNumber).toBe(true);
          expect(pn.id).toBe(1);
          expect(pn.user instanceof User).toBe(true);
          expect(pn.user.id).toBe(2);
          expect(pn.user.phoneNumbers.length).toBe(2);
          expect(pn.user.phoneNumbers[0] instanceof PhoneNumber).toBe(true);
          expect(pn.user.phoneNumbers[1] instanceof PhoneNumber).toBe(true);
          expect(pn.user.phoneNumbers[0].id).toBe(3);
          expect(pn.user.phoneNumbers[1].id).toBe(4);
          done();
        });
    });
  });
});

