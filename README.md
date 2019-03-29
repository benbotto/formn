# Formn

Formn, pronounced foreman, is an object-relational mapper for Node.js. What's
the "F" stand for? It depends on your mood.

It's a fast, database-first ORM for projects written in TypeScript, and it uses
the data-mapper pattern.

Check out the
[documentation](https://benbotto.github.io/doc/formn/5.x.x/).  It
has a getting started guide, tutorials, and more.

### What does it do?

It takes queries that look like this:

```sql
SELECT  p.personID, p.firstName, p.lastName,
        pn.phoneNumberID, pn.phoneNumber
FROM    people p
INNER JOIN phone_numbers pn ON p.personID = pn.personID
ORDER BY p.firstName, p.lastName
```

and makes them look like this:

```typescript
const query: Select<Person> = dataContext
  .from(Person, 'p')
  .innerJoin(PhoneNumber, 'pn', 'p.phoneNumbers')
  .select(
    'p.id', 'p.firstName', 'p.lastName',
    'pn.id', 'pn.phoneNumber')
  .orderBy('p.firstName', 'p.lastName')

const people: Person[] = await query
  .execute();
```

It maps tabular, relational data that look like this:

| personID | firstName | lastName | phoneNumberID | phoneNumber  |
|----------|-----------|----------|---------------|--------------|
| 1        | Joe       | Shmo     | 1             | 530-307-8810 |
| 1        | Joe       | Shmo     | 2             | 916-200-1440 |
| 1        | Joe       | Shmo     | 3             | 916-293-4667 |
| 2        | Rand      | AlThore  | 4             | 666-451-4412 |

to normalized entities that look like this:

```javascript
[
  Person {
    id: 1,
    firstName: 'Joe',
    lastName: 'Shmo',
    phoneNumbers: [
      PhoneNumber {
        id: 1,
        phoneNumber: '530-307-8810'
      },
      PhoneNumber {
        id: 2,
        phoneNumber: '916-200-1440'
      },
      PhoneNumber {
        id: 3,
        phoneNumber: '916-293-4667'
      }
    ]
  },
  Person {
    id: 2,
    firstName: 'Rand',
    lastName: 'AlThore',
    phoneNumbers: [
      PhoneNumber {
        id: 4,
        phoneNumber: '666-451-4412'
      }
    ]
  }
]
```

### Why should I use it?

* It's fast.
* The code is well documented and thoroughly tested.
* Tutorials and documentation help you to get started quickly.
* It's database first rather than entity first, so it works well with existing
  projects and databases.
* There's a built-in model generator to generate entity classes from a
  database.
* The query interface is intuitive and closely resembles SQL.
* It's type safe.
* Security concerns like SQL injection are covered.
* CRUD operations can be reused.  One complex query with joins and filters can
  be used to select, update, and delete in a similar manner to SQL views.
* It lets you easily create queries that can be filtered and ordered
  dynamically.
* There are hooks for global conversions and transformations, like normalizing
  dates and formatting phone numbers.

Check out the
[docs](https://benbotto.github.io/doc/formn/5.x.x/)!

