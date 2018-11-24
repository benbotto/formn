export class ColumnMetaOptions {
  // Column name.
  name?: string;

  // Whether or not this column is the (or part of the) primary key.
  primary?: boolean;

  // Whether or not this column is auto-generated.
  generated?:boolean;
  
  // The column's default value (quoted).
  defaultValue?: string;

  // Whether or not the column is nullable.
  nullable?: boolean;

  // Data type for the column.
  dataType?: string;

  // Max length for varchar-type fields.
  maxLength?: number;
}

