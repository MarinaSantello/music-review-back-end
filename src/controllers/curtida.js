// arquivo destinado à centralizar as funções que serão relacionadas aos endpoints da API

import { insertLike, removeLike, getLike } from "../models/curtida.js";
import { getReviewByID } from "../models/review.js";

async function createLike(req, res) {
    try {
        const { user, review } = req.body;
        const userId = parseInt(user)
        const reviewId = parseInt(review)

        if (!userId || isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Identificar o usuário é obrigatório.'
            });
        } else if (!reviewId || isNaN(reviewId)) {
            return res.status(400).json({
                success: false,
                message: 'Identificar a review é obrigatório.'
            });
        }

        const data = req.body

        const curtida = insertLike(data)

        return res.status(201).json({
            success: true,
            message: 'Curtida criada com sucesso.',
            curtida: curtida
        });
    } catch (err) {
        return res.status(409).json({
            success: false,
            message: 'Erro inesperado.',
            detail: err.message
        });
    }
}

async function deleteLike(req, res) {
    try {
        const { user, review } = req.body;
        const userId = parseInt(user)
        const reviewId = parseInt(review)

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

        const reviewData = getReviewByID(reviewId);
        if (!reviewData) {
            return res.status(404).json({
                success: false,
                message: 'Review não encontrada.'
            });
        }

        const like = getLike(userId, reviewId)
        if (!like || like.length < 1) {
            return res.status(404).json({
                success: false,
                message: 'Curtida não encontrada.'
            });
        }

        removeLike(like[0].id);

        return res.status(200).json({
            'success': true,
            message: 'Curtida removida com sucesso.'
        });
    } catch (err) {
        return res.status(409).json({
            message: 'Erro inesperado.',
            detail: err.message
        });
    }
}

export {
    createLike,
    deleteLike
}