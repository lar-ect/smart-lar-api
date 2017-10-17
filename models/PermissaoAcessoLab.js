const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

/**
 * Representa os usuários que possuem permissão de acesso ao laboratório
 */
const permissaoAcessoLabSchema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	rfid: {
		type: String,
		trim: true,
		required: 'É necessário fornecer um RFID para cadastrar uma permissão'
	},
	acesso: {
		type: Boolean,
		default: false
	}
});

module.exports = mongoose.model('PermissaoAcessoLab', permissaoAcessoLabSchema);
