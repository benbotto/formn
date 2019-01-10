import {
  ModelTable, ModelColumn, DefaultTableFormatter, DefaultColumnFormatter
} from '../../../modelgenerator/';

export function getPhoneNumbersModelTable() {
  const phoneNumbers = new ModelTable(new DefaultTableFormatter())
    .setName('phone_numbers')
    .addColumn(new ModelColumn(new DefaultColumnFormatter())
      .setName('phoneNumberID')
      .setDataType('number')
      .setIsPrimary(true)
      .setIsGenerated(true))
    .addColumn(new ModelColumn(new DefaultColumnFormatter())
      .setName('phoneNumber')
      .setDataType('string')
      .setMaxLength(100)
      .setIsNullable(false))
    .addColumn(new ModelColumn(new DefaultColumnFormatter())
      .setName('personID')
      .setDataType('number')
      .setIsNullable(false));

  return phoneNumbers;
}

