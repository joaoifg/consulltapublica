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
