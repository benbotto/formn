import 'reflect-metadata';

import { User } from './test/entity/user.entity';
import { PhoneNumber } from './test/entity/phone-number.entity';
import metaFactory from './metadata/metadata-factory';

const user = new User();
const pn = new PhoneNumber();
//console.log(user);

//console.log(new metaFactory.getColumnMetadata()[0].entity);
//const Entity: {new(): any} = metaFactory.getDatabaseMetaData().getTables()[0].Entity;
//console.log(metaFactory.getDatabaseMetaData().getTables()[0].produceEntity());
//console.log(new Entity());
//console.log(metaFactory.getDatabaseMetaData().getTables()[0].getColumns());
//console.log(metaFactory.getDatabaseMetaData().getTables()[1].getColumns());

