import { Table, Column, OneToMany } from '../../metadata/';

import { VehiclePackage } from '../';

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

