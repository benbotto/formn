import {
  ModelTable, ModelColumn, DefaultTableFormatter, DefaultColumnFormatter
} from '../../../modelgenerator/';

export function getVehiclePackagesModelTable() {
  const vehiclePackages = new ModelTable(new DefaultTableFormatter())
    .setName('vehicle_packages')
    .addColumn(new ModelColumn(new DefaultColumnFormatter())
      .setName('make')
      .setDataType('string'))
    .addColumn(new ModelColumn(new DefaultColumnFormatter())
      .setName('model')
      .setDataType('string'))
    .addColumn(new ModelColumn(new DefaultColumnFormatter())
      .setName('interior')
      .setDataType('string'));

  return vehiclePackages;
}

