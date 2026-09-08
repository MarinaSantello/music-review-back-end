import { buscarMusicasPorNome, buscarMusicaPorId } from "../utils/spotify/consultarAPI.js";

async function searchMusics(req, res) {
    try {
        const { nome } = req.body;

        // valida a presença do nome da música
        if (!nome || typeof nome !== 'string' || nome.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Informe um nome válido.'
            });
        }

        const musicas = await buscarMusicasPorNome(nome)

        if (!musicas || !Array.isArray(musicas) || musicas.length === 0)
            return res.status(404).json({
                success: false,
                message: 'Músicas não encontradas.'
            });

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

export {
    searchMusics
}