const router = require('express').Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const PermissaoAcessoLab = mongoose.model('PermissaoAcessoLab');

router.get('/', (req, res) => {
	res.json({ 
		result: 'OK', 
		code: 200, 
		message: 'Bem vindo a API do LAR' 
	});
});

router.get('/usuarios', async (req, res) => {
	const users = await User.find({});
	res.json(users);
});

router.get('/usuario/:matricula', async (req, res) => {
	const matricula = req.params.matricula;
	const user = await User.findOne({ matricula });
	res.json(user);
});

router.get('/verificar-entrada/:rfid', async (req, res) => {
	const rfid = req.params.rfid;
	const user = await User.findOne({ rfid });
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