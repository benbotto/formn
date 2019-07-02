const MIGRATION_TEMPLATE: string = `'use strict';

module.exports = {
  /**
   * Run the migration.
   */
  up(dataContext) {
    const sql    = \`\`;
    const params = {};

    console.log(sql);

    return dataContext
      .getExecuter()
      .query(sql, params); 
  },

  /**
   * Bring down a migration.
   */
  down(dataContext) {
    const sql    = \`\`;
    const params = {};

    console.log(sql);

    return dataContext
      .getExecuter()
      .query(sql, params); 
  }
};
`;

export { MIGRATION_TEMPLATE };

