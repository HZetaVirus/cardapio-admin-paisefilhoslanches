export interface Cliente {
  id: number;
  nome_completo: string;
  endereco: string;
  telefone: string;
  data_ultimo_pedido: string | null;
}

export interface Categoria {
  id: number;
  nome_categoria: string;
}

export interface ItemCardapio {
  id: number;
  nome_item: string;
  descricao: string;
  preco: number;
  categoria_id: number;
  imagem?: string;
  is_featured?: boolean;
}

export interface Adicional {
  id: number;
  nome_adicional: string;
  preco: number;
  categoria_adicional: string;
}

export interface ItemPedido {
  item_id: number;
  quantidade: number;
  observacao?: string;
  nome_item: string;
  preco: number;
  adicionais?: Adicional[];
}

export type StatusPedido = 'pendente' | 'pedido aceito' | 'indo para a chapa agora' | 'saiu da chapa para sua casa' | 'pedidos cancelados' | 'pedidos concluídos';
export type FormaPagamento = 'dinheiro' | 'cartão' | 'pix';

export interface Pedido {
  id: number;
  cliente_id: number;
  itens: ItemPedido[];
  status: StatusPedido;
  forma_pagamento: FormaPagamento;
  observacao: string;
  data_pedido: string;
  valor_total: number;
  troco_para?: number;
  cliente?: Cliente; // Dados do cliente para facilitar o acesso
}

export interface Avaliacao {
  id: number;
  item_id: number;
  cliente_id: number;
  avaliacao: number;
  comentario: string;
  nome_item?: string;
}

export type ModoOperacao = 'automatico' | 'manual' | 'fechado_forcado';

export interface ConfiguracaoLoja {
  logoUrl: string;
  logoBgColor: string;
  descricao: string;
  endereco: string;
  horarioFuncionamento: string;
  instagramUrl: string;
  cardapioAtivo: boolean;
  modoOperacao: ModoOperacao;
  ultimaVerificacaoAutomatica: string;
  feriadosFechamento: string[]; // Array de datas no formato YYYY-MM-DD
}

export type CurrentView = 'admin' | 'login';