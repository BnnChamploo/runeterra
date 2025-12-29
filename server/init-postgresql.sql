-- PostgreSQL 数据库初始化脚本
-- 在 Render 创建 PostgreSQL 数据库后，运行此脚本创建表结构

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  avatar TEXT DEFAULT 'avatars/default-avatar.png',
  rank TEXT DEFAULT '坚韧黑铁',
  title TEXT DEFAULT '',
  identity TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 帖子表
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  images TEXT DEFAULT '[]',
  is_anonymous INTEGER DEFAULT 0,
  custom_time TEXT,
  region TEXT DEFAULT '',
  user_title TEXT DEFAULT '',
  user_identity TEXT DEFAULT '',
  user_rank TEXT DEFAULT '',
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_pinned INTEGER DEFAULT 0,
  custom_replies_count INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 回复表
CREATE TABLE IF NOT EXISTS replies (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL,
  user_id INTEGER,
  content TEXT NOT NULL,
  images TEXT DEFAULT '[]',
  is_anonymous INTEGER DEFAULT 0,
  custom_time TEXT,
  region TEXT DEFAULT '',
  user_title TEXT DEFAULT '',
  user_identity TEXT DEFAULT '',
  user_rank TEXT DEFAULT '',
  floor_number INTEGER,
  likes INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  parent_reply_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (parent_reply_id) REFERENCES replies(id)
);

-- 点赞表
CREATE TABLE IF NOT EXISTS likes (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id),
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 创建索引（提高查询性能）
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_replies_post_id ON replies(post_id);
CREATE INDEX IF NOT EXISTS idx_replies_user_id ON replies(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);

