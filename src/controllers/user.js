// arquivo destinado à centralizar as funções que serão relacionadas aos endpoints da API

// importa a biblioteca que gera e compara hash para a senha do usuário
import bcrypt from "bcrypt";
import { getUserByID, getUserByEmail, insertUser, updateNameUser, delUser } from "../models/user.js";

// login com e-mail e senha
async function login(req, res) {
    try {
        const { email, password } = req.body;

        // valida a presença de e-mail e senha
        if (!email || !password) {
            return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
        }

        // busca usuário no banco
        const user = getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        } else if (!user.password) {
            return res.status(400).json({ message: 'Usuário ainda não criou senha.' });
        }

        // compara senha com hash
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: 'Senha incorreta.' })
        }

        return res.status(200).json({
            message: 'Login realizado com sucesso.',
            user: user
        });
    } catch (err) {
        return res.status(409).json({
            message: 'Erro inesperado.',
            detail: err.message
        });
    }
}

// cria um usuário apenas com o nome (para vincular à sessão)
async function createUser(req, res) {
    try {
        const { name, email, password } = req.body;

        // valida a presença e tipo do nome
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({ message: 'Nome é obrigatório.' });
        } else if (email && typeof email !== 'string') {
            return res.status(400).json({ message: 'E-mail é obrigatório.' });
        } else if (password && typeof password !== 'string') {
            return res.status(400).json({ message: 'Senha é obrigatória.' });
        }

        // define as regras do que é obrigatório conter no email via regex (conter caracteres válidos antes do @, deve existir exatamente um @, O domínio precisa ter ao menos um ponto (.) e uma extensão de 2 letras ou mais)
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'E-mail inválido.' });
        }

        // define as regras do que é obrigatório conter na senha via regex (pelo menos uma letra maiúscula e uma minúscula, pelo menos um caracter especial, pelo menos um número e de tamanho 6)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: 'Senha inválida. Sua senha deve conter pelo menos uma letra maiúscula e uma minúscula, pelo menos um caracter especial, pelo menos um número e de tamanho 6.' });
        }

        // gera um hash seguro (salt autumático)
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = insertUser(name, email, hashedPassword);
        return res.status(201).json({
            message: 'Usuário criado com sucesso.'
        });
    } catch (err) {
        return res.status(409).json({
            message: 'Erro inesperado.',
            detail: err.message
        });
    }

}

// atualiza o nome do usuário
async function updateUser(req, res) {
    try {
        const { name, id } = req.body;

        // valida a presença e tipo do nome
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({ message: 'Nome é obrigatório.' });
        }

        // carrega os dados do usuário garantido que o id é de fato um número para fazer validações
        const user = getUserByID(Number(id));
        if (!user) {
            return res.status(400).json({ message: 'Usuário não encontrado.' });
        } else if (name === user.name) {
            return res.status(409).json({ message: 'Nome idêntico ao inserido anteriormente.' });
        }

        updateNameUser(name, id);
        return res.status(200).json({ message: 'Usuário atualizado com sucesso.' });
    } catch (err) {
        return res.status(409).json({
            message: 'Erro inesperado.',
            detail: err.message
        });
    }
}

// deleta um usuário pelo ID
async function deleteUser(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({ message: 'ID inválido.' })
        }

        const user = getUserByID(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        delUser(id);
        return res.status(200).json({ message: 'Usuário removido com sucesso.' });
    } catch (err) {
        return res.status(409).json({
            message: 'Erro inesperado.',
            detail: err.message
        });
    }
}

export {
    login,
    createUser,
    updateUser,
    deleteUser
};