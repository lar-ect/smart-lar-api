const grupos = ['ALUNO', 'TECNICO', 'PROFESSOR', 'ADMINISTRADOR'];

const gruposPorPermissao = {
	// Questões
	// READ_QUESTAO: ['USUARIO', 'ALUNO', 'MONITOR', 'PROFESSOR'],
	// CREATE_QUESTAO: ['MONITOR', 'PROFESSOR'],
	// UPDATE_QUESTAO: ['MONITOR', 'PROFESSOR'],
	// DELETE_QUESTAO: ['MONITOR', 'PROFESSOR'],
	// VER_SOLUCAO_QUESTAO: ['MONITOR', 'PROFESSOR'],
	// VER_QUESTOES_OCULTAS: ['PROFESSOR'],
	
	// Gerência
	VER_GERENCIADOR: ['PROFESSOR', 'MONITOR']
};

exports.grupos = grupos;

exports.isProfessor = (user) => {
	return user && user.grupos.includes('PROFESSOR');
};

exports.isAdmin = (user) => {
	return user && user.grupos.includes('ADMINISTRADOR');
};

exports.isApoioTecnico = (user) => {
	return user && user.grupos.includes('TECNICO');
};

exports.temPermissao = (user, permissao) => {
	if (user && user.grupos.includes('ADMINISTRADOR')) {
		return true;
	}
	let retorno = false;
	
	if (user) {
		user.grupos.forEach(grupo => {
			if (gruposPorPermissao[permissao].includes(grupo)) {
				retorno = true;
			}
		});
	}
	return retorno;
};