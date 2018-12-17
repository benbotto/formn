import { Table } from '../../metadata/table/table.decorator';
import { Column } from '../../metadata/column/column.decorator';
import { ManyToOne } from '../../metadata/relationship/many-to-one.decorator';
import { Vehicle } from './vehicle.entity';

@Table({name: 'vehicle_packages'})
export class VehiclePackage {
  @Column({name: 'vehiclePackageID', isPrimary: true})
  id: number;

  @Column()
  interior: string;

  @Column()
  heatedSeats: boolean;

  @Column()
  make: string;

  @Column()
  model: string;

  @ManyToOne<VehiclePackage, Vehicle>(() => Vehicle, (vp, v) => [
    [vp.make, v.make],
    [vp.model, v.model]
  ])
  vehicle: Vehicle;
}

