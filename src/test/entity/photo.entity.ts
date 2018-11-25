import { Table } from '../../database/table.decorator';
import { Column } from '../../database/column.decorator';
import { ForeignKey } from '../../database/foreign-key.decorator';
import { Product } from './product.entity';

@Table({name: 'photos'})
export class Photo {
  @Column({isPrimary: true, isGenerated: true, name: 'photoID'})
  id: number;

  @Column()
  photoURL: string;

  @Column()
  largeThumbnailID: number;

  @Column()
  smallThumbnailID: number;

  @Column()
  prodID: number;

  @ForeignKey({column: 'largeThumbnailID', getReferencedTable: () => Photo}) // Self-referencing.
  largeThumbnail: Photo;

  @ForeignKey({column: 'smallThumbnailID', getReferencedTable: () => Photo})
  smallThumbnail: Photo;

  @ForeignKey({column: 'prodID', getReferencedTable: () => Product}) // Circular.
  product: Product;
}

