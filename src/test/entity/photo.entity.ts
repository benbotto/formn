import { Table } from '../../metadata/table/table.decorator';
import { Column } from '../../metadata/column/column.decorator';
import { ManyToOne } from '../../metadata/relationship/many-to-one.decorator';
import { OneToOne } from '../../metadata/relationship/one-to-one.decorator';
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

  @OneToOne<Photo, Photo>(() => Photo, (p1, p2) => [p1.largeThumbnailID, p2.id])
  largeThumbnail: Photo; // Self-referencing.

  @OneToOne<Photo, Photo>(() => Photo, (p1, p2) => [p1.smallThumbnailID, p2.id])
  smallThumbnail: Photo; // Self-referencing.

  @ManyToOne<Photo, Product>(() => Product, (photo, prod) => [photo.prodID, prod.id])
  product: Product;
}

