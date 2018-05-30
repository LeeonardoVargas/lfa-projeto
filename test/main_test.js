const assert = require('assert');
const MainFile = require('../main');

describe('Main', function () {
    describe('#interpretaRegra', function () {
        let automato;
        let estadosFinais;

        beforeEach('Cria variáveis', function () {
            automato = {};
            estadosFinais = [];
        });

        it('adiciona transição normal ao objeto de retorno', function (done) {
            const regra = '<A>::=a<A>';
            const automatoEsperado = { A0: { a: ['A0'] } };
            MainFile.interpretaRegra(regra, automato, estadosFinais, 0);

            assert.deepEqual(automato, automatoEsperado);
            assert.deepEqual([], estadosFinais);
            done();
        });

        it('marca como estado final quando há epsilon transição', function (done) {
            const regra = `<A>::=${MainFile.SIMBOLO_EPSILON}`;
            MainFile.interpretaRegra(regra, automato, estadosFinais, 0);

            assert.deepEqual({ A0: {} }, automato);
            assert.deepEqual(['A0'], estadosFinais);
            done();
        });

        it('cria estado final quando é só símbolo terminal', function(done) {
            const regra = `<A>::=a`;
            const automatoEsperado = {
                A0: {
                    a: ['TaA0']
                },
                TaA0: {}
            };
            MainFile.interpretaRegra(regra, automato, estadosFinais, 0);

            assert.deepEqual(automato, automatoEsperado);
            assert.deepEqual(['TaA0'], estadosFinais);
            done();
        });

        it('trata transição normal, com epsilon e com símbolo terminal', function(done) {
            const regra = `<A>::=a<A>|b|${MainFile.SIMBOLO_EPSILON}`;
            const automatoEsperado = {
                A0: {
                    a: ['A0'],
                    b: ['TbA0']
                },
                TbA0: {}
            };
            const estadosFinaisEsperado = ['TbA0', 'A0'];
            MainFile.interpretaRegra(regra, automato, estadosFinais, 0);

            assert.deepEqual(automato, automatoEsperado);
            assert.deepEqual(estadosFinais, estadosFinaisEsperado);
            done();
        });

        it('usa o mesmo estado inicial para diferentes gramáticas', function (done) {
            const automatoEsperado = {
                S: {
                    a: ['A0', 'A1'],
                    b: ['A0'],
                    c: ['A1']
                },
                A0: { a: ['S'] },
                A1: { a: ['S'] }
            };
            const regras0 = ['<S>::=a<A>|b<A>', '<A>::=a<S>'];
            const regras1 = ['<S>::=a<A>|c<A>', '<A>::=a<S>'];

            regras0.forEach((regra) => {
                MainFile.interpretaRegra(regra, automato, estadosFinais, 0);
            });
            regras1.forEach((regra) => {
                MainFile.interpretaRegra(regra, automato, estadosFinais, 1);
            });

            assert.deepEqual(automato, automatoEsperado);
            done();
        });
    });

    describe('#interpretaToken', function () {
        let automato;
        let estadosFinais;

        beforeEach('Cria variáveis', function () {
            automato = {};
            estadosFinais = [];
        });

        it('cria estados normais e finais', function (done) {
            const automatoEsperado = {
                S: { l: ['Palavra0_Estado0'] },
                Palavra0_Estado0: { o: ['Palavra0_Estado1'] },
                Palavra0_Estado1: { b: ['Palavra0_Estado2'] },
                Palavra0_Estado2: { o: ['Palavra0_EstadoFinal'] },
                Palavra0_EstadoFinal: {}
            };
            const estadosFinaisEsperado = ['Palavra0_EstadoFinal'];

            MainFile.interpretaToken('lobo', automato, estadosFinais, 0);
            assert.deepEqual(automato, automatoEsperado);
            assert.deepEqual(estadosFinais, estadosFinaisEsperado);
            done();
        });

        it('cria indeterminização para tokens com a mesma letra inicial', function (done) {
            const automatoEsperado = {
                S: { l: ['Palavra0_Estado0', 'Palavra1_Estado0'] },
                Palavra0_Estado0: { o: ['Palavra0_EstadoFinal'] },
                Palavra0_EstadoFinal: {},
                Palavra1_Estado0: { a: ['Palavra1_EstadoFinal'] },
                Palavra1_EstadoFinal: {}
            };
            const estadosFinaisEsperado = ['Palavra0_EstadoFinal'];

            MainFile.interpretaToken('lo', automato, estadosFinais, 0);
            MainFile.interpretaToken('la', automato, estadosFinais, 1);
            assert.deepEqual(automato, automatoEsperado);
            assert.deepEqual(estadosFinais, estadosFinaisEsperado);
            done();
        });
    });
});