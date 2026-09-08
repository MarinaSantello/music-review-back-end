# API — Documentação (music-review-back-end)

## 1. Visão geral

Esta API é responsável pelo gerenciamento de usuários e pela busca de músicas.

As rotas estão organizadas em dois grupos principais:

* `/api/users` — gerenciamento de usuários e autenticação;
* `/api/reviews` — busca de músicas.

A API utiliza requisições HTTP e recebe dados no corpo (`body`) no formato **JSON**.

### URL base

Em ambiente local, o servidor é executado na porta `8080`:

```text
http://localhost:8080
```

Portanto, os endpoints completos seguem o padrão:

```text
http://localhost:8080/api/...
```

---

# 2. Configuração das requisições

As requisições que possuem dados no corpo devem utilizar JSON.

Exemplo de cabeçalho:

```http
Content-Type: application/json
```

A API utiliza `express.json()` para interpretar o corpo das requisições.

Caso seja enviado um JSON inválido, a API retorna:

```json
{
  "success": false,
  "message": "JSON inválido no corpo da requisição."
}
```

com status HTTP `400` ou `400`.

---

# 3. Usuários

Todas as operações relacionadas aos usuários utilizam o prefixo:

```text
/api/users
```

---

## 3.1 Criar usuário

### Endpoint

```http
POST /api/users/create
```

Cria um novo usuário.

O usuário é cadastrado com nome, e-mail e senha. A senha não é armazenada diretamente: antes da inserção no banco de dados, ela é transformada em um hash utilizando `bcrypt`.

### Body

```json
{
  "name": "Nome do usuário",
  "email": "usuario@email.com",
  "password": "Senha@123"
}
```

### Regras de validação

#### Nome

O campo `name`:

* é obrigatório;
* deve ser uma string;
* não pode estar vazio.

#### E-mail

O campo `email` deve possuir um formato de e-mail válido.

A validação exige:

* caracteres válidos antes do `@`;
* um domínio válido;
* pelo menos um ponto no domínio;
* uma extensão com pelo menos duas letras.

Exemplo válido:

```text
usuario@email.com
```

#### Senha

A senha deve:

* possuir pelo menos 6 caracteres;
* possuir pelo menos uma letra maiúscula;
* possuir pelo menos uma letra minúscula;
* possuir pelo menos um número;
* possuir pelo menos um caractere especial.

Exemplo válido:

```text
Senha@123
```

### Resposta de sucesso

**Status:** `201 Created`

```json
{
  "success": true,
  "message": "Usuário criado com sucesso."
}
```

### Possíveis erros

**400 Bad Request — Nome não informado**

```json
{
  "success": false,
  "message": "Nome é obrigatório."
}
```

**400 Bad Request — E-mail inválido**

```json
{
  "success": false,
  "message": "E-mail inválido."
}
```

**400 Bad Request — Senha inválida**

```json
{
  "success": false,
  "message": "Senha inválida. Sua senha deve conter pelo menos uma letra maiúscula e uma minúscula, pelo menos um caracter especial, pelo menos um número e de tamanho 6."
}
```

---

## 3.2 Login

### Endpoint

```http
POST /api/users/login
```

Realiza a autenticação de um usuário utilizando e-mail e senha.

A senha informada é comparada com o hash armazenado no banco de dados através do `bcrypt`.

### Body

```json
{
  "email": "usuario@email.com",
  "password": "Senha@123"
}
```

### Resposta de sucesso

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Login realizado com sucesso.",
  "user": {
    "...": "dados do usuário"
  }
}
```

O objeto `user` contém os dados retornados pelo banco de dados.

### Possíveis erros

**400 Bad Request — Dados obrigatórios não informados**

```json
{
  "success": false,
  "message": "E-mail e senha são obrigatórios."
}
```

**404 Not Found — Usuário não encontrado**

```json
{
  "success": false,
  "message": "Usuário não encontrado."
}
```

**400 Bad Request — Usuário sem senha**

```json
{
  "success": false,
  "message": "Usuário ainda não criou senha."
}
```

**401 Unauthorized — Senha incorreta**

```json
{
  "success": false,
  "message": "Senha incorreta."
}
```

---

## 3.3 Atualizar usuário

### Endpoint

```http
PUT /api/users/update
```

Atualiza apenas o nome de um usuário existente.

O ID do usuário é enviado no corpo da requisição.

### Body

```json
{
  "id": 1,
  "name": "Novo nome"
}
```

### Regras

O campo `name`:

* é obrigatório;
* deve ser uma string;
* não pode estar vazio.

O usuário informado pelo `id` precisa existir.

Além disso, o novo nome não pode ser exatamente igual ao nome atualmente cadastrado.

### Resposta de sucesso

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Usuário atualizado com sucesso."
}
```

