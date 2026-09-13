// arquivo destinado à configuração de middlewares (funções que rodam no meio das requisições, entre o front e o servidor) e registro de rotas de api

import express from 'express';
import cors from 'cors';
import userRoutes from './src/routes/user.js';
import reviewRoutes from './src/routes/review.js';

const app = express();

app.use(cors({
    origin: [
        'http://localhost:8080',
        'http://127.0.0.1:5500'
    ]
}));

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);

app.use((err, req, res, next) => {
    if (err && err.type === 'entity.parse.failed') {
        return res.status(400).json({
            message: 'JSON inválido no corpo da requisição.'
        });
    }

    next(err);
});

const PORT = 8080;
app.listen(PORT, () => console.log(`Servidor (API) rodando na porta ${PORT}`));