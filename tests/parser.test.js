import analyseMessage from'../src/utils/parser.js';
import {describe, it, expect, } from '@jest/globals'

describe('Parser de mensagens', () => {
  it('reconhece estrutura válida com rótulos', () => {
    const texto = `autorizar dispositivo\nnome: Lucas Lira\nconta: 00100001245\ncpf: 60832730300`;
    const resultado = analyseMessage(texto);
    expect(resultado.valido).toBe(true);
    expect(resultado.nome).toBe('lucas lira');
  });

  it('reconhece estrutura válida sem rótulos', () => {
    const texto = `autorizar dispositivo\nLucas Lira\n00100001245\n60832730300`;
    const resultado = analyseMessage(texto);
    expect(resultado.valido).toBe(true);
  });

  it('detecta estrutura incompleta sem título', () => {
    const texto = `Lucas Lira\n00100001245\n60832730300`;
    const resultado = analyseMessage(texto);
    expect(resultado.incompleto).toBe(true);
  });

  it('ignora mensagens inválidas', () => {
    const texto = `Olá, tudo bem?`;
    const resultado = analyseMessage(texto);
    expect(resultado.valido).toBe(false);
    expect(resultado.incompleto).toBe(false);
  });
});