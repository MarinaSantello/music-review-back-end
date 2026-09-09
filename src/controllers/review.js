// arquivo destinado à centralizar as funções que serão relacionadas aos endpoints da API

import { buscarMusicasPorNome, buscarMusicaPorId } from "../utils/spotify/consultarAPI.js";
import { getReviewByID, getReviewsByUser, getAverageRate, insertReview, updateReview, removeReview } from "../models/review.js";

async function searchMusics(req, res) {
    try {
        const { name } = req.body;

        // valida a presença do nome da música
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Informe um nome válido.'
            });
        }

        let musicas = await buscarMusicasPorNome(name)

        if (!musicas || !Array.isArray(musicas) || musicas.length === 0)
            return res.status(404).json({
                success: false,
                message: 'Músicas não encontradas.'
            });

        musicas = await Promise.all(
            musicas.map(async musica => {
                const rate = getAverageRate(musica.id)

                return {
                    ...musica,
                    rate: rate.averageRate ? rate.averageRate : 'Sem nota'
                }
            }))

        return res.status(200).json({
            success: true,
            message: 'Músicas encontradas.',
            musicas: musicas
        });
    } catch (err) {
        return res.status(409).json({
            success: false,
            message: 'Erro inesperado.',
            detail: err.message
        });
    }
}

async function createReview(req, res) {
    try {
        const { user, id_spotify, name, rate, description } = req.body;
        const userId = parseInt(user)
        const nota = parseInt(rate)

        if (!userId || isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Identificar o usuário é obrigatório.'
            });
        } else if (id_spotify && typeof id_spotify !== 'string' || id_spotify.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Identificar a música é obrigatório.'
            });
        } else if (name && typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'O nome para a Review é obrigatório.'
            });
        } else if (!nota || isNaN(nota)) {
            return res.status(400).json({
                success: false,
                message: 'A nota é obrigatória.'
            });
        }

        const musicaValida = await buscarMusicaPorId(id_spotify)
        if (musicaValida.error)
            return res.status(400).json({
                success: false,
                message: musicaValida.message
            });

        const data = req.body

        const review = insertReview(data)

        return res.status(201).json({
            success: true,
            message: 'Review criada com sucesso.',
            review: review
        });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed: review.user, review.id_spotify'))
            return res.status(400).json({
                success: false,
                message: 'Este usuário já avaliou essa música',
                detail: err.message
            });

        return res.status(409).json({
            success: false,
            message: 'Erro inesperado.',
            detail: err.message
        });
    }
}

async function getReviewWithID(req, res) {
    try {
        const { user_id, review_id } = req.body;
        const userId = parseInt(user_id);
        const reviewId = parseInt(review_id);

        if (!userId || isNaN(userId)) {
            res.status(400).json({
                success: false,
                message: 'Identificar o usuário é obrigatório.'
            });
        } else if (!reviewId || isNaN(reviewId)) {
            res.status(400).json({
                success: false,
                message: 'Identificar a Review é obrigatório.'
            });
        }

        let review = getReviewByID(reviewId);
        if (!review || review.length === 0)
            return res.status(400).json({
                success: false,
                message: 'Review não encontrada.'
            });

        const musica = await buscarMusicaPorId(review.id_spotify)

        if (musica.error)
            return res.status(400).json({
                success: false,
                message: musica.message
            });

        review.musica = musica
        review.autoral = review.user == userId

        return res.status(200).json({
            'success': true,
            'review': review
        });
    } catch (err) {
        return res.status(409).json({
            message: 'Erro inesperado.',
            detail: err.message
        });
    }
}

async function getReviewWithUser(req, res) {
    try {
        const { user_id, author_id } = req.body;
        const userId = parseInt(user_id);
        const authorId = parseInt(author_id);

        if (!userId || isNaN(userId)) {
            res.status(400).json({
                success: false,
                message: 'Identificar o usuário é obrigatório.'
            });
        } else if (!authorId || isNaN(authorId)) {
            res.status(400).json({
                success: false,
                message: 'Identificar o autor da consulta é obrigatório.'
            });
        }

        let reviews = getReviewsByUser(user_id);
        if (!reviews || reviews.length === 0)
            return res.status(404).json({
                success: false,
                message: 'Este usuário não possui Reviews.'
            });

        reviews = await Promise.all(
            reviews.map(async review => {
                const musica = await buscarMusicaPorId(review.id_spotify)
                if (musica.error)
                    return res.status(400).json({
                        success: false,
                        message: musica.message
                    });

                return {
                    ...review,
                    musica: musica,
                    autoral: review.user == authorId
                }
            }))

        return res.status(200).json({
            'success': true,
            'reviews': reviews
        });
    } catch (err) {
        return res.status(409).json({
            message: 'Erro inesperado.',
            detail: err.message
        });
    }
}

async function updateReviewData(req, res) {
    try {
        const { user_id, review_id, name, rate, description } = req.body;
        const userId = parseInt(user_id);
        const reviewId = parseInt(review_id);

        if (!userId || isNaN(userId)) {
            res.status(400).json({
                success: false,
                message: 'Identificar o usuário é obrigatório.'
            });
        } else if (!reviewId || isNaN(reviewId)) {
            res.status(400).json({
                success: false,
                message: 'Identificar a Review é obrigatório.'
            });
        }

        const review = getReviewByID(reviewId);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review não encontrada.'
            });
        } else if (review.user != userId) {
            return res.status(404).json({
                success: false,
                message: 'Este usuário não pode atualizar essa Review.'
            });
        }

        let data = {}

        if (name) data.name = name
        if (rate) data.rate = rate
        if (description) data.description = description

        updateReview(data, reviewId)

        return res.status(200).json({
            'success': true,
            message: 'Review atualizada com sucesso.'
        });
    } catch (err) {
        return res.status(409).json({
            message: 'Erro inesperado.',
            detail: err.message
        });
    }
}

async function deleteReview(req, res) {
    try {
        const { user_id, review_id } = req.body;
        const userId = parseInt(user_id);
        const reviewId = parseInt(review_id);

        if (!userId || isNaN(userId)) {
            res.status(400).json({
                success: false,
                message: 'Identificar o usuário é obrigatório.'
            });
        } else if (!reviewId || isNaN(reviewId)) {
            res.status(400).json({
                success: false,
                message: 'Identificar a Review é obrigatório.'
            });
        }

        const review = getReviewByID(reviewId);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review não encontrada.'
            });
        } else if (review.user != userId) {
            return res.status(404).json({
                success: false,
                message: 'Este usuário não pode excluir essa Review.'
            });
        }

        removeReview(reviewId);

        return res.status(200).json({
            'success': true,
            message: 'Review removida com sucesso.'
        });
    } catch (err) {
        return res.status(409).json({
            message: 'Erro inesperado.',
            detail: err.message
        });
    }
}

export {
    searchMusics,
    createReview,
    getReviewWithID,
    getReviewWithUser,
    updateReviewData,
    deleteReview
}