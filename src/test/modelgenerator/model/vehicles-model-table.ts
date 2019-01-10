import {
  ModelTable, ModelColumn, DefaultTableFormatter, DefaultColumnFormatter
} from '../../../modelgenerator/';

export function getVehiclesModelTable() {
  const vehicles = new ModelTable(new DefaultTableFormatter())
    .setName('vehicles')
    .addColumn(new ModelColumn(new DefaultColumnFormatter())
      .setName('make')
      .setDataType('string')
      .setIsPrimary(true))
    .addColumn(new ModelColumn(new DefaultColumnFormatter())
      .setName('model')
      .setDataType('string')
      .setIsPrimary(true));

  return vehicles;
}

