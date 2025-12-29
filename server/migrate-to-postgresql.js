// SQLite 到 PostgreSQL 数据迁移脚本
const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// 检查环境变量
if (!process.env.DATABASE_URL) {
  console.error('错误: 请设置 DATABASE_URL 环境变量');
  console.log('示例: DATABASE_URL=postgresql://user:pass@host:5432/dbname');
  process.exit(1);
}

// 连接数据库
const sqliteDb = new sqlite3.Database('runeterra.db');
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 迁移函数
async function migrate() {
  console.log('开始迁移数据...\n');

  try {
    // 1. 迁移用户表
    console.log('1. 迁移用户表...');
    const users = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM users', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    for (const user of users) {
      await pgPool.query(
        `INSERT INTO users (id, username, password, avatar, rank, title, identity, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [
          user.id,
          user.username,
          user.password,
          user.avatar || 'avatars/default-avatar.png',
          user.rank || '坚韧黑铁',
          user.title || '',
          user.identity || '',
          user.created_at
        ]
      );
    }
    console.log(`   ✓ 迁移了 ${users.length} 个用户\n`);

    // 2. 迁移帖子表
    console.log('2. 迁移帖子表...');
    const posts = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM posts', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    for (const post of posts) {
      await pgPool.query(
        `INSERT INTO posts (
          id, user_id, title, content, category, images, is_anonymous,
          custom_time, region, user_title, user_identity, user_rank,
          views, likes, sort_order, is_pinned, custom_replies_count,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        ON CONFLICT (id) DO NOTHING`,
        [
          post.id,
          post.user_id,
          post.title,
          post.content,
          post.category,
          post.images || '[]',
          post.is_anonymous || 0,
          post.custom_time || null,
          post.region || '',
          post.user_title || '',
          post.user_identity || '',
          post.user_rank || '',
          post.views || 0,
          post.likes || 0,
          post.sort_order || 0,
          post.is_pinned || 0,
          post.custom_replies_count || null,
          post.created_at,
          post.updated_at || post.created_at
        ]
      );
    }
    console.log(`   ✓ 迁移了 ${posts.length} 个帖子\n`);

    // 3. 迁移回复表
    console.log('3. 迁移回复表...');
    const replies = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM replies', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    for (const reply of replies) {
      await pgPool.query(
        `INSERT INTO replies (
          id, post_id, user_id, content, images, is_anonymous,
          custom_time, region, user_title, user_identity, user_rank,
          floor_number, likes, sort_order, parent_reply_id, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (id) DO NOTHING`,
        [
          reply.id,
          reply.post_id,
          reply.user_id,
          reply.content,
          reply.images || '[]',
          reply.is_anonymous || 0,
          reply.custom_time || null,
          reply.region || '',
          reply.user_title || '',
          reply.user_identity || '',
          reply.user_rank || '',
          reply.floor_number || null,
          reply.likes || 0,
          reply.sort_order || 0,
          reply.parent_reply_id || null,
          reply.created_at
        ]
      );
    }
    console.log(`   ✓ 迁移了 ${replies.length} 个回复\n`);

    // 4. 迁移点赞表
    console.log('4. 迁移点赞表...');
    const likes = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM likes', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    for (const like of likes) {
      await pgPool.query(
        `INSERT INTO likes (post_id, user_id, created_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (post_id, user_id) DO NOTHING`,
        [like.post_id, like.user_id, like.created_at]
      );
    }
    console.log(`   ✓ 迁移了 ${likes.length} 个点赞\n`);

    // 5. 重置序列（PostgreSQL 需要）
    console.log('5. 重置序列...');
    await pgPool.query("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))");
    await pgPool.query("SELECT setval('posts_id_seq', (SELECT MAX(id) FROM posts))");
    await pgPool.query("SELECT setval('replies_id_seq', (SELECT MAX(id) FROM replies))");
    await pgPool.query("SELECT setval('likes_id_seq', (SELECT MAX(id) FROM likes))");
    console.log('   ✓ 序列已重置\n');

    console.log('✅ 数据迁移完成！');
    console.log(`\n迁移统计:`);
    console.log(`  - 用户: ${users.length}`);
    console.log(`  - 帖子: ${posts.length}`);
    console.log(`  - 回复: ${replies.length}`);
    console.log(`  - 点赞: ${likes.length}`);

  } catch (error) {
    console.error('迁移失败:', error);
    process.exit(1);
  } finally {
    sqliteDb.close();
    await pgPool.end();
  }
}

// 运行迁移
migrate();

