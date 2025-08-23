import {describe, it, expect, jest} from '@jest/globals'
import { searchTagId } from '../src/trello/api.js';
import axios from 'axios';
jest.mock('axios');

describe('Integração com Trello', () => {
  it('retorna ID da etiqueta correta', async () => {
    axios.get.mockResolvedValue({
      data: [{ name: 'autorizar dispositivo', id: 'abc123' }]
    });

    const id = await searchTagId('autorizar dispositivo');
    expect(id).toBe('abc123');
  });

  it('retorna null se etiqueta não encontrada', async () => {
    axios.get.mockResolvedValue({ data: [] });
    const id = await searchTagId('inexistente');
    expect(id).toBeNull();
  });
});