const assert = require('assert');
const DeterminizaAutomato = require('../determiniza_automato');
const Constantes = require ('../constantes');
const GeralTest = require('./geral_test');

const juntaEstados = arrayEstados => arrayEstados.join(Constantes.SIMBOLO_SEPARADOR);

describe('DeterminizaAutomato', function() {
    describe('#execute', function () {
        it('cria estado a partir de indeterminização', function(done) {
            let entrada = {
                A: {
                    b: new Set(['B', 'BB']),
                },
                B: {},
                BB: {},
            };
            const estadosFinais = new Set;
            const automatoEsperado = {
                A: {
                    b: new Set(['B#BB']),
                },
                B: {},
                BB: {},
                [juntaEstados(['B', 'BB'])]: {},
            };

            DeterminizaAutomato.execute(
                entrada,
                estadosFinais
            );

            assert.deepStrictEqual(entrada, automatoEsperado);
            done();
        });

        it('não remove estados', function(done) {
            let entrada = {
                A: {
                    b: new Set(['B', 'BB']),
                },
                B: {},
                BB: {},
            };
            const estadosFinais = new Set;
            const automatoEsperado = {
                A: {
                    b: new Set(['B#BB']),
                },
                B: {},
                BB: {},
                [juntaEstados(['B', 'BB'])]: {},
            };

            DeterminizaAutomato.execute(
                entrada,
                estadosFinais
            )

            assert.deepStrictEqual(entrada, automatoEsperado);
            done();
        });

        it('adiciona novo estado aos estados finais se o primeiro dos estados mesclados for final', function(done) {
            let entrada = {
                A: {
                    b: new Set(['B', 'BB']),
                },
                B: {},
                BB: {},
            };
            let estadosFinais = new Set(['B']);
            const estadosFinaisEsperado = new Set(['B', juntaEstados(['B', 'BB'])]);

            DeterminizaAutomato.execute(
                entrada,
                estadosFinais
            )

            assert.deepStrictEqual(estadosFinais, estadosFinaisEsperado);
            done();
        });

        it('adiciona novo estado aos estados finais se o segundo dos estados mesclados for final', function(done) {
            let entrada = {
                A: {
                    b: new Set(['B', 'BB']),
                },
                B: {},
                BB: {},
            };
            let estadosFinais = new Set(['BB']);

            DeterminizaAutomato.execute(
                entrada,
                estadosFinais
            )

            assert.deepStrictEqual(estadosFinais, new Set(['BB', 'B#BB']));
            done();
        });

        it('adiciona novo estado aos estados finais se ambos estados mesclados forem finais', function(done) {
            let entrada = {
                A: {
                    b: new Set(['B', 'BB']),
                },
                B: {},
                BB: {},
            };
            let estadosFinais = new Set(['B', 'BB']);
            const estadosFinaisEsperado = new Set(['B', 'BB', 'B#BB', juntaEstados(['B', 'BB'])]);

            DeterminizaAutomato.execute(
                entrada,
                estadosFinais
            )

            assert.deepStrictEqual(estadosFinais, estadosFinaisEsperado);
            done();
        });

        it('mescla corretamente 3 estados sem transições', function(done) {
            let entrada = {
                A: {
                    b: new Set(['B', 'BB', 'BBB']),
                },
                B: {},
                BB: {},
                BBB: {},
            };
            let estadosFinais = new Set(['B', 'BB', 'BBB']);
            const automatoEsperado = {
                A: {
                    b: new Set(['B#BB#BBB']),
                },
                B: {},
                BB: {},
                BBB: {},
                [juntaEstados(['B', 'BB', 'BBB'])]: {},
            };
            const estadosFinaisEsperado = new Set(['B', 'BB', 'BBB', juntaEstados(['B', 'BB', 'BBB'])]);

            DeterminizaAutomato.execute(
                entrada,
                estadosFinais
            )

            assert.deepStrictEqual(entrada, automatoEsperado);
            assert.deepStrictEqual(estadosFinais, estadosFinaisEsperado);
            done();
        });

        it('adiciona as transições dos velhos estados ao novo estado', function(done) {
            let entrada = {
                A: {
                    b: new Set(['B', 'BB']),
                },
                B: { c: new Set(['C']) },
                BB: { cc: new Set(['CC']) },
                C: {},
                CC: {},
            };
            const estadosFinais = new Set;
            const automatoEsperado = {
                A: {
                    b: new Set(['B#BB'])
                },
                B: { c: new Set(['C']) },
                BB: { cc: new Set(['CC']) },
                [juntaEstados(['B', 'BB'])]: {
                    c: new Set(['C']),
                    cc: new Set(['CC']),
                },
                C: {},
                CC: {},
            };

            DeterminizaAutomato.execute(
                entrada,
                estadosFinais
            )

            assert.deepStrictEqual(entrada, automatoEsperado);
            done();
        });

        it('adiciona transições únicas ao novo estado', function(done) {
            let entrada = {
                A: {
                    b: new Set(['B', 'BB'])
                },
                B: { c: new Set(['C']) },
                BB: { c: new Set(['C']) },
                C: {},
            };
            const estadosFinais = new Set;
            const automatoEsperado = {
                A: {
                    b: new Set(['B#BB'])
                },
                B: { c: new Set(['C']) },
                BB: { c: new Set(['C']) },
                [juntaEstados(['B', 'BB'])]: {
                    c: new Set(['C']),
                },
                C: {},
            };

            DeterminizaAutomato.execute(
                entrada,
                estadosFinais
            )

            assert.deepStrictEqual(entrada, automatoEsperado);
            done();
        });
    });

    it('determiniza estado criado a partir de uma indeterminização', function (done) {
        let entrada = {
                A: {
                    b: new Set(['B', 'BB']),
                },
                B: { c: new Set(['C']), },
                BB: {
                    c: new Set(['D']),
                },
                C: { d: new Set(['D']) },
                D: {},
            };
            const estadosFinais = new Set;
            const automatoEsperado = {
                A: {
                    b: new Set(['B#BB']),
                },
                [juntaEstados(['B', 'BB'])]: {
                    c: new Set(['C#D']),
                },
                [juntaEstados(['C', 'D'])]: {
                    d: new Set(['D']),
                },
                B: { c: new Set(['C']) },
                C: { d: new Set(['D']) },
                BB: {
                    c: new Set(['D'])
                },
                D: {},
            };

            DeterminizaAutomato.execute(
                entrada,
                estadosFinais
            )

            assert.deepStrictEqual(entrada, automatoEsperado);
            done();
    });

    it('determiniza estado criado a partir de uma indeterminização [nível 2]', function (done) {
        let entrada = {
                A: {
                    b: new Set(['B', 'BB']),
                },
                B: { c: new Set(['C']), },
                BB: {
                    c: new Set(['D']),
                },
                C: {
                    d: new Set(['D']),
                    k: new Set(['D']),
                },
                D: {
                    k: new Set(['Z']),
                },
                Z: {}
            };
            const estadosFinais = new Set;
            const automatoEsperado = {
                A: {
                    b: new Set(['B#BB']),
                },
                [juntaEstados(['B', 'BB'])]: {
                    c: new Set(['C#D']),
                },
                [juntaEstados(['C', 'D'])]: {
                    d: new Set(['D']),
                    k: new Set(['D#Z']),
                },
                BB: {
                    c: new Set(['D'])
                },
                B: {
                    c: new Set(['C'])
                },
                C: {
                    d: new Set(['D']),
                    k: new Set(['D']),
                },
                Z: {},
                D: {
                    k: new Set(['Z']),
                },
                [juntaEstados(['D', 'Z'])]: {
                    k: new Set(['Z']),
                },
            };

            DeterminizaAutomato.execute(
                entrada,
                estadosFinais
            )
            assert.deepStrictEqual(entrada, automatoEsperado);
            done();
    });
});