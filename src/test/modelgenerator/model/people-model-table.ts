import {
  ModelTable, ModelColumn, DefaultTableFormatter, DefaultColumnFormatter
} from '../../../modelgenerator/';

export function getPeopleModelTable() {
  const people = new ModelTable(new DefaultTableFormatter())
    .setName('people')
    .addColumn(new ModelColumn(new DefaultColumnFormatter())
      .setName('personID')
      .setDataType('number')
      .setIsPrimary(true)
      .setIsGenerated(true))
    .addColumn(new ModelColumn(new DefaultColumnFormatter())
      .setName('name')
      .setDataType('string')
      .setMaxLength(255)
      .setIsNullable(false));

  return people;
}

