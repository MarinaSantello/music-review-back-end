// arquivo destinado à centralizar as funções que rodam script no banco

import db from "../db/app.js"

// cria uma curtida 
function insertLike(data) {
    const chaves = Object.keys(data);
    const campos = chaves.join(', ')

    const values = chaves.map(() => "?").join(", ");

    const stmt = db.prepare(`INSERT INTO curtida_review (${campos}) VALUES (${values})`);

    const info = stmt.run(...Object.values(data));

    return info.lastInsertRowid;
}

// deleta curtida
function removeLike(id) {
    return db.prepare('DELETE from curtida_review WHERE id = ?').run(id);
}

// busca a like de um usuario em uma review
function getLike(user, review) {
    return db.prepare('SELECT * FROM curtida_review WHERE user = ? AND review = ?').all(user, review);
}

// busca a quantidades de likes de uma review
function getLikesReview(id) {
    return db.prepare('SELECT COUNT(*) AS total_likes FROM curtida_review WHERE review = ?').get(id);
}

export {
    insertLike,
    removeLike,
    getLike,
    getLikesReview
}