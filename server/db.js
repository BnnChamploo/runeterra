// 数据库适配层：支持 SQLite 和 PostgreSQL
const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');

let db = null;
let dbType = 'sqlite'; // 'sqlite' 或 'postgresql'

// 检测数据库类型
if (process.env.DATABASE_URL) {
  // 使用 PostgreSQL
  dbType = 'postgresql';
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  db = pool;
} else {
  // 使用 SQLite（开发环境）
  dbType = 'sqlite';
  db = new sqlite3.Database('runeterra.db');
}

// 统一的数据库操作接口
const dbAdapter = {
  // 执行查询（返回多行）
  all: (query, params = []) => {
    return new Promise((resolve, reject) => {
      if (dbType === 'postgresql') {
        db.query(query, params, (err, result) => {
          if (err) reject(err);
          else resolve(result.rows);
        });
      } else {
        db.all(query, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      }
    });
  },

  // 执行查询（返回单行）
  get: (query, params = []) => {
    return new Promise((resolve, reject) => {
      if (dbType === 'postgresql') {
        db.query(query, params, (err, result) => {
          if (err) reject(err);
          else resolve(result.rows[0] || null);
        });
      } else {
        db.get(query, params, (err, row) => {
          if (err) reject(err);
          else resolve(row || null);
        });
      }
    });
  },

  // 执行更新/插入/删除（返回 lastID 和 changes）
  run: (query, params = []) => {
    return new Promise((resolve, reject) => {
      if (dbType === 'postgresql') {
        db.query(query, params, (err, result) => {
          if (err) reject(err);
          else resolve({
            lastID: result.insertId || result.rows[0]?.id,
            changes: result.rowCount || 0
          });
        });
      } else {
        db.run(query, params, function(err) {
          if (err) reject(err);
          else resolve({
            lastID: this.lastID,
            changes: this.changes
          });
        });
      }
    });
  },

  // 执行多个操作（事务）
  serialize: (callback) => {
    if (dbType === 'postgresql') {
      // PostgreSQL 使用事务
      db.query('BEGIN', (err) => {
        if (err) {
          console.error('开始事务失败:', err);
          return;
        }
        callback();
        db.query('COMMIT', (err) => {
          if (err) {
            console.error('提交事务失败:', err);
            db.query('ROLLBACK');
          }
        });
      });
    } else {
      // SQLite 使用 serialize
      db.serialize(callback);
    }
  },

  // 关闭连接
  close: () => {
    if (dbType === 'postgresql') {
      db.end();
    } else {
      db.close();
    }
  }
};

// SQL 语法转换函数
const convertSQL = (sql) => {
  if (dbType === 'postgresql') {
    // SQLite → PostgreSQL 转换
    return sql
      .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'SERIAL PRIMARY KEY')
      .replace(/INTEGER DEFAULT 0/g, 'INTEGER DEFAULT 0')
      .replace(/INTEGER DEFAULT 1/g, 'INTEGER DEFAULT 1')
      .replace(/INTEGER DEFAULT NULL/g, 'INTEGER')
      .replace(/TEXT DEFAULT ''/g, 'TEXT DEFAULT \'\'')
      .replace(/DATETIME DEFAULT CURRENT_TIMESTAMP/g, 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
      .replace(/INSERT OR IGNORE/g, 'INSERT')
      .replace(/AUTOINCREMENT/g, 'SERIAL');
  }
  return sql;
};

module.exports = {
  db,
  dbType,
  dbAdapter,
  convertSQL
};

