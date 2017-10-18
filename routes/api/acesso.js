const router = require('express').Router();
const mongoose = require('mongoose');
const PermissaoAcessoLab = mongoose.model('PermissaoAcessoLab');
const AcessoLab = mongoose.model('AcessoLab');
const User = mongoose.model('User');

/**
 * @api {get} /acesso/autorizar/:identificador Autorizar acesso
 * @apiName autorizarAcesso
 * @apiGroup Acesso
 * 
 * @apiParam {String} identificador Matrícula ou RFID
 * 
 * @apiExample Exemplo com RFID
 * curl -i http://lar.ect.ufrn.br/api/v1/acesso/autorizar/3EB89F2C
 * 
 * @apiExample Exemplo com Matrícula
 * curl -i http://lar.ect.ufrn.br/api/v1/acesso/autorizar/2013023070
 * 
 * @apiSuccessExample {json} Sucesso
 * HTTP/1.1 200 OK
 * {
 * 	"mensagem": "Usuário autorizado com sucesso",
 *  "dados": {
 * 		"rfid": "3EB89F2C",
 * 		"acesso": true
 *  }
 * }
 * 
 * @apiErrorExample Identificador inválido
 * HTTP/1.1 400 BadRequest
 * {
 * 	"message": "Nenhum usuário encontrado para o identificador"
 * }
 * 
 * @apiErrorExample Acesso já existe
 * HTTP/1.1 400 BadRequest
 * {
 * 	"message": "Usuário já possui acesso"
 * }
 */
router.get('/autorizar/:identificador', async (req, res) => {
	const identificador = req.params.identificador;
	const user = await User.findOne({ 
		$or: [ 
			{ rfid: identificador },
			{ matricula: identificador }
		]
	});

	if (!user) {
		res.status(400).json({ message: `Nenhum usuário encontrado para o identificador ${identificador}` });
		return;
	}

	let permissao = await PermissaoAcessoLab.findOne({ user: user.id });
	if (!permissao) {
		permissao = new PermissaoAcessoLab({
			user: user.id,
			rfid: user.rfid,
			acesso: true
		});
		await permissao.save();
		res.status(200).json({
			mensagem: 'Usuário autorizado com sucesso',
			dados: {
				rfid: permissao.rfid,
				acesso: permissao.acesso
			}
		});
	}
	else if (!permissao.acesso) {
		permissao.acesso = true;
		await permissao.save();
		res.status(200).json({
			mensagem: 'Usuário autorizado com sucesso',
			dados: {
				rfid: permissao.rfid,
				acesso: permissao.acesso
			}
		});
	}
	else {
		res.status(400).json({ message: 'Usuário já possui acesso' });
	}
});

/**
 * @api {get} /acesso/desautorizar/:identificador Desautorizar acesso
 * @apiName desautorizarAcesso
 * @apiGroup Acesso
 * 
 * @apiParam {String} identificador Matrícula ou RFID
 * 
 * @apiExample Exemplo com RFID
 * curl -i http://lar.ect.ufrn.br/api/v1/acesso/desautorizar/3EB89F2C
 * 
 * @apiExample Exemplo com Matrícula
 * curl -i http://lar.ect.ufrn.br/api/v1/acesso/desautorizar/2013023070
 * 
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *  "mensagem": "Usuário desautorizado com sucesso",
 *  "dados": {
 *		"rfid": "3EB89F2C",
 *		"acesso": false
 * 	}
 * }
 * 
 * @apiErrorExample Identificador inválido
 * HTTP/1.1 400 BadRequest
 * {
 *   "message": "Nenhum usuário encontrado para o identificador"
 * }
 * 
 * @apiErrorExample Acesso já existe
 * HTTP/1.1 400 BadRequest
 * {
 *   "message": "Usuário já possui acesso"
 * }
 */
router.get('/desautorizar/:identificador', async (req, res) => {
	const identificador = req.params.identificador;
	const user = await User.findOne({ 
		$or: [ 
			{ rfid: identificador },
			{ matricula: identificador }
		]
	});

	if (!user) {
		res.status(400).json({ message: 'Nenhum usuário encontrado para o identificador' });
		return;
	}

	let permissao = await PermissaoAcessoLab.findOne({ user: user.id });
	if (!permissao) {
		res.status(400).json({ message: 'Nenhuma permissão de acesso encontrada para o usuário' });
		return;
	}
	else if (permissao.acesso) {
		permissao.acesso = false;
		await permissao.save();
	}

	res.status(200).json({
		rfid: permissao.rfid,
		acesso: permissao.acesso
	});
});

/**
 * @api {get} /acesso/entrada/:rfid Registrar entrada
 * @apiName registrarEntrada
 * @apiGroup Acesso
 * 
 * @apiParam {String} rfid Código RFID
 * 
 *  @apiExample RFID
 * curl -i http://lar.ect.ufrn.br/api/v1/acesso/entrada/3EB89F2C
 * 
 * @apiSuccessExample {json} Sucesso:
 *     HTTP/1.1 200 OK
 *		 {
 * 			"entrada": true,
 * 			"mensagem": "Entrada registrada com sucesso",
 * 			"dados": {
 *				"rfid": "3EB89F2C",
 *				"timestampEntrada": "2017-10-18T17:30:47.812Z"
 * 			}
 *		 }
 * 
 * @apiErrorExample Acesso já aberto
 *     HTTP/1.1 400 BadRequest
 *     {
 *       "message": "Há um acesso aberto cadastrado no banco para o RFID fornecido"
 *     }
 * 
 * @apiErrorExample Permissão negada
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Permissão negada para o RFID fornecido"
 *     }
 */
router.get('/entrada/:rfid', async (req, res) => {
	const rfid = req.params.rfid;
	const permissao = await PermissaoAcessoLab.findOne({ rfid });
	if (permissao && permissao.user && permissao.acesso) {
		const acessoPrevio = await AcessoLab.findOne({ user: permissao.user, timestampSaida: null });
		if (acessoPrevio) {
			res.status(400).json({ message: 'Há um acesso aberto cadastrado no banco para o RFID fornecido' });
		}
		else {
			const acesso = await new AcessoLab({ user: permissao.user, rfid }).save();
			res.status(200).json({
				entrada: true,
				mensagem: 'Entrada registrada com sucesso',
				dados: {
					rfid: acesso.rfid,
					timestampEntrada: acesso.timestampEntrada
				}
			});
		}
	}
	else {
		res.status(401).json({ message: 'Permissão negada para o RFID fornecido' });
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
 * curl -i http://lar.ect.ufrn.br/api/v1/acesso/saida/3EB89F2C
 * @apiSuccessExample {json} Sucesso:
 *     HTTP/1.1 200 OK
 *		 {
 * 			"saida": true,
 * 			"mensagem": "Saída registrada com sucesso",
 * 			"dados": {
 *				"rfid": "3EB89F2C",
 *				"timestampEntrada": "2017-10-18T17:30:00.000Z",
 * 				"timestampSaida": "2017-10-18T19:45:00.000Z"
 * 			}
 *		 }
 * 
 * @apiErrorExample Acesso não encontrado
 *     HTTP/1.1 400 BadRequest
 *     {
 *       "message": "Não foi encontrado um acesso para o RFID fornecido"
 *     }
 * 
 * @apiErrorExample Permissão negada
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Permissão negada para o RFID fornecido"
 *     }
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
			res.status(200).json({
				saida: true,
				mensagem: 'Saída registrada com sucesso',
				dados: {
					rfid: acesso.rfid,
					timestampEntrada: acesso.timestampEntrada,
					timestampSaida: acesso.timestampSaida
				}
			});
		}
		else {
			res.status(400).json({ message: 'Não foi encontrado um acesso para o RFID fornecido' });
		}
	}
	else {
		res.status(401).json({ message: 'Permissão negada para o RFID fornecido' });
	}
});

module.exports = router;