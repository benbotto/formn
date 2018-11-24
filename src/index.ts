import 'reflect-metadata';

import { User } from './test/entity/user.entity';
import metaFactory from './database/metadata-factory';

const user = new User();
//console.log(user);

//console.log(new metaFactory.getColumnMetadata()[0].entity);
//const Entity: {new(): any} = metaFactory.getDatabaseMetaData().getTables()[0].Entity;
//console.log(metaFactory.getDatabaseMetaData().getTables()[0].produceEntity());
//console.log(new Entity());
console.log(metaFactory.getDatabaseMetaData().getTables()[0].getColumns());

