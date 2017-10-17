const router = require('express').Router();
const mongoose = require('mongoose');
const PermissaoAcessoLab = mongoose.model('PermissaoAcessoLab');
const AcessoLab = mongoose.model('AcessoLab');
const User = mongoose.model('User');

/**
 * @api {get} /acesso/entrada/:rfid Registrar entrada
 * @apiName registrarEntrada
 * @apiGroup Acesso
 * 
 * @apiParam {String} rfid Código RFID
 * 
 *  @apiExample Example usage:
 * curl -i http://lar.ect.ufrn.br:8080/acesso/entrada/3EB89F2C
 * 
 * @apiError BadRequest 			Há um acesso aberto cadastrado no banco para o RFID.
 * @apiError Unauthorized   Permissão negada para o RFID
 * @apiErrorExample Resposta (exemplo):
 *     HTTP/1.1 400 Bad request
 *     {
 *       "message": "Há um acesso aberto cadastrado no banco para o RFID"
 *     }
 */
router.get('/entrada/:rfid', async (req, res) => {
	const rfid = req.params.rfid;
	const permissao = await PermissaoAcessoLab.findOne({ rfid });
	if (permissao && permissao.user && permissao.acesso) {
		const acessoPrevio = await AcessoLab.findOne({ user: permissao.user, timestampSaida: null });
		if (acessoPrevio) {
			res.status(400).json({ message: `Há um acesso aberto cadastrado no banco para o RFID ${rfid}` });
		}
		else {
			const acesso = await new AcessoLab({ user: permissao.user, rfid }).save();
			res.status(200).json(acesso);
		}
	}
	else {
		res.status(401).json({ message: `Permissão negada para o RFID ${rfid}` });
	}
});

/**
 * @api {get} /acesso/saida/:rfid Registrar saída
 * @apiName registrarSaida
 * @apiGroup Acesso
 * 
 * @apiParam {String} rfid Código RFID
 * 
 *  @apiExample Example usage:
 * curl -i http://lar.ect.ufrn.br:8080/acesso/saida/3EB89F2C
 */
router.get('/saida/:rfid', async (req, res) => {
	const rfid = req.params.rfid;
	const permissao = await PermissaoAcessoLab.findOne({ rfid });

	if (permissao && permissao.user && permissao.acesso) {
		let acesso = await AcessoLab.findOne({ rfid, timestampSaida: null }, {}, {
			sort: { timestampEntrada: -1 }
		});

		if (acesso) {
			acesso.timestampSaida = Date.now();
			acesso = await acesso.save();
			res.status(200).json(acesso);
		}
		else {
			res.status(400).json({ message: `Não foi encontrado um acesso para o RFID ${rfid}` });
		}
	}
	else {
		res.status(401).json({ message: `Permissão negada para o RFID ${rfid}` });
	}
});

/**
 * @api {get} /acesso/autorizar/:identificador Autorizar acesso
 * @apiName autorizarAcesso
 * @apiGroup Acesso
 * 
 * @apiParam {String} identificador Matrícula ou rfid
 * 
 *  @apiExample Example usage:
 * curl -i http://lar.ect.ufrn.br:8080/acesso/autorizar/3EB89F2C
 */
router.get('/autorizar/:identificador', async (req, res) => {
	const identificador = req.params.identificador;
	const user = await User.findOne({ 
		$or: [ 
			{ rfid: identificador },
			{ matricula: identificador }
		]
	});

	let permissao = await PermissaoAcessoLab.findOne({ user: user.id });
	if (!permissao) {
		permissao = new PermissaoAcessoLab({
			user: user.id,
			rfid: user.rfid,
			acesso: true
		});
		await permissao.save();
		res.status(200).json(permissao);
	}
	else if (!permissao.acesso) {
		permissao.acesso = true;
		await permissao.save();
		res.status(200).json(permissao);
	}
	else {
		res.status(400).json({ message: 'Usuário já possui acesso' });
	}
});

module.exports = router;