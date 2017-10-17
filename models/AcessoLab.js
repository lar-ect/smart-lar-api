const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

/**
 * Representa os horários de um acesso para um usuário
 */
const acessoLabSchema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	timestampEntrada: {
		type: Date,
		default: Date.now
	},
	timestampSaida: Date,
	rfid: {
		type: String,
		trim: true,
		required: 'É necessário fornecer um RFID'
	}
});

module.exports = mongoose.model('AcessoLab', acessoLabSchema);
