// arquivo destinado à criação do banco de dados sqlite

// import a biblioteca para ler arquivos
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// importa a biblioteca para a conexão com o SQLite
import Database from "better-sqlite3";

const dir = "./src/db/data/";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const path = `${dir}/database.sqlite`
// cria ou abre o arquivo do banco
const db = new Database(path);

// lẽ o arquivo dos scripts para criação do banco e executa eles
const schema = fs.readFileSync("./src/db/data/schema.sql", "utf8");
db.exec(schema);

// exporta a conexão
export default db;