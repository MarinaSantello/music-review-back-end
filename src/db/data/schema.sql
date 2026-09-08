-- ativa as chaves estrangeiras
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS user (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS review (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    id_spotify TEXT NOT NULL,
    name TEXT NOT NULL,
    rate INTEGER NOT NULL CHECK (rate BETWEEN 0 AND 5),
    description TEXT,
    user INTEGER NOT NULL REFERENCES user(id),
    created_at DATETIME NOT NULL DEFAULT (datetime('now', '-3 hours')),
    updated_at DATETIME,
    UNIQUE (user, id_spotify)
);