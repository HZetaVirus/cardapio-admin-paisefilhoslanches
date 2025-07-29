
import { Cliente, Categoria, ItemCardapio, ItemPedido, Pedido, Avaliacao, ConfiguracaoLoja, StatusPedido, FormaPagamento, CurrentView, Adicional } from '@/types';
import { AdminUser } from '@/services/adminAuthService';

export interface AppContextType {
  // Dados
  clientes: Cliente[];
  pedidos: Pedido[];
  categorias: Categoria[];
  cardapio: ItemCardapio[];
  avaliacoes: Avaliacao[];
  configuracaoLoja: ConfiguracaoLoja | null;
  adicionais: Adicional[];
  
  // Estado da autenticação
  clienteAtual: Cliente | null;
  adminUser: AdminUser | null;
  isAdmin: boolean;
  carrinhoAtual: ItemPedido[];
  
  // Funções de clientes
  cadastrarCliente: (cliente: Omit<Cliente, 'id' | 'data_ultimo_pedido'>) => Promise<Cliente | null>;
  loginCliente: (telefone: string) => Promise<boolean>;
  loginAdmin: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // Funções de pedidos
  adicionarAoCarrinho: (item: ItemCardapio, quantidade: number, observacao?: string, adicionais?: Adicional[]) => void;
  removerDoCarrinho: (itemId: number) => void;
  atualizarQuantidadeCarrinho: (itemId: number, quantidade: number) => void;
  finalizarPedido: (formaPagamento: FormaPagamento, observacao: string, trocoPara?: number, dadosCliente?: Omit<Cliente, 'id' | 'data_ultimo_pedido'>) => void;
  atualizarStatusPedido: (pedidoId: number, novoStatus: StatusPedido) => void;
  
  // Funções de avaliações
  avaliarItem: (itemId: number, avaliacao: number, comentario: string) => void;
  
  // Funções de produtos
  adicionarItemCardapio: (item: Omit<ItemCardapio, 'id'>) => void;
  
  // Funções de configuração
  atualizarConfiguracaoLoja: (config: ConfiguracaoLoja) => void;
  
  // Navegação
  currentView: CurrentView;
  setCurrentView: (view: CurrentView) => void;
  
  // Estado de carregamento
  loading: boolean;
  
  // Novas funções para segurança
  setPedidos: (pedidos: Pedido[]) => void;
  setAvaliacoes: (avaliacoes: Avaliacao[]) => void;
  getClientePedidos: () => Pedido[];
}
