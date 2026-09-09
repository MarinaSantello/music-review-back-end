// arquivo destinado à centralizar as funções que rodam script no banco

import db from "../db/app.js"

// busca review pelo ID
function getReviewByID(id) {
    return db.prepare('SELECT * FROM review WHERE id = ?').get(id);
}


// busca reviews pelo usuário
function getReviewsByUser(user) {
    return db.prepare('SELECT * FROM review WHERE user = ?').all(user);
}

// busca a média das notas de uma música
function getAverageRate(id_spotify) {
    return db.prepare('SELECT AVG(rate) AS averageRate FROM review WHERE id_spotify = ?').get(id_spotify);
}

// cria uma review 
function insertReview(data) {
    const chaves = Object.keys(data);
    const campos = chaves.join(', ')

    const values = chaves.map(() => "?").join(", ");

    const stmt = db.prepare(`INSERT INTO review (${campos}) VALUES (${values})`);

    const info = stmt.run(...Object.values(data));

    return info.lastInsertRowid;
}

// atualiza review
function updateReview(data, id) {
    const chaves = Object.keys(data);
    const campos = chaves
        .map(campo => `${campo} = ?`)
        .join(", ");

    const query = `UPDATE review SET ${campos} WHERE id = ?`;

    const stmt = db.prepare(query);

    const valores = chaves.map(campo => data[campo]);
    const info = stmt.run(...valores, id);

    return info.changes;
}

// deleta review
function removeReview(id) {
    return db.prepare('DELETE from review WHERE id = ?').run(id);
}

export {
    getReviewByID,
    getReviewsByUser,
    getAverageRate,
    insertReview,
    updateReview,
    removeReview
}