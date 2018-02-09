const router = require('express').Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const PermissaoAcessoLab = mongoose.model('PermissaoAcessoLab');

/**
 * @api {get} / Início
 * @apiName index
 * @apiGroup Index
 * 
 * @apiSampleRequest http://lar.ect.ufrn.br:8080/api/v1
 */
router.get('/', (req, res) => {
	res.json({
		result: 'OK', 
		code: 200, 
		message: 'Bem vindo a API do LAR' 
	});
});

router.use('/user', require('./user'));
router.use('/acesso', require('./acesso'));

router.get('/verificar-entrada/:rfid', async (req, res) => {
	const rfid = req.params.rfid;
	const user = await User.findOne({ rfid });
	if(user==null){
		res.json(false);
		return;
	}
	const permissaoAcesso = await PermissaoAcessoLab.findOne({ user: user.id });
	if (permissaoAcesso && permissaoAcesso.acesso) {
		res.json(true);
	}
	else {
		res.json(false);
	}
});

router.get('/permitir-acesso/:matricula', async (req, res) => {
	const matricula = req.params.matricula;
	const user = await User.findOne({ matricula });
	const permissaoEntrada = new PermissaoAcessoLab({user, acesso: true});
	await permissaoEntrada.save();
	res.json('OK');
});

module.exports = router;