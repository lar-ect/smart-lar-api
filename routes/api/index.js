const router = require('express').Router();

router.get('/', (req, res) => {
	res.json({ 
		result: 'OK', 
		code: 200, 
		message: 'Bem vindo a API do LAR' 
	});
});

module.exports = router;