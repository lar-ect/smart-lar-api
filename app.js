const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const isProduction = process.env.NODE_ENV === 'production';

// Assegura que o servidor está rodando com node >= 7.6
const [major, minor] = process.versions.node.split('.').map(parseFloat);
if (major < 7 || (major === 7 && minor <= 5)) {
  console.log(`
    🛑 O servidor está rodando com Node.js em uma versão menor do que 7.6
    Este projeto utiliza funções recentes do Node.js como async/await para lidar com código de execução assíncrona.
    Por favor atualize a versão do Node.js para >= 7.6!
  `);
  process.exit();
}

// Importa as variáveis de ambiente do arquivo variables.env
// Variáveis podem ser acessadas através de process.env.NOME_DA_VARIAVEL
require('dotenv').config({ path: 'variables.env' });

// Conecta com o banco de dados e lida com problemas de conexão
mongoose.connect(process.env.DATABASE, { useMongoClient: true });
mongoose.Promise = global.Promise; // → queremos que o mongoose utilize promises ES6
mongoose.connection.on('error', err => {
  console.error(`🙅 🚫 → ${err.message}`);
});

// Import todos os models do projeto para que possamos utilizar em qualquer parte do sistema
// Criar uma função utilitária no futuro que faz o require em todos os arquivos .js da pasta dominio
// require('./dominio/User');

const app = express();

// Transforma as requisições do tipo raw em propriedades do request em req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Biblioteca de logs
app.use(morgan('tiny'));

if (isProduction) {
  app.set('trust proxy', true); // trust first proxy
}

// Requisita as rotas da api
app.use('/', require('./routes'));

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (!isProduction) {
  app.use(function(err, req, res, next) {
    console.log(err.stack);

    res.status(err.status || 500);

    res.json({'errors': {
      message: err.message,
      error: err
    }});
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({'errors': {
    message: err.message,
    error: {}
  }});
});

// Inicializa o servidor
app.set('port', process.env.PORT || 8080);
const server = app.listen(app.get('port'), () => {
  console.log(`Servidor rodando na porta: ${server.address().port}`);
});