/**
 * TypeScript Types
 */

export type Documento = 'CEO' | 'CPEO';

export type TipoContribuicao = 'ALTERACAO' | 'INCLUSAO' | 'EXCLUSAO' | 'COMENTARIO';

export type TipoParticipante = 'PESSOA_FISICA' | 'PESSOA_JURIDICA';

export interface ParticipantePF {
  nome_completo: string;
  cpf: string;
  email: string;
  uf: string;
  categoria?: string;
  consentimento_lgpd: boolean;
}

export interface ParticipantePJ {
  razao_social: string;
  cnpj: string;
  natureza_entidade: string;
  nome_responsavel_legal: string;
  cpf_responsavel: string;
  email: string;
  uf: string;
  consentimento_lgpd: boolean;
}

export interface Contribuicao {
  documento: Documento;
  titulo_capitulo: string;
  secao?: string;
  artigo: string;
  paragrafo_inciso_alinea?: string;
  tipo: TipoContribuicao;
  texto_proposto: string;
  fundamentacao: string;
}

export interface ContribuicaoResponse extends Contribuicao {
  id: number;
  criado_em: string;
  protocolo: string;
  status_moderacao: StatusModeracao;
}

export interface Protocolo {
  numero_protocolo: string;
  documento: string;
  total_contribuicoes: number;
  criado_em: string;
  participante: {
    nome: string;
    uf: string;
  };
  contribuicoes: ContribuicaoResponse[];
}

export interface IdentificacaoResponse {
  message: string;
  token: string;
  participante_id: number;
  nome?: string;
  razao_social?: string;
}

export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export const CATEGORIAS_PF = [
  { value: 'CIRURGIAO_DENTISTA', label: 'Cirurgião-Dentista' },
  { value: 'AUXILIAR_TECNICO', label: 'Auxiliar/Técnico em Saúde Bucal' },
  { value: 'ESTUDANTE', label: 'Estudante de Odontologia' },
  { value: 'PESQUISADOR', label: 'Pesquisador' },
  { value: 'CIDADAO', label: 'Cidadão' },
  { value: 'OUTRO', label: 'Outro' },
];

export const NATUREZAS_PJ = [
  { value: 'CONSELHO_REGIONAL', label: 'Conselho Regional de Odontologia' },
  { value: 'ASSOCIACAO_CLASSE', label: 'Associação de Classe' },
  { value: 'SINDICATO', label: 'Sindicato' },
  { value: 'INSTITUICAO_ENSINO', label: 'Instituição de Ensino' },
  { value: 'CENTRO_PESQUISA', label: 'Centro de Pesquisa' },
  { value: 'EMPRESA_PRIVADA', label: 'Empresa Privada' },
  { value: 'ORGAO_PUBLICO', label: 'Órgão Público' },
  { value: 'ONG', label: 'ONG' },
  { value: 'OUTRO', label: 'Outro' },
];

export const TIPOS_CONTRIBUICAO = [
  { value: 'ALTERACAO', label: 'Alteração de redação', description: 'Modificar texto existente' },
  { value: 'INCLUSAO', label: 'Inclusão de dispositivo', description: 'Adicionar novo artigo/parágrafo' },
  { value: 'EXCLUSAO', label: 'Exclusão de dispositivo', description: 'Remover artigo/parágrafo' },
  { value: 'COMENTARIO', label: 'Comentário geral', description: 'Sugestão ou observação' },
];

// ===== TIPOS ADMINISTRATIVOS =====

export type AdminRole = 'SUPER_ADMIN' | 'MODERADOR' | 'ANALISTA';

export type StatusModeracao = 'PENDENTE' | 'APROVADA' | 'REJEITADA';

export type StatusConsulta = 'RASCUNHO' | 'ATIVA' | 'ENCERRADA';

export interface Admin {
  id: number;
  nome: string;
  email: string;
  role: AdminRole;
  ativo: boolean;
  criado_em: string;
  atualizado_em?: string;
}

export interface AdminLoginRequest {
  email: string;
  senha: string;
}

export interface AdminLoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  admin: Admin;
}

export interface ContribuicaoAdmin extends ContribuicaoResponse {
  status_moderacao: StatusModeracao;
  moderado_por_id?: number;
  moderado_em?: string;
  motivo_rejeicao?: string;
  participante?: ParticipanteDescriptografado;
}

export interface ParticipanteDescriptografado {
  id: number;
  tipo: TipoParticipante;
  nome_completo?: string;
  razao_social?: string;
  cpf?: string;
  cnpj?: string;
  email: string;
  uf: string;
  criado_em: string;
}

export interface Estatisticas {
  total_contribuicoes: number;
  pendentes: number;
  aprovadas: number;
  rejeitadas: number;
  total_participantes: number;
  participantes_pf: number;
  participantes_pj: number;
  total_protocolos: number;
  contribuicoes_24h: number;
  taxa_crescimento_24h: number;
  por_tipo: Record<TipoContribuicao, number>;
  por_documento: Record<Documento, number>;
}

export interface ConsultaPublica {
  id: number;
  titulo: string;
  descricao?: string;
  data_inicio: string;
  data_fim: string;
  status: StatusConsulta;
  documentos_disponiveis: Documento[];
  criado_por_admin_id: number;
  criado_em: string;
  atualizado_em?: string;
}

export interface AdminLog {
  id: number;
  admin_id?: number;
  acao: string;
  recurso?: string;
  detalhes?: any;
  ip_origem?: string;
  user_agent?: string;
  criado_em: string;
}

export const ADMIN_ROLES = [
  { value: 'SUPER_ADMIN', label: 'Super Admin', description: 'Acesso total ao sistema' },
  { value: 'MODERADOR', label: 'Moderador', description: 'Moderar contribuições' },
  { value: 'ANALISTA', label: 'Analista', description: 'Apenas leitura' },
];

export const STATUS_MODERACAO_LABELS = {
  PENDENTE: { label: 'Pendente', color: 'yellow' },
  APROVADA: { label: 'Aprovada', color: 'green' },
  REJEITADA: { label: 'Rejeitada', color: 'red' },
};

export const STATUS_CONSULTA_LABELS = {
  RASCUNHO: { label: 'Rascunho', color: 'gray' },
  ATIVA: { label: 'Ativa', color: 'green' },
  ENCERRADA: { label: 'Encerrada', color: 'red' },
};
