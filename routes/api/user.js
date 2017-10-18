const router = require('express').Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');

/**
 * @api {get} /user Lista os usuários
 * @apiName getAllUsers
 * @apiGroup User
 * 
 * @apiSampleRequest "http://lar.ect.ufrn.br/api/v1/user"
 */
router.get('/', async (req, res) => {
	const users = await User.find({});
	res.json(users);
});

/**
 * @api {get} /user/:identificador Recupera um usuário
 * @apiName getUser
 * @apiGroup User
 * @apiParam {String} identificador Matrícula, RFID ou ID no banco.
 * 
 *  @apiExample Example usage:
 * curl -i http://lar.ect.ufrn.br/api/v1/user/2013023070
 * 
 * @apiSuccess {String}   _id           ID do usuário no banco
 * @apiSuccess {String}   matricula     Matrícula
 * @apiSuccess {String}   nome          Nome
 * @apiSuccess {String}   sobrenome     Sobrenome
 * @apiSuccess {String}   email       	E-mail
 * @apiSuccess {String}   rfid   				Código RFID de entrada
 * @apiSuccess {String[]} grupos			  Lista de grupos do usuário
 */
router.get('/:identificador', async (req, res) => {
	try {
		const identificador = req.params.identificador;
		let user;
		if (mongoose.Types.ObjectId.isValid(identificador)) {
			user = await User.findOne({ _id: identificador });
		}
		else {
			user = await User.findOne({ $or: [
				{ matricula: identificador },
				{ rfid: identificador },
			]});
		}

		res.json(user);
	} catch (err) {
		res.json(err);
	}
});

/**
 * @api {post} /user/ Salva um novo usuário
 * @apiName saveUser
 * @apiGroup User
 * @apiParam {String} nome Nome
 * @apiParam {String} sobrenome Sobrenome
 * @apiParam {String} matricula Matrícula
 * @apiParam {String} email E-mail
 * @apiParam {String} telefone Telefone
 * @apiParam {String} rfid Código RFID
 */
router.post('/', async (req, res) => {
	try {
		const user = await new User(req.body).save();
		res.sendStatus(200);
		res.json(user);
	} catch (err) {
		res.json(err);
	}
});

/**
 * @api {put} /user/:id Atualiza um usuário
 * @apiName updateUser
 * @apiGroup User
 * 
 * @apiParam {String} nome Nome
 * @apiParam {String} sobrenome Sobrenome
 * @apiParam {String} matricula Matrícula
 * @apiParam {String} email E-mail
 * @apiParam {String} telefone Telefone
 * @apiParam {String} rfid Código RFID
 */
router.put('/:id', async (req, res) => {
	try {
		const user = await User.findOneAndUpdate({ _id: req.params.id }, req.body, {
			new: true,
			runValidators: true,
			context: 'query'
		}).exec();
		res.sendStatus(200);
		res.json(user);
	} catch (err) {
		res.json(err);
	}
});

module.exports = router;