//1 requires
const express = require("express");
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const mysql_config = require('./inc/mysql_config');
const functions = require('./inc/functions');

//2 criação de duas constantes para a verificação da disponibilidade da API e da versão da API
const API_AVAILABILITY = true;
const API_VERSION = '1.0.0';

//3 iniciar o server
const app = express();
app.listen(3000, () => {
    console.log("API está executando");
});

// Middleware para parsing do corpo da requisição
app.use(bodyParser.json());

//4 checar se API está disponível
app.use((req, res, next) => {
    if (API_AVAILABILITY) {
        next();
    } else {
        res.json(functions.response('atenção', 'API está em manutenção. Sinto muito', 0, null));
    }
});

//5 mysql connection
const connection = mysql.createConnection(mysql_config);

//6 cors
app.use(cors());

//7 rotas
//rota inicial que vai dizer que a API está disponível
app.get('/', (req, res) => {
    res.json(functions.response('sucesso', 'API está rodando', 0, null));
});

//9 rota para pegar todas as tarefas
app.get("/tasks", (req, res) => {
    connection.query('SELECT * FROM tasks', (err, rows) => {
        if (!err) {
            res.json(functions.response('sucesso', 'Tarefas recuperadas com sucesso', rows.length, rows));
        } else {
            res.json(functions.response('erro', err.message, 0, null));
        }
    });
});

//10 rota para pegar a task pelo id
app.get('/tasks/:id', (req, res) => {
    const id = req.params.id;
    connection.query('SELECT * FROM tasks WHERE id = ?', [id], (err, rows) => {
        if (!err) {
            // devolver os dados da task
            if (rows.length > 0) {
                res.json(functions.response('sucesso', 'Sucesso na pesquisa', rows.length, rows));
            } else {
                res.json(functions.response('atenção', 'Não foi possível encontrar a task solicitada', 0, null));
            }
        } else {
            res.json(functions.response('erro', err.message, 0, null));
        }
    });
});

//11 Atualizar o status de uma task . método put
app.put('/tasks/:id/status', (req, res) => {
    const id = req.params.id;
    const status = req.body.status; // status deve ser passado no corpo da requisição

    // Lógica para atualizar o status da task
    connection.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id], (err, results) => {
        if (!err) {
            if (results.affectedRows > 0) {
                res.json(functions.response('sucesso', 'Status atualizado com sucesso', results.affectedRows, null));
            } else {
                res.json(functions.response('atenção', 'Task não encontrada', 0, null));
            }
        } else {
            res.json(functions.response('erro', err.message, 0, null));
        }
    });
});

//8 middleware para caso alguma rota não seja encontrada
app.use((req, res) => {
    res.status(404).json(functions.response('atenção', 'Rota não encontrada', 0, null));
});
