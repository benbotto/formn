import { promisify } from 'util';
import { writeFile } from 'fs';
import { join } from 'path';

import { PathHelper } from '../util/';

import {
  TableFormatter, ColumnFormatter, RelationshipFormatter, ModelTable
} from './';

/**
 * Base class for model generators.
 */
export abstract class ModelGenerator {
  /**
   * Initialize the model generator.
   * @param tableFormatter - A [[TableFormatter]] instance that is used to
   * format the names of generated class entities.
   * @param columnFormatter - A [[ColumnFormatter]] instance that is used for
   * formatting property names in the generated class entities.
   * @param relFormatter - A [[RelationshipFormatter]] instances that is used
   * to format relationship property names.
   * @param pathHelper - A [[PathHelper]] instance for creating the entity
   * directory.
   */
  constructor(
    protected tableFormatter: TableFormatter,
    protected columnFormatter: ColumnFormatter,
    protected relFormatter: RelationshipFormatter,
    protected pathHelper: PathHelper = new PathHelper()) {
  }

  /**
   * Generate models for the provided database.
   * @param dbName - A database name.  A model will be generated for each table
   * in the database.
   * @param entDir - A path to which entity files will be saved.
   * @return An array of [[ModelTable]].  Calling [[ModelTable.toString]]
   * will return the entity class definition.
   */
  abstract generateModels(dbName: string, entDir: string): Promise<ModelTable[]>;

  /**
   * Write an array of [[ModelTable]] to disk using entDir as the path.
   * @param models - An array of [[ModelTable]] to write to disk.
   * @param entDir - The path to which models should be written.
   */
  async writeModels(models: ModelTable[], entDir: string): Promise<void> {
    const writeFileP = promisify(writeFile);

    // Resolve the entity dir so that it's absolute.  If not absolute, it's
    // considered relative to the current working directory.
    entDir = this.pathHelper
      .getAbsolutePath(entDir);

    // Make the directory if it doesn't exist.
    await this.pathHelper
      .mkdirIfNotExists(entDir);

    for (let i = 0; i < models.length; ++i) {
      const fullPath = join(entDir, models[i].getImportFileName());

      await writeFileP(fullPath, models[i].toString(), 'utf8');
    }
  }
}

