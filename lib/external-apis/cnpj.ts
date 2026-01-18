import axios from 'axios';

export interface CNPJData {
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  municipio: string;
  uf: string;
}

export async function fetchCNPJData(cnpj: string): Promise<CNPJData | null> {
  try {
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    const apiUrl = process.env.CNPJ_API_URL || 'https://brasilapi.com.br/api/cnpj/v1';
    const response = await axios.get(`${apiUrl}/${cleanCNPJ}`, {
      timeout: 10000,
    });

    if (response.data) {
      return {
        cnpj: response.data.cnpj,
        razao_social: response.data.razao_social,
        nome_fantasia: response.data.nome_fantasia,
        cep: response.data.cep,
        logradouro: response.data.logradouro,
        numero: response.data.numero,
        complemento: response.data.complemento,
        bairro: response.data.bairro,
        municipio: response.data.municipio,
        uf: response.data.uf,
      };
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar dados do CNPJ:', error);
    return null;
  }
}
