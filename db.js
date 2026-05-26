import Database from "better-sqlite3";
const db=new Database("bot.db")
db.prepare(`create table if not exists users(
    chat_id integer primary key )`).run()
db.prepare(`create table if not exists repos(
    url text primary key,
    name text,
    last_tag text,
    last_checked integer
    )`).run()
db.prepare(`create table if not exists watches(
    chat_id integer references users(chat_id),
    url text references repos(url),
    primary key (chat_id,url)
    )`).run