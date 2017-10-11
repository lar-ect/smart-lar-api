const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

/**
 * Representa o status de presença dos usuários do laboratório em tempo real
 */
const presencaLabSchema = new mongoose.Schema({
	user: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	presente: {
		type: Boolean,
		default: false
	}
});

module.exports = mongoose.model('PresencaLab', presencaLabSchema);
