import { Table } from '../../database/table.decorator';
import { Column } from '../../database/column.decorator';
import { ForeignKey } from '../../database/foreign-key.decorator';
import { Photo } from './photo.entity';

@Table({name: 'products'})
export class Product {
  @Column({name: 'productID', isPrimary: true, isGenerated: true})
  id: number;

  @Column()
  description: string;

  @Column()
  isActive: boolean;

  @Column()
  primaryPhotoID: number;

  @ForeignKey({column: 'primaryPhotoID', getReferencedTable: () => Photo})
  primaryPhoto: Photo;
}

