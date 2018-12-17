import { Table } from '../../metadata/table/table.decorator';
import { Column } from '../../metadata/column/column.decorator';
import { OneToMany } from '../../metadata/relationship/one-to-many.decorator';
import { VehiclePackage } from './vehicle-packages.entity';

@Table({name: 'vehicles'})
export class Vehicle {
  @Column({isPrimary: true})
  make: string;

  @Column({isPrimary: true})
  model: string;

  @OneToMany<Vehicle, VehiclePackage>(() => VehiclePackage, (v, vp) => [
    [v.make, vp.make],
    [v.model, vp.model]
  ])
  packages: VehiclePackage[];
}

