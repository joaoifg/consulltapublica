/**
 * API Client para endpoints administrativos
 */
import axios, { AxiosError } from 'axios';
import type {
  Admin,
  AdminLoginRequest,
  AdminLoginResponse,
  ContribuicaoAdmin,
  Estatisticas,
  ConsultaPublica,
  ParticipanteDescriptografado,
  AdminLog,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor para lidar com erros de autenticação
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expirado, tentar refresh
      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('admin_refresh_token');
        if (refreshToken && !error.config?.url?.includes('/refresh')) {
          try {
            const response = await axios.post(`${API_BASE_URL}/admin/auth/refresh`, {
              refresh_token: refreshToken,
            });
            const { access_token } = response.data;
            localStorage.setItem('admin_token', access_token);

            // Retentar requisição original
            if (error.config) {
              error.config.headers.Authorization = `Bearer ${access_token}`;
              return axios(error.config);
            }
          } catch (refreshError) {
            // Refresh falhou, desloga
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_refresh_token');
            localStorage.removeItem('admin_user');
            window.location.href = '/admin/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

// ===== AUTENTICAÇÃO =====

export const adminApi = {
  // Auth
  login: async (credentials: AdminLoginRequest): Promise<AdminLoginResponse> => {
    const response = await api.post('/admin/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/admin/auth/logout');
  },

  refreshToken: async (refreshToken: string): Promise<{ access_token: string }> => {
    const response = await api.post('/admin/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  },

  alterarSenha: async (senhaAtual: string, senhaNova: string): Promise<void> => {
    await api.post('/admin/auth/alterar-senha', {
      senha_atual: senhaAtual,
      senha_nova: senhaNova,
    });
  },

  // ===== MODERAÇÃO =====

  moderacao: {
    listarPendentes: async (params?: {
      documento?: string;
      tipo?: string;
      data_inicio?: string;
      data_fim?: string;
      page?: number;
      per_page?: number;
    }) => {
      const response = await api.get('/admin/moderacao/pendentes', { params });
      return response.data;
    },

    aprovar: async (contribuicaoId: number): Promise<void> => {
      await api.post(`/admin/moderacao/${contribuicaoId}/aprovar`);
    },

    rejeitar: async (contribuicaoId: number, motivo: string): Promise<void> => {
      await api.post(`/admin/moderacao/${contribuicaoId}/rejeitar`, { motivo });
    },

    aprovarEmLote: async (contribuicaoIds: number[]): Promise<void> => {
      await api.post('/admin/moderacao/aprovar-lote', { contribuicao_ids: contribuicaoIds });
    },

    rejeitarEmLote: async (contribuicaoIds: number[], motivo: string): Promise<void> => {
      await api.post('/admin/moderacao/rejeitar-lote', {
        contribuicao_ids: contribuicaoIds,
        motivo,
      });
    },

    obterEstatisticas: async () => {
      const response = await api.get('/admin/moderacao/estatisticas');
      return response.data;
    },

    obterHistorico: async (contribuicaoId: number) => {
      const response = await api.get(`/admin/moderacao/historico/${contribuicaoId}`);
      return response.data;
    },
  },

  // ===== DASHBOARD =====

  dashboard: {
    obterEstatisticas: async (): Promise<Estatisticas> => {
      const response = await api.get('/admin/dashboard/estatisticas');
      return response.data;
    },

    obterContribuicoesPorUf: async (limit = 27) => {
      const response = await api.get('/admin/dashboard/contribuicoes-por-uf', {
        params: { limit },
      });
      return response.data;
    },

    obterContribuicoesPorPeriodo: async (dias = 30) => {
      const response = await api.get('/admin/dashboard/contribuicoes-por-periodo', {
        params: { dias },
      });
      return response.data;
    },

    obterContribuicoesRecentes: async (limit = 10) => {
      const response = await api.get('/admin/dashboard/contribuicoes-recentes', {
        params: { limit },
      });
      return response.data;
    },

    obterMetricasTempoReal: async () => {
      const response = await api.get('/admin/dashboard/metricas-tempo-real');
      return response.data;
    },

    obterRankingParticipantes: async (limit = 10) => {
      const response = await api.get('/admin/dashboard/ranking-participantes', {
        params: { limit },
      });
      return response.data;
    },
  },

  // ===== CONSULTAS =====

  consultas: {
    criar: async (data: Partial<ConsultaPublica>): Promise<ConsultaPublica> => {
      const response = await api.post('/admin/consultas', data);
      return response.data;
    },

    listar: async (status?: string): Promise<ConsultaPublica[]> => {
      const response = await api.get('/admin/consultas', { params: { status } });
      return response.data;
    },

    obterAtiva: async (): Promise<ConsultaPublica | null> => {
      const response = await api.get('/admin/consultas/ativa');
      return response.data;
    },

    obter: async (id: number): Promise<ConsultaPublica> => {
      const response = await api.get(`/admin/consultas/${id}`);
      return response.data;
    },

    atualizar: async (id: number, data: Partial<ConsultaPublica>): Promise<ConsultaPublica> => {
      const response = await api.patch(`/admin/consultas/${id}`, data);
      return response.data;
    },

    encerrar: async (id: number): Promise<ConsultaPublica> => {
      const response = await api.post(`/admin/consultas/${id}/encerrar`);
      return response.data;
    },
  },

  // ===== PARTICIPANTES =====

  participantes: {
    listar: async (params?: {
      tipo?: string;
      uf?: string;
      page?: number;
      per_page?: number;
    }) => {
      const response = await api.get('/admin/participantes', { params });
      return response.data;
    },

    obter: async (id: number): Promise<ParticipanteDescriptografado> => {
      const response = await api.get(`/admin/participantes/${id}`);
      return response.data;
    },

    buscarPorCpf: async (cpf: string): Promise<ParticipanteDescriptografado> => {
      const response = await api.post('/admin/participantes/buscar-cpf', { cpf });
      return response.data;
    },

    buscarPorCnpj: async (cnpj: string): Promise<ParticipanteDescriptografado> => {
      const response = await api.post('/admin/participantes/buscar-cnpj', { cnpj });
      return response.data;
    },

    exportarCsv: async (params?: { tipo?: string; uf?: string }) => {
      const response = await api.get('/admin/participantes/exportar/csv', {
        params,
        responseType: 'blob',
      });
      return response.data;
    },
  },

  // ===== ADMINS (CRUD) =====

  users: {
    criar: async (data: {
      nome: string;
      email: string;
      senha: string;
      role: string;
    }): Promise<Admin> => {
      const response = await api.post('/admin/users', data);
      return response.data;
    },

    listar: async (ativo?: boolean): Promise<Admin[]> => {
      const response = await api.get('/admin/users', { params: { ativo } });
      return response.data;
    },

    obter: async (id: number): Promise<Admin> => {
      const response = await api.get(`/admin/users/${id}`);
      return response.data;
    },

    atualizar: async (id: number, data: Partial<Admin>): Promise<Admin> => {
      const response = await api.patch(`/admin/users/${id}`, data);
      return response.data;
    },

    desativar: async (id: number): Promise<void> => {
      await api.delete(`/admin/users/${id}`);
    },

    ativar: async (id: number): Promise<void> => {
      await api.post(`/admin/users/${id}/ativar`);
    },
  },

  // ===== LOGS =====

  logs: {
    listar: async (params?: {
      admin_id?: number;
      acao?: string;
      data_inicio?: string;
      data_fim?: string;
      page?: number;
      per_page?: number;
    }) => {
      const response = await api.get('/admin/logs', { params });
      return response.data;
    },

    obterAcoes: async (): Promise<string[]> => {
      const response = await api.get('/admin/logs/acoes');
      return response.data.acoes;
    },

    obter: async (id: number): Promise<AdminLog> => {
      const response = await api.get(`/admin/logs/${id}`);
      return response.data;
    },
  },
};

export default adminApi;
