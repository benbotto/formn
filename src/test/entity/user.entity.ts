import { Table } from '../../database/table.decorator';
import { Column } from '../../database/column.decorator';

@Table({name: 'users'})
export class User {
  @Column({isPrimary: true, isGenerated: true})
  id: number;

  @Column({maxLength: 255})
  username: string;

  @Column()
  createdOn: Date;
}

