jest.mock('axios');
import axios from 'axios';
import { searchTagId } from '../src/trello/api.js';

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