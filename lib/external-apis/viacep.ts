import axios from 'axios';

export interface ViaCEPData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export async function fetchAddressByCEP(cep: string): Promise<ViaCEPData | null> {
  try {
    const cleanCEP = cep.replace(/\D/g, '');
    const apiUrl = process.env.VIACEP_API_URL || 'https://viacep.com.br/ws';
    const response = await axios.get(`${apiUrl}/${cleanCEP}/json`, {
      timeout: 10000,
    });

    if (response.data && !response.data.erro) {
      return response.data;
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar endereço pelo CEP:', error);
    return null;
  }
}
