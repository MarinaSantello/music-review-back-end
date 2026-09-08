// arquivo destinado à centralizar as funções que rodam script no banco

import db from "../db/app.js"

// busca usuário pelo ID
function getUserByID(id) {
    return db.prepare('SELECT * FROM user WHERE id = ?').get(id);
}


// busca usuário pelo e-mail (útil para login e validar e-mail válido)
function getUserByEmail(email) {
    return db.prepare('SELECT * FROM user WHERE email = ?').get(email);
}

// cria um usuário 
function insertUser(name, email, password) {
    const stmt = db.prepare('INSERT INTO user (name, email, password) VALUES (?, ?, ?)');

    const info = stmt.run(name, email, password);

    return info.lastInsertRowid;
}

// atualiza usuário - só é permitido editar o nome
function updateNameUser(name, id) {
    const stmt = db.prepare('UPDATE user set name = ? WHERE id = ?');

    const info = stmt.run(name, id);

    return info.lastInsertRowid;
}

// deleta usuário
function delUser(id) {
    return db.prepare('DELETE from user WHERE id = ?').run(id);
}

export {
    getUserByID,
    getUserByEmail,
    insertUser,
    updateNameUser,
    delUser
}