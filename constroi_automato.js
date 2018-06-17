const FileSystem = require('fs');
const Constantes = require('./constantes');

const execute = (automato, estadosFinais, alfabeto, caminhoArquivo) => {
    let arquivo;
    let error;

    try {
        arquivo = FileSystem.readFileSync(caminhoArquivo, 'utf8');
    } catch (erro) {
            console.error("Could not open file: %s", erro);
            process.exitCode = 1;
    }

    interpretaArquivo(arquivo, automato, alfabeto, estadosFinais);
};

const interpretaArquivo = (arquivo, automato, alfabeto, estadosFinais) => {
    const linhasArquivo = arquivo.split('\n');
    let entrada = [];
    let estados = [];
    let tabelaTransicao = {};
    let controle = 0;
    let ultimoControle = -1;
    linhasArquivo.forEach((linhaArquivo) => {
        const linhaAlterada = linhaArquivo.replace(/ /g, '');

        // Se for linha vazio, aumenta o número do controle e continua
        if (!linhaAlterada) {
            if (ultimoControle == controle) { controle++; }
            return;
        }

        if (linhaAlterada.match(/::=/)) { // Se for linha com regra
            interpretaRegra(linhaAlterada, automato, alfabeto, estadosFinais, controle);
            ultimoControle = controle;
        } else { // Se for linha com token
            interpretaToken(linhaAlterada, automato, alfabeto, estadosFinais, controle);
            ultimoControle = controle;
            controle++;
        }
    });
};

/**
* regraCompleta: Uma string no formato padrão de regras, sem espaço. Exemplo: <A>::=a<A>|b<B>|ε
* automato: Objeto que guarda o autômato onde as transições da regra serão salvas
* estadosFinais: Array que contém os estados finais do autômato presente em +autômato+
* numeroControle: Um inteiro que servirá de sufixo para os estados presentes na +regraCompleta+
*
* A função não retorna nada.
* Os exemplos nas instruções vão levar em conta esses parâmetros:
* "<S>::=a<A>|b<B>|c", {}, [], 1
*/
const interpretaRegra = (regraCompleta, automato, alfabeto, estadosFinais, numeroControle)  => {
    const [estado, regra] = regraCompleta.split('::='); // ['<S>', 'a<A>|b<B>|c']
    let estadoRegra = estado.replace(/[<>]/g, ''); // S
    const transicoes = regra.split('|'); // ['a<A>', 'b<B>', 'c']

    // Se o símbolo que dá nome à regra não for S, um número é adicionado no sufixo do estado
    if (estadoRegra != 'S') {
        estadoRegra = `${estadoRegra}${numeroControle}`;
    }

    automato[estadoRegra] = automato[estadoRegra] || {}; // { S: {} }

    transicoes.forEach((transicao) => {
        const [simboloTransicao, estadoTransicao] = transicao.split("<");
        let estadoTransicaoControle = estadoTransicao || "END";
        estadoTransicaoControle = estadoTransicaoControle.split('>')[0];

        // Se é epsilon transição e não tem símbolo não-terminal, marca como estado final
        if (simboloTransicao === Constantes.SIMBOLO_EPSILON){
            estadosFinais.add(estadoRegra);
            if (estadoTransicaoControle == "END")
                estadosFinais.add(`${estadoTransicaoControle}${numeroControle}`);
            return;
        }
        if(simboloTransicao) // Quando a transição da regra for: <A>, nesse acaso não entra, pois há tem simbolo.
            alfabeto.add(simboloTransicao);

        automato[estadoRegra][simboloTransicao] = automato[estadoRegra][simboloTransicao] || new Set; // { S: { a: [] } }

        // // Se é só símbolo terminal, cria estado final
        // if (!estadoTransicaoControle) {
        //     console.log("entrou:", transicao);
        //     const novoEstadoFinal = `T${simboloTransicao}${estadoRegra}`;
        //     estadosFinais.add(novoEstadoFinal);
        //     automato[estadoRegra][simboloTransicao].add(novoEstadoFinal);
        //     automato[novoEstadoFinal] = {};
        //     return;
        // };

        // Adiciona número no nome de estado se não for o inicial
        if (estadoTransicaoControle != 'S') {
            estadoTransicaoControle = `${estadoTransicaoControle}${numeroControle}`;
        }
        // Adiciona transição normal
        automato[estadoRegra][simboloTransicao].add(estadoTransicaoControle);  // { S: { a: ['A'] } }
    });
};

/**
* token: Uma string de uma palavra
* automato: Objeto que guarda o autômato onde as transições da regra serão salvas
* estadosFinais: Array que contém os estados finais do autômato presente em +autômato+
* numeroControle: Um inteiro que servirá de sufixo para os estados presentes na +regraCompleta+
*
* A função não retorna nada.
*/
const interpretaToken = (token, automato, alfabeto, estadosFinais, numeroControle) => {
    const caracteres = token.split('');

    // Inicializa estado S caso este não tenha sido inicializado
    automato['S'] = automato['S'] || {};

    caracteres.forEach((letra, indice) => {
        const estadoAtual = `Palavra${numeroControle}_Estado${indice}`;
        const estadoSeguinte = `Palavra${numeroControle}_Estado${indice + 1}`;
        alfabeto.add(letra);
        if (indice === 0) {
            automato['S'][letra] = automato['S'][letra] || new Set;
            automato['S'][letra].add(estadoSeguinte);
            automato[estadoSeguinte] = {};
            return;
        }

        automato[estadoAtual][letra] = new Set([estadoSeguinte]);
        automato[estadoSeguinte] = {};
    });

    estadosFinais.add(`Palavra${numeroControle}_Estado${caracteres.length}`)
};

module.exports = {
    execute,
    interpretaRegra,
    interpretaToken,
    interpretaArquivo
};
