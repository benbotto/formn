import { ColumnMetaOptions } from './column-meta-options';

export class ColumnMetadata {
  Entity: {new(): any};
  mapTo: string;
  name: string;
  primary: boolean;
  generated:boolean;
  defaultValue: string;
  nullable: boolean;
  dataType: string;
  maxLength?: number;

  constructor(Entity: {new(): any}, mapTo: string, options: ColumnMetaOptions) {
    this.Entity       = Entity;
    this.mapTo        = mapTo;

    this.name         = options.name;
    this.primary      = options.primary || false;
    this.generated    = options.generated || false;
    this.defaultValue = options.defaultValue || null;
    this.nullable     = options.nullable || true;
    this.dataType     = options.dataType;
    this.maxLength    = options.maxLength;
  }
}

