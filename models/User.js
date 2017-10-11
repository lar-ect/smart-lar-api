const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const validator = require('validator');
const uniqueValidator = require('mongoose-unique-validator');

const permissoes = require('../lib/permissions');

/**
 * Representa um usuário para a API
 */
const userSchema = new mongoose.Schema({
	matricula: {
    type: String,
    unique: 'Matrícula já cadastrada no sistema',
    trim: true
	},
	nome: {
    type: String,
    required: 'Forneça um nome',
    trim: true
	},
	sobrenome: {
		type: String,
		required: 'Forneça um sobrenome',
		trim: true
	},
	telefone: {
		type: String,
		trim: true
	},
  email: {
    type: String,
    unique: 'Email já cadastrado no sistema',
    trim: true,
    validate: [validator.isEmail, 'Email inválido'],
  },
  grupos: {
    type: [String],
    enum: permissoes.grupos,
    default: ['ALUNO'],
    required: true
	},
	rfid: {
		type: String,
		trim: true
	}
});

module.exports = mongoose.model('User', userSchema);