### Possíveis erros

**400 Bad Request — Nome não informado**

```json
{
  "success": false,
  "message": "Nome é obrigatório."
}
```

**404 Not Found — Usuário não encontrado**

```json
{
  "success": false,
  "message": "Usuário não encontrado."
}
```

**409 Conflict — Nome igual ao atual**

```json
{
  "success": false,
  "message": "Nome idêntico ao inserido anteriormente."
}
```

---

## 3.4 Excluir usuário

### Endpoint

```http
DELETE /api/users/delete/:id
```

Remove um usuário pelo seu ID.

O ID deve ser informado como parâmetro da URL.

### Exemplo

```http
DELETE /api/users/delete/1
```

### Parâmetro

| Parâmetro | Tipo    | Obrigatório | Descrição                       |
| --------- | ------- | ----------- | ------------------------------- |
| `id`      | Integer | Sim         | ID do usuário que será removido |

### Resposta de sucesso

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Usuário removido com sucesso."
}
```

### Possíveis erros

**400 Bad Request — ID inválido**

```json
{
  "success": false,
  "message": "ID inválido."
}
```

**404 Not Found — Usuário não encontrado**

```json
{
  "success": false,
  "message": "Usuário não encontrado."
}
```

---

# 4. Músicas

As operações relacionadas à busca de músicas utilizam o prefixo:

```text
/api/reviews
```

---

## 4.1 Buscar músicas

### Endpoint

```http
POST /api/reviews/search
```

Realiza uma busca de músicas utilizando o nome informado.

O controller recebe o campo `nome` e encaminha a busca para a função responsável pela consulta à API do Spotify.

### Body

```json
{
  "nome": "Nome da música"
}
```

### Regras de validação

O campo `nome`:

* é obrigatório;
* deve ser uma string;
* não pode estar vazio.

### Resposta de sucesso

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Músicas encontradas.",
  "musicas": [
    "... resultados encontrados ..."
  ]
}
```

O conteúdo do campo `musicas` corresponde aos resultados retornados pela função de consulta à API do Spotify.

### Possíveis erros

**400 Bad Request — Nome inválido**

```json
{
  "success": false,
  "message": "Informe um nome válido."
}
```

**404 Not Found — Nenhuma música encontrada**

```json
{
  "success": false,
  "message": "Músicas não encontradas."
}
```

---

# 5. Resumo dos endpoints

| Método   | Endpoint                | Descrição                     |
| -------- | ----------------------- | ----------------------------- |
| `POST`   | `/api/users/create`     | Cria um usuário               |
| `POST`   | `/api/users/login`      | Realiza login                 |
| `PUT`    | `/api/users/update`     | Atualiza o nome de um usuário |
| `DELETE` | `/api/users/delete/:id` | Remove um usuário             |
| `POST`   | `/api/reviews/search`   | Busca músicas                 |

---

# 6. Erro inesperado.

Em situações de erro inesperado, os controllers retornam também o campo `detail`, contendo a mensagem do erro capturado.
Exemplo:

```json
{
  "success": false,
  "message": "Erro inesperado.",
  "detail": "Descrição do erro"
}
```

---

# 7. Estrutura das rotas

As rotas são organizadas da seguinte forma:

```text
/api
├── /users
│   ├── POST   /create
│   ├── PUT    /update
│   ├── DELETE /delete/:id
│   └── POST   /login
│
└── /reviews
    └── POST   /search
```

Os arquivos de rotas são responsáveis por associar cada endpoint ao respectivo controller.

---

# 10. Observações

* As requisições que possuem corpo devem utilizar JSON.
* O endpoint de atualização altera somente o nome do usuário.
* A exclusão de usuário é realizada através do ID informado na URL.
* A busca de músicas depende da função de consulta à API do Spotify implementada no projeto.
* O comportamento e as mensagens de erro descritos nesta documentação correspondem às validações atualmente implementadas nos controllers.