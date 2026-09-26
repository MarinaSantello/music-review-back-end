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
    rate INTEGER NOT NULL CHECK (rate BETWEEN 0 AND 10),
    liked INTEGER NOT NULL DEFAULT 0 CHECK (liked BETWEEN 0 AND 1),
    description TEXT,
    user INTEGER NOT NULL REFERENCES user(id),
    created_at DATETIME NOT NULL DEFAULT (datetime('now', '-3 hours')),
    updated_at DATETIME,
    UNIQUE (user, id_spotify)
);

CREATE TABLE IF NOT EXISTS curtida_review (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    user INTEGER NOT NULL REFERENCES user(id),
    review INTEGER NOT NULL REFERENCES review(id),
    UNIQUE (user, review)
);

CREATE TABLE IF NOT EXISTS comentario_review (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    texto TEXT NOT NULL,
    user INTEGER NOT NULL REFERENCES user(id),
    review INTEGER NOT NULL REFERENCES review(id),
    UNIQUE (user, review)
);