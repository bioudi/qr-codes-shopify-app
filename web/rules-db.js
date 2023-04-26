/*
  This file interacts with the app's database and is used by the app's REST APIs.
*/

import path from "path";
import sqlite3 from "sqlite3";

const DEFAULT_DB_FILE = path.join(process.cwd(), "rules_db.sqlite");

export const rulesDB = {
  rulesTableName: "rules",
  db: null,
  ready: null,

  create: async function ({ shopDomain, title, trigger }) {
    await this.ready;

    const query = `
      INSERT INTO ${this.rulesTableName}
      (shopDomain, title, trigger)
      VALUES (?, ?, ?)
      RETURNING id;
    `;

    const rawResults = await this.__query(query, [shopDomain, title, trigger]);

    return rawResults[0].id;
  },

  update: async function (id, { title, trigger }) {
    await this.ready;

    const query = `
      UPDATE ${this.rulesTableName}
      SET
        title = ?,
        trigger = ?
      WHERE
        id = ?;
    `;

    await this.__query(query, [title, trigger, id]);
    return true;
  },

  list: async function (shopDomain) {
    await this.ready;
    const query = `
      SELECT * FROM ${this.rulesTableName}
      WHERE shopDomain = ?;
    `;

    return await this.__query(query, [shopDomain]);
  },

  read: async function (id) {
    await this.ready;
    const query = `
      SELECT * FROM ${this.rulesTableName}
      WHERE id = ?;
    `;
    const rows = await this.__query(query, [id]);
    if (!Array.isArray(rows) || rows?.length !== 1) return undefined;

    return rows[0];
  },

  delete: async function (id) {
    await this.ready;
    const query = `
      DELETE FROM ${this.rulesTableName}
      WHERE id = ?;
    `;
    await this.__query(query, [id]);
    return true;
  },

  /* Private */

  /*
    Used to check whether to create the database.
    Also used to make sure the database and table are set up before the server starts.
  */

  __hasRulesTable: async function () {
    const query = `
      SELECT name FROM sqlite_schema
      WHERE
        type = 'table' AND
        name = ?;
    `;
    const rows = await this.__query(query, [this.rulesTableName]);
    return rows.length === 1;
  },

  /* Initializes the connection with the app's sqlite3 database */
  init: async function () {
    /* Initializes the connection to the database */
    this.db = this.db ?? new sqlite3.Database(DEFAULT_DB_FILE);

    const hasRulesTable = await this.__hasRulesTable();

    if (hasRulesTable) {
      this.ready = Promise.resolve();

      /* Create the QR code table if it hasn't been created */
    } else {
      const query = `
        CREATE TABLE ${this.rulesTableName} (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          shopDomain VARCHAR(511) NOT NULL,
          title VARCHAR(511) NOT NULL,
          trigger VARCHAR(255) NOT NULL,
          createdAt DATETIME NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime'))
        )
      `;

      /* Tell the various CRUD methods that they can execute */
      this.ready = this.__query(query);
    }
  },

  /* Perform a query on the database. Used by the various CRUD methods. */
  __query: function (sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  },
};
