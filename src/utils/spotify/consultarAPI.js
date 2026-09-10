import dotenv from "dotenv";
import { formatarTempo } from "../geral.js";
import { getAverageRate, getSumLikes } from "../../models/review.js";

dotenv.config();

const client_ID = process.env.SPOTIFY_CLIENT_ID
const client_secret = process.env.SPOTIFY_CLIENT_SECRET

async function obterToken() {
    const credentials = Buffer.from(
        `${client_ID}:${client_secret}`
    ).toString('base64');

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
        const erro = await response.text();
        throw new Error(`Erro ao obter token: ${response.status} - ${erro}`);
    }

    const data = await response.json();

    return data.access_token;
}

async function buscarMusicasPorNome(nome) {
    const token = await obterToken();

    const url = new URL('https://api.spotify.com/v1/search');

    url.searchParams.set('q', nome);
    url.searchParams.set('type', 'track');
    url.searchParams.set('limit', '10');

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const erro = await response.text();
        throw new Error(`Erro Spotify: ${response.status} - ${erro}`);
    }

    const result = await response.json();

    const resultado = await Promise.all(
        result.tracks.items.map(async resposta => {
            const rate = getAverageRate(resposta.id);
            const qtd_likes = getSumLikes(resposta.id);

            const artistas = await Promise.all(
                resposta.artists.map(async artist => {

                    const artista = await buscarArtista(artist.id);

                    return {
                        nome: artist.name,
                        icone: artista.images[1].url
                    };
                })
            );

            return {
                id: resposta.id,
                album: {
                    nome: resposta.album.name,
                    capa: resposta.album.images[1].url
                },
                artistas: artistas,
                duracao: formatarTempo(resposta.duration_ms),
                ano: resposta.album.release_date.split('-')[0],
                nome: resposta.name,
                linkSpotify: resposta.external_urls.spotify,
                rate: rate.averageRate !== null ? rate.averageRate : 'Sem nota',
                qtd_likes: qtd_likes.qtdLikes
            };
        })
    );

    return resultado;
}

async function buscarArtista(id) {
    const token = await obterToken();

    const url = new URL(`https://api.spotify.com/v1/artists/${id}`);

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const erro = await response.text();
        throw new Error(`Erro Spotify: ${response.status} - ${erro}`);
    }

    const result = await response.json();

    return result
}

async function buscarMusicaPorId(id) {
    const token = await obterToken();

    const response = await fetch(
        `https://api.spotify.com/v1/tracks/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {
        const erro = await response.text();
        if (JSON.parse(erro).error.message.includes('Invalid base62 id'))
            return {
                'error': true,
                'message': 'Informe uma música válida.'
            }

        throw new Error(`Erro Spotify: ${response.status} - ${erro}`);
    }

    const result = await response.json();

    const rate = getAverageRate(result.id)
    const qtd_likes = getSumLikes(result.id);

    const artistas = await Promise.all(
        result.artists.map(async artist => {

            const artista = await buscarArtista(artist.id);

            return {
                nome: artist.name,
                icone: artista.images[1].url
            };
        })
    );

    const resultado =  {
        id: result.id,
        album: {
            nome: result.album.name,
            capa: result.album.images[1].url
        },
        artistas: artistas,
        duracao: formatarTempo(result.duration_ms),
        ano: result.album.release_date.split('-')[0],
        nome: result.name,
        linkSpotify: result.external_urls.spotify,
        rate: rate.averageRate !== null ? rate.averageRate : 'Sem nota',
        qtd_likes: qtd_likes.qtdLikes
    };

    return resultado;
}

export {
    buscarMusicasPorNome,
    buscarMusicaPorId
}