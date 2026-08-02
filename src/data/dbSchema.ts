/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SheetTable } from '../types';

export const GOOGLE_SHEETS_SCHEMA: SheetTable[] = [
  {
    id: 'usuarios',
    name: 'Usuários',
    description: 'Armazena informações cadastrais dos usuários e hashs de autenticação.',
    columns: [
      { name: 'id', type: 'VARCHAR (UUID)', keyType: 'PK', description: 'Identificador único do usuário', sampleValue: 'usr_f89b1c72' },
      { name: 'nome', type: 'VARCHAR(100)', description: 'Nome completo do usuário', sampleValue: 'Cristiano Kuhn' },
      { name: 'email', type: 'VARCHAR(150) (UNIQUE)', description: 'Endereço de e-mail (usado para login)', sampleValue: 'cristianokuhn1993@gmail.com' },
      { name: 'senha_hash', type: 'VARCHAR(256)', description: 'Senha criptografada usando SHA-256 com salt', sampleValue: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918' },
      { name: 'status', type: 'VARCHAR(20)', description: 'Status da conta (ATIVO, INATIVO, SUSPENSO)', sampleValue: 'ATIVO' },
      { name: 'criado_em', type: 'TIMESTAMP', description: 'Data/hora de criação do registro', sampleValue: '2026-01-15T10:00:00Z' },
      { name: 'alterado_em', type: 'TIMESTAMP', description: 'Data/hora da última alteração', sampleValue: '2026-01-15T10:00:00Z' },
      { name: 'criado_por', type: 'VARCHAR(100)', description: 'E-mail do administrador/sistema que criou o registro', sampleValue: 'system' }
    ],
    sampleRows: [
      {
        id: 'usr_f89b1c72',
        nome: 'Cristiano Kuhn',
        email: 'cristianokuhn1993@gmail.com',
        senha_hash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
        status: 'ATIVO',
        criado_em: '2026-01-15T10:00:00Z',
        alterado_em: '2026-04-10T15:30:22Z',
        criado_por: 'system'
      }
    ]
  },
  {
    id: 'categorias',
    name: 'Categorias',
    description: 'Categorias primárias de lançamentos (Alimentação, Transporte, Saúde, etc.).',
    columns: [
      { name: 'id', type: 'VARCHAR (UUID)', keyType: 'PK', description: 'Identificador único da categoria', sampleValue: 'cat_39b2cf4a' },
      { name: 'nome', type: 'VARCHAR(50)', description: 'Nome descritivo da categoria', sampleValue: 'Alimentação' },
      { name: 'tipo', type: 'VARCHAR(20)', description: 'Tipo associado (RECEITA, DESPESA, INVESTIMENTO)', sampleValue: 'DESPESA' },
      { name: 'icone', type: 'VARCHAR(50)', description: 'Identificador do ícone Lucide correspondente', sampleValue: 'utensils' },
      { name: 'cor_hex', type: 'VARCHAR(7)', description: 'Cor em hexadecimal para renderização no app', sampleValue: '#f43f5e' },
      { name: 'status', type: 'VARCHAR(20)', description: 'Status de ativação (ATIVO, INATIVO)', sampleValue: 'ATIVO' },
      { name: 'criado_em', type: 'TIMESTAMP', description: 'Data/hora de criação', sampleValue: '2026-01-15T11:00:00Z' },
      { name: 'alterado_em', type: 'TIMESTAMP', description: 'Data/hora da última alteração', sampleValue: '2026-01-15T11:00:00Z' },
      { name: 'criado_por', type: 'VARCHAR(150)', description: 'Auditoria: Usuário criador', sampleValue: 'cristianokuhn1993@gmail.com' }
    ],
    sampleRows: [
      { id: 'cat_01', nome: 'Alimentação', tipo: 'DESPESA', icone: 'Utensils', cor_hex: '#ef4444', status: 'ATIVO', criado_em: '2026-01-15T11:00:00Z', alterado_em: '2026-01-15T11:00:00Z', criado_por: 'system' },
      { id: 'cat_02', nome: 'Transporte', tipo: 'DESPESA', icone: 'Car', cor_hex: '#3b82f6', status: 'ATIVO', criado_em: '2026-01-15T11:00:00Z', alterado_em: '2026-01-15T11:00:00Z', criado_por: 'system' },
      { id: 'cat_03', nome: 'Salário', tipo: 'RECEITA', icone: 'Briefcase', cor_hex: '#10b981', status: 'ATIVO', criado_em: '2026-01-15T11:00:00Z', alterado_em: '2026-01-15T11:00:00Z', criado_por: 'system' },
      { id: 'cat_04', name: 'Investimentos', tipo: 'INVESTIMENTO', icone: 'TrendingUp', cor_hex: '#a855f7', status: 'ATIVO', criado_em: '2026-01-15T11:00:00Z', alterado_em: '2026-01-15T11:00:00Z', criado_por: 'system' }
    ]
  },
  {
    id: 'subcategorias',
    name: 'Subcategorias',
    description: 'Subdivisão de categorias para maior granularidade nos relatórios.',
    columns: [
      { name: 'id', type: 'VARCHAR (UUID)', keyType: 'PK', description: 'Identificador único da subcategoria', sampleValue: 'sub_a82bc0e1' },
      { name: 'categoria_id', type: 'VARCHAR (UUID)', keyType: 'FK', refTable: 'Categorias', description: 'ID da categoria mãe', sampleValue: 'cat_01' },
      { name: 'nome', type: 'VARCHAR(50)', description: 'Nome da subcategoria', sampleValue: 'Supermercado' },
      { name: 'status', type: 'VARCHAR(20)', description: 'Status de ativação', sampleValue: 'ATIVO' },
      { name: 'criado_em', type: 'TIMESTAMP', description: 'Data de criação', sampleValue: '2026-01-15T11:30:00Z' },
      { name: 'alterado_em', type: 'TIMESTAMP', description: 'Data da alteração', sampleValue: '2026-01-15T11:30:00Z' },
      { name: 'criado_por', type: 'VARCHAR(150)', description: 'Auditoria: Usuário criador', sampleValue: 'cristianokuhn1993@gmail.com' }
    ],
    sampleRows: [
      { id: 'sub_01', categoria_id: 'cat_01', nome: 'Supermercado', status: 'ATIVO', criado_em: '2026-01-15T11:30:00Z', alterado_em: '2026-01-15T11:30:00Z', criado_por: 'system' },
      { id: 'sub_02', categoria_id: 'cat_01', nome: 'Restaurante', status: 'ATIVO', criado_em: '2026-01-15T11:30:00Z', alterado_em: '2026-01-15T11:30:00Z', criado_por: 'system' },
      { id: 'sub_03', categoria_id: 'cat_02', nome: 'Uber / Combustível', status: 'ATIVO', criado_em: '2026-01-15T11:30:00Z', alterado_em: '2026-01-15T11:30:00Z', criado_por: 'system' }
    ]
  },
  {
    id: 'contas_bancarias',
    name: 'Contas Bancárias',
    description: 'Contas, caixinhas e carteiras digitais que retêm saldos monetários.',
    columns: [
      { name: 'id', type: 'VARCHAR (UUID)', keyType: 'PK', description: 'Identificador único da conta', sampleValue: 'acc_7b29a00e' },
      { name: 'usuario_id', type: 'VARCHAR (UUID)', keyType: 'FK', refTable: 'Usuários', description: 'Dono da conta', sampleValue: 'usr_f89b1c72' },
      { name: 'nome', type: 'VARCHAR(50)', description: 'Nome de exibição da conta', sampleValue: 'Nubank Principal' },
      { name: 'tipo', type: 'VARCHAR(30)', description: 'CORRENTE, POUPANCA, CARTEIRA, CAIXINHA, DIGITAL', sampleValue: 'CORRENTE' },
      { name: 'instituicao', type: 'VARCHAR(50)', description: 'Nome do Banco', sampleValue: 'Nubank' },
      { name: 'saldo_inicial', type: 'DECIMAL(12,2)', description: 'Saldo quando a conta foi cadastrada', sampleValue: '1500.00' },
      { name: 'saldo_atual', type: 'DECIMAL(12,2)', description: 'Saldo atualizado (calculado no Apps Script)', sampleValue: '5740.50' },
      { name: 'status', type: 'VARCHAR(20)', description: 'Status (ATIVO, INATIVO)', sampleValue: 'ATIVO' },
      { name: 'criado_em', type: 'TIMESTAMP', description: 'Data de criação', sampleValue: '2026-01-16T08:00:00Z' },
      { name: 'alterado_em', type: 'TIMESTAMP', description: 'Última alteração', sampleValue: '2026-08-01T15:00:00Z' },
      { name: 'criado_por', type: 'VARCHAR(150)', description: 'Auditoria: Usuário criador', sampleValue: 'cristianokuhn1993@gmail.com' }
    ],
    sampleRows: [
      { id: 'acc_01', usuario_id: 'usr_f89b1c72', nome: 'Nubank Principal', tipo: 'CORRENTE', instituicao: 'Nubank', saldo_inicial: 1500.00, saldo_atual: 4320.50, status: 'ATIVO', criado_em: '2026-01-16T08:00:00Z', alterado_em: '2026-08-01T15:00:00Z', criado_por: 'system' },
      { id: 'acc_02', usuario_id: 'usr_f89b1c72', nome: 'Reserva Itaú', tipo: 'CAIXINHA', instituicao: 'Itaú', saldo_inicial: 5000.00, saldo_atual: 5120.00, status: 'ATIVO', criado_em: '2026-01-16T08:00:00Z', alterado_em: '2026-08-01T15:00:00Z', criado_por: 'system' },
      { id: 'acc_03', usuario_id: 'usr_f89b1c72', nome: 'Carteira Dinheiro', tipo: 'CARTEIRA', instituicao: 'Dinheiro', saldo_inicial: 150.00, saldo_atual: 300.00, status: 'ATIVO', criado_em: '2026-01-16T08:00:00Z', alterado_em: '2026-08-01T15:00:00Z', criado_por: 'system' }
    ]
  },
  {
    id: 'cartoes',
    name: 'Cartões',
    description: 'Cartões de crédito com controle de limite, fechamento e vencimento.',
    columns: [
      { name: 'id', type: 'VARCHAR (UUID)', keyType: 'PK', description: 'Identificador único do cartão', sampleValue: 'crd_4bc021da' },
      { name: 'usuario_id', type: 'VARCHAR (UUID)', keyType: 'FK', refTable: 'Usuários', description: 'Dono do cartão', sampleValue: 'usr_f89b1c72' },
      { name: 'nome', type: 'VARCHAR(50)', description: 'Nome do cartão (ex: Nubank Gold)', sampleValue: 'Inter Black' },
      { name: 'instituicao', type: 'VARCHAR(50)', description: 'Nome da bandeira/banco emissor', sampleValue: 'Inter' },
      { name: 'limite_total', type: 'DECIMAL(12,2)', description: 'Limite de crédito total aprovado', sampleValue: '8000.00' },
      { name: 'limite_utilizado', type: 'DECIMAL(12,2)', description: 'Soma das compras parceladas e abertas', sampleValue: '1420.00' },
      { name: 'dia_fechamento', type: 'INT', description: 'Dia do fechamento da fatura', sampleValue: '28' },
      { name: 'dia_vencimento', type: 'INT', description: 'Dia do pagamento/vencimento da fatura', sampleValue: '5' },
      { name: 'cor_hex', type: 'VARCHAR(7)', description: 'Cor do cartão no visual do app', sampleValue: '#a855f7' },
      { name: 'status', type: 'VARCHAR(20)', description: 'Status (ATIVO, INATIVO)', sampleValue: 'ATIVO' },
      { name: 'criado_em', type: 'TIMESTAMP', description: 'Data de criação', sampleValue: '2026-01-16T08:30:00Z' },
      { name: 'alterado_em', type: 'TIMESTAMP', description: 'Última alteração', sampleValue: '2026-08-01T15:00:00Z' },
      { name: 'criado_por', type: 'VARCHAR(150)', description: 'Auditoria: Usuário criador', sampleValue: 'cristianokuhn1993@gmail.com' }
    ],
    sampleRows: [
      { id: 'crd_01', usuario_id: 'usr_f89b1c72', nome: 'Nubank Ultravioleta', instituicao: 'Nubank', limite_total: 10000.00, limite_utilizado: 2500.00, dia_fechamento: 25, dia_vencimento: 5, cor_hex: '#4c1d95', status: 'ATIVO', criado_em: '2026-01-16T08:30:00Z', alterado_em: '2026-08-01T15:00:00Z', criado_por: 'system' },
      { id: 'crd_02', usuario_id: 'usr_f89b1c72', nome: 'Inter Black', instituicao: 'Inter', limite_total: 15000.00, limite_utilizado: 1200.00, dia_fechamento: 1, dia_vencimento: 10, cor_hex: '#ea580c', status: 'ATIVO', criado_em: '2026-01-16T08:30:00Z', alterado_em: '2026-08-01T15:00:00Z', criado_por: 'system' }
    ]
  },
  {
    id: 'lancamentos',
    name: 'Lançamentos',
    description: 'Transações principais financeiras (Entradas, Saídas, Investimentos).',
    formulaNote: 'Mapeado para competências mensais dinâmicas filtradas nas requisições da API.',
    columns: [
      { name: 'id', type: 'VARCHAR (UUID)', keyType: 'PK', description: 'Identificador único do lançamento', sampleValue: 'txn_92c019be' },
      { name: 'usuario_id', type: 'VARCHAR (UUID)', keyType: 'FK', refTable: 'Usuários', description: 'Usuário autor', sampleValue: 'usr_f89b1c72' },
      { name: 'descricao', type: 'VARCHAR(150)', description: 'Título descritivo do lançamento', sampleValue: 'Supermercado Angeloni' },
      { name: 'categoria_id', type: 'VARCHAR (UUID)', keyType: 'FK', refTable: 'Categorias', description: 'Categoria', sampleValue: 'cat_01' },
      { name: 'subcategoria_id', type: 'VARCHAR (UUID)', keyType: 'FK', refTable: 'Subcategorias', description: 'Subcategoria', sampleValue: 'sub_01' },
      { name: 'conta_id', type: 'VARCHAR (UUID)', keyType: 'FK', refTable: 'Contas Bancárias', description: 'Conta financeira envolvida', sampleValue: 'acc_01' },
      { name: 'cartao_id', type: 'VARCHAR (UUID) (NULL)', keyType: 'FK', refTable: 'Cartões', description: 'Cartão de crédito envolvido (se aplicável)', sampleValue: 'crd_01' },
      { name: 'valor', type: 'DECIMAL(12,2)', description: 'Valor absoluto da transação', sampleValue: '350.40' },
      { name: 'tipo', type: 'VARCHAR(20)', description: 'RECEITA, DESPESA, TRANSFERENCIA, INVESTIMENTO', sampleValue: 'DESPESA' },
      { name: 'forma_pagamento', type: 'VARCHAR(20)', description: 'PIX, DINHEIRO, DEBITO, CREDITO, BOLETO, TED', sampleValue: 'CREDITO' },
      { name: 'data_competencia', type: 'DATE', description: 'Mês/Ano de competência de navegação (YYYY-MM)', sampleValue: '2026-08' },
      { name: 'data_hora', type: 'TIMESTAMP', description: 'Data e hora da efetiva transação', sampleValue: '2026-08-01T14:30:00Z' },
      { name: 'observacoes', type: 'TEXT (NULL)', description: 'Notas explicativas opcionais', sampleValue: 'Compras do mês' },
      { name: 'anexo_url', type: 'TEXT (NULL)', description: 'Link para o arquivo/comprovante armazenado no GDrive', sampleValue: 'https://drive.google.com/open?id=1AbCdEfGhIjKlMnOpQrSt' },
      { name: 'status', type: 'VARCHAR(20)', description: 'PAGO (efetivado) ou PENDENTE (provisionado)', sampleValue: 'PAGO' },
      { name: 'parcelamento_id', type: 'VARCHAR (UUID) (NULL)', keyType: 'FK', refTable: 'Parcelamentos', description: 'Identificador do grupo de parcelas se houver', sampleValue: 'install_7bc1a902' },
      { name: 'assinatura_id', type: 'VARCHAR (UUID) (NULL)', keyType: 'FK', refTable: 'Assinaturas', description: 'Identificador de recorrência automática se houver', sampleValue: 'sub_netflix' },
      { name: 'criado_em', type: 'TIMESTAMP', description: 'Data de inserção no banco', sampleValue: '2026-08-01T14:32:00Z' },
      { name: 'alterado_em', type: 'TIMESTAMP', description: 'Última alteração', sampleValue: '2026-08-01T14:32:00Z' }
    ],
    sampleRows: [
      { id: 'txn_01', usuario_id: 'usr_f89b1c72', descricao: 'Salário Google Inc', categoria_id: 'cat_03', subcategoria_id: 'sub_03', conta_id: 'acc_01', cartao_id: '', valor: 12000.00, tipo: 'RECEITA', forma_pagamento: 'TED', data_competencia: '2026-08', data_hora: '2026-08-01T09:00:00Z', status: 'PAGO', criado_em: '2026-08-01T09:05:00Z', alterado_em: '2026-08-01T09:05:00Z' },
      { id: 'txn_02', usuario_id: 'usr_f89b1c72', descricao: 'Almoço Restaurante', categoria_id: 'cat_01', subcategoria_id: 'sub_02', conta_id: 'acc_01', cartao_id: '', valor: 65.50, tipo: 'DESPESA', forma_pagamento: 'PIX', data_competencia: '2026-08', data_hora: '2026-08-01T12:15:00Z', status: 'PAGO', criado_em: '2026-08-01T12:20:00Z', alterado_em: '2026-08-01T12:20:00Z' },
      { id: 'txn_03', usuario_id: 'usr_f89b1c72', descricao: 'Supermercado Angeloni', categoria_id: 'cat_01', subcategoria_id: 'sub_01', conta_id: 'acc_01', cartao_id: 'crd_01', valor: 350.40, tipo: 'DESPESA', forma_pagamento: 'CREDITO', data_competencia: '2026-08', data_hora: '2026-08-01T14:30:00Z', status: 'PAGO', criado_em: '2026-08-01T14:32:00Z', alterado_em: '2026-08-01T14:32:00Z' }
    ]
  },
  {
    id: 'parcelamentos',
    name: 'Parcelamentos',
    description: 'Armazena as compras que foram faturadas parceladamente para rastreamento futuro.',
    columns: [
      { name: 'id', type: 'VARCHAR (UUID)', keyType: 'PK', description: 'Identificador único do contrato de parcelamento', sampleValue: 'par_082a170c' },
      { name: 'usuario_id', type: 'VARCHAR (UUID)', keyType: 'FK', refTable: 'Usuários', description: 'Dono do parcelamento', sampleValue: 'usr_f89b1c72' },
      { name: 'descricao', type: 'VARCHAR(150)', description: 'Descrição da compra de origem', sampleValue: 'Notebook Dell XPS' },
      { name: 'valor_total', type: 'DECIMAL(12,2)', description: 'Valor integral consolidado', sampleValue: '6000.00' },
      { name: 'quantidade_parcelas', type: 'INT', description: 'Total de parcelas contratadas', sampleValue: '12' },
      { name: 'valor_parcela', type: 'DECIMAL(12,2)', description: 'Valor de cada prestação mensal', sampleValue: '500.00' },
      { name: 'parcelas_pagas', type: 'INT', description: 'Contador de parcelas quitadas', sampleValue: '3' },
      { name: 'status', type: 'VARCHAR(20)', description: 'ATIVO, QUITADO, ANTECIPADO', sampleValue: 'ATIVO' },
      { name: 'criado_em', type: 'TIMESTAMP', description: 'Data de criação', sampleValue: '2026-05-10T11:00:00Z' },
      { name: 'alterado_em', type: 'TIMESTAMP', description: 'Última alteração', sampleValue: '2026-08-01T15:00:00Z' },
      { name: 'criado_por', type: 'VARCHAR(150)', description: 'Autor', sampleValue: 'cristianokuhn1993@gmail.com' }
    ],
    sampleRows: [
      { id: 'par_01', usuario_id: 'usr_f89b1c72', descricao: 'Notebook Dell XPS', valor_total: 6000.00, quantidade_parcelas: 12, valor_parcela: 500.00, parcelas_pagas: 3, status: 'ATIVO', criado_em: '2026-05-10T11:00:00Z', alterado_em: '2026-08-01T15:00:00Z', criado_por: 'system' }
    ]
  },
  {
    id: 'investimentos',
    name: 'Investimentos',
    description: 'Ativos financeiros de renda fixa e renda variável do patrimônio.',
    columns: [
      { name: 'id', type: 'VARCHAR (UUID)', keyType: 'PK', description: 'Identificador do ativo', sampleValue: 'inv_827fbc1d' },
      { name: 'usuario_id', type: 'VARCHAR (UUID)', keyType: 'FK', refTable: 'Usuários', description: 'Proprietário', sampleValue: 'usr_f89b1c72' },
      { name: 'nome', type: 'VARCHAR(100)', description: 'Nome/Ticker do ativo (CDB IPCA+, WEGE3, BTC)', sampleValue: 'CDB Liquidez Diária Itaú' },
      { name: 'tipo', type: 'VARCHAR(20)', description: 'TESOURO, CDB, LCI_LCA, ACOES, FIIS, CRIPTO', sampleValue: 'CDB' },
      { name: 'instituicao', type: 'VARCHAR(50)', description: 'Custodiante / Corretora', sampleValue: 'Itaú' },
      { name: 'valor_aplicado', type: 'DECIMAL(12,2)', description: 'Total de capital próprio aportado', sampleValue: '10000.00' },
      { name: 'valor_atual', type: 'DECIMAL(12,2)', description: 'Valor de mercado atualizado', sampleValue: '10420.50' },
      { name: 'lucro_prejuizo', type: 'DECIMAL(12,2)', description: 'Lucro ou perda acumulada', sampleValue: '420.50' },
      { name: 'data_aplicacao', type: 'DATE', description: 'Data do primeiro aporte', sampleValue: '2026-01-20' },
      { name: 'status', type: 'VARCHAR(20)', description: 'ATIVO, RESGATADO', sampleValue: 'ATIVO' },
      { name: 'criado_em', type: 'TIMESTAMP', description: 'Data de criação', sampleValue: '2026-01-20T14:00:00Z' },
      { name: 'alterado_em', type: 'TIMESTAMP', description: 'Última atualização de cota', sampleValue: '2026-08-01T00:00:00Z' }
    ],
    sampleRows: [
      { id: 'inv_01', usuario_id: 'usr_f89b1c72', nome: 'CDB Liquidez Diária Itaú', tipo: 'CDB', instituicao: 'Itaú', valor_aplicado: 10000.00, valor_atual: 10420.50, lucro_prejuizo: 420.50, data_aplicacao: '2026-01-20', status: 'ATIVO', criado_em: '2026-01-20T14:00:00Z', alterado_em: '2026-08-01T00:00:00Z' },
      { id: 'inv_02', usuario_id: 'usr_f89b1c72', nome: 'FII HGLG11', tipo: 'FIIS', instituicao: 'XP Investimentos', valor_aplicado: 4500.00, valor_atual: 4720.00, lucro_prejuizo: 220.00, data_aplicacao: '2026-02-15', status: 'ATIVO', criado_em: '2026-02-15T10:00:00Z', alterado_em: '2026-08-01T00:00:00Z' }
    ]
  },
  {
    id: 'metas',
    name: 'Metas',
    description: 'Objetivos de poupança financeira com acompanhamento e data limite.',
    columns: [
      { name: 'id', type: 'VARCHAR (UUID)', keyType: 'PK', description: 'Identificador único da meta', sampleValue: 'goal_7a02bc41' },
      { name: 'usuario_id', type: 'VARCHAR (UUID)', keyType: 'FK', refTable: 'Usuários', description: 'Dono da meta', sampleValue: 'usr_f89b1c72' },
      { name: 'nome', type: 'VARCHAR(100)', description: 'Título do objetivo', sampleValue: 'Reserva de Emergência' },
      { name: 'descricao', type: 'VARCHAR(255)', description: 'Detalhamento do objetivo', sampleValue: 'Guardar 6 meses de custo de vida' },
      { name: 'valor_objetivo', type: 'DECIMAL(12,2)', description: 'Meta de saldo financeiro', sampleValue: '30000.00' },
      { name: 'valor_atual', type: 'DECIMAL(12,2)', description: 'Saldo já acumulado', sampleValue: '12000.00' },
      { name: 'data_limite', type: 'DATE', description: 'Prazo estipulado para alcance', sampleValue: '2027-12-31' },
      { name: 'status', type: 'VARCHAR(20)', description: 'EM_ANDAMENTO, CONCLUIDA, CANCELADA', sampleValue: 'EM_ANDAMENTO' },
      { name: 'criado_em', type: 'TIMESTAMP', description: 'Data de criação', sampleValue: '2026-01-18T09:00:00Z' },
      { name: 'alterado_em', type: 'TIMESTAMP', description: 'Última alteração', sampleValue: '2026-08-01T15:00:00Z' }
    ],
    sampleRows: [
      { id: 'goal_01', usuario_id: 'usr_f89b1c72', nome: 'Reserva de Emergência', descricao: 'Guardar 6 meses de custo de vida', valor_objetivo: 30000.00, valor_atual: 12000.00, data_limite: '2027-12-31', status: 'EM_ANDAMENTO', criado_em: '2026-01-18T09:00:00Z', alterado_em: '2026-08-01T15:00:00Z' },
      { id: 'goal_02', usuario_id: 'usr_f89b1c72', nome: 'Viagem Europa', descricao: 'Passagens e hospedagem em Paris', valor_objetivo: 15000.00, valor_atual: 6750.00, data_limite: '2026-12-15', status: 'EM_ANDAMENTO', criado_em: '2026-01-20T10:00:00Z', alterado_em: '2026-08-01T15:00:00Z' }
    ]
  },
  {
    id: 'configuracoes',
    name: 'Configurações',
    description: 'Definições de preferências de ambiente por usuário (tema, moeda, backup).',
    columns: [
      { name: 'id', type: 'VARCHAR (UUID)', keyType: 'PK', description: 'ID da configuração', sampleValue: 'cfg_8b21ca0e' },
      { name: 'usuario_id', type: 'VARCHAR (UUID)', keyType: 'FK', refTable: 'Usuários', description: 'Usuário correspondente', sampleValue: 'usr_f89b1c72' },
      { name: 'chave', type: 'VARCHAR(50)', description: 'Identificador único do parâmetro', sampleValue: 'pref_tema' },
      { name: 'valor', type: 'TEXT', description: 'Conteúdo/Opção salva', sampleValue: 'escuro' },
      { name: 'criado_em', type: 'TIMESTAMP', description: 'Data de registro', sampleValue: '2026-01-15T10:05:00Z' },
      { name: 'alterado_em', type: 'TIMESTAMP', description: 'Data da alteração', sampleValue: '2026-01-15T10:05:00Z' }
    ],
    sampleRows: [
      { id: 'cfg_01', usuario_id: 'usr_f89b1c72', chave: 'pref_tema', valor: 'escuro', criado_em: '2026-01-15T10:05:00Z', alterado_em: '2026-01-15T10:05:00Z' },
      { id: 'cfg_02', usuario_id: 'usr_f89b1c72', chave: 'pref_moeda', valor: 'BRL', criado_em: '2026-01-15T10:05:00Z', alterado_em: '2026-01-15T10:05:00Z' }
    ]
  },
  {
    id: 'assinaturas',
    name: 'Assinaturas',
    description: 'Armazena serviços recorrentes debitados automaticamente ou pagos via boleto.',
    columns: [
      { name: 'id', type: 'VARCHAR (UUID)', keyType: 'PK', description: 'ID da assinatura', sampleValue: 'sub_netflix' },
      { name: 'usuario_id', type: 'VARCHAR (UUID)', keyType: 'FK', refTable: 'Usuários', description: 'Dono', sampleValue: 'usr_f89b1c72' },
      { name: 'nome', type: 'VARCHAR(100)', description: 'Nome do serviço', sampleValue: 'Netflix' },
      { name: 'valor', type: 'DECIMAL(12,2)', description: 'Valor recorrente da mensalidade', sampleValue: '55.90' },
      { name: 'dia_vencimento', type: 'INT', description: 'Dia do mês do faturamento', sampleValue: '15' },
      { name: 'categoria_id', type: 'VARCHAR (UUID)', keyType: 'FK', refTable: 'Categorias', description: 'Categoria', sampleValue: 'cat_01' },
      { name: 'conta_id', type: 'VARCHAR (UUID)', keyType: 'FK', refTable: 'Contas Bancárias', description: 'Conta de débito padrão', sampleValue: 'acc_01' },
      { name: 'status', type: 'VARCHAR(20)', description: 'ATIVO, INATIVO', sampleValue: 'ATIVO' },
      { name: 'criado_em', type: 'TIMESTAMP', description: 'Criação', sampleValue: '2026-01-15T12:00:00Z' },
      { name: 'alterado_em', type: 'TIMESTAMP', description: 'Alteração', sampleValue: '2026-08-01T15:00:00Z' }
    ],
    sampleRows: [
      { id: 'sub_netflix', usuario_id: 'usr_f89b1c72', nome: 'Netflix', valor: 55.90, dia_vencimento: 15, categoria_id: 'cat_01', conta_id: 'acc_01', status: 'ATIVO', criado_em: '2026-01-15T12:00:00Z', alterado_em: '2026-08-01T15:00:00Z' },
      { id: 'sub_spotify', usuario_id: 'usr_f89b1c72', nome: 'Spotify Premium', valor: 24.90, dia_vencimento: 22, categoria_id: 'cat_01', conta_id: 'acc_01', status: 'ATIVO', criado_em: '2026-01-15T12:10:00Z', alterado_em: '2026-08-01T15:00:00Z' },
      { id: 'sub_apple', usuario_id: 'usr_f89b1c72', nome: 'iCloud 200GB', valor: 14.90, dia_vencimento: 8, categoria_id: 'cat_02', conta_id: 'acc_01', status: 'ATIVO', criado_em: '2026-01-15T12:15:00Z', alterado_em: '2026-08-01T15:00:00Z' }
    ]
  },
  {
    id: 'transferencias',
    name: 'Transferências',
    description: 'Histórico de movimentação de saldos internos entre contas bancárias do próprio usuário.',
    columns: [
      { name: 'id', type: 'VARCHAR (UUID)', keyType: 'PK', description: 'ID da transferência', sampleValue: 'trx_98b2dfa1' },
      { name: 'usuario_id', type: 'VARCHAR (UUID)', keyType: 'FK', refTable: 'Usuários', description: 'Dono', sampleValue: 'usr_f89b1c72' },
      { name: 'conta_origem_id', type: 'VARCHAR (UUID)', keyType: 'FK', refTable: 'Contas Bancárias', description: 'Conta de onde sai o valor', sampleValue: 'acc_01' },
      { name: 'conta_destino_id', type: 'VARCHAR (UUID)', keyType: 'FK', refTable: 'Contas Bancárias', description: 'Conta que recebe o valor', sampleValue: 'acc_02' },
      { name: 'valor', type: 'DECIMAL(12,2)', description: 'Quantidade monetária transferida', sampleValue: '1000.00' },
      { name: 'data_hora', type: 'TIMESTAMP', description: 'Efetivação da transferência', sampleValue: '2026-08-01T10:00:00Z' },
      { name: 'descricao', type: 'VARCHAR(150)', description: 'Comentário ou justificativa', sampleValue: 'Transferência para Reserva Itaú' },
      { name: 'criado_em', type: 'TIMESTAMP', description: 'Criação', sampleValue: '2026-08-01T10:00:00Z' }
    ],
    sampleRows: [
      { id: 'trx_01', usuario_id: 'usr_f89b1c72', conta_origem_id: 'acc_01', conta_destino_id: 'acc_02', valor: 1000.00, data_hora: '2026-08-01T10:00:00Z', descricao: 'Investir na caixinha Itaú', criado_em: '2026-08-01T10:00:00Z' }
    ]
  },
  {
    id: 'historico',
    name: 'Histórico',
    description: 'Armazena logs de auditoria detalhados de mutações de dados na planilha (Change Tracking).',
    columns: [
      { name: 'id', type: 'VARCHAR (UUID)', keyType: 'PK', description: 'ID único do registro de histórico', sampleValue: 'hst_7b9a2cf1' },
      { name: 'usuario_id', type: 'VARCHAR (UUID)', keyType: 'FK', refTable: 'Usuários', description: 'Usuário autor do evento', sampleValue: 'usr_f89b1c72' },
      { name: 'entidade', type: 'VARCHAR(50)', description: 'Planilha alterada (Ex: lancamentos)', sampleValue: 'lancamentos' },
      { name: 'entidade_id', type: 'VARCHAR(50)', description: 'ID da linha mutada', sampleValue: 'txn_03' },
      { name: 'acao', type: 'VARCHAR(20)', description: 'Operação executada (CRIAR, EDITAR, DELETAR)', sampleValue: 'EDITAR' },
      { name: 'valores_anteriores', type: 'TEXT (JSON)', description: 'Estado anterior dos dados em string JSON', sampleValue: '{"status":"PENDENTE"}' },
      { name: 'valores_novos', type: 'TEXT (JSON)', description: 'Estado posterior dos dados em string JSON', sampleValue: '{"status":"PAGO"}' },
      { name: 'data_hora', type: 'TIMESTAMP', description: 'Instante do evento', sampleValue: '2026-08-01T15:05:00Z' }
    ],
    sampleRows: [
      { id: 'hst_01', usuario_id: 'usr_f89b1c72', entidade: 'lancamentos', entidade_id: 'txn_03', acao: 'EDITAR', valores_anteriores: '{"status":"PENDENTE"}', valores_novos: '{"status":"PAGO"}', data_hora: '2026-08-01T15:05:00Z' }
    ]
  },
  {
    id: 'logs',
    name: 'Logs',
    description: 'Logs do servidor Google Apps Script para diagnóstico de depuração técnica do WebApp.',
    columns: [
      { name: 'id', type: 'VARCHAR (UUID)', keyType: 'PK', description: 'ID do log', sampleValue: 'log_9a8bc0e4' },
      { name: 'nivel', type: 'VARCHAR(15)', description: 'Intensidade: INFO, WARN, ERROR, DEBUG', sampleValue: 'INFO' },
      { name: 'classe_metodo', type: 'VARCHAR(100)', description: 'Trecho do código-fonte originário', sampleValue: 'TransactionService.create()' },
      { name: 'mensagem', type: 'TEXT', description: 'Conteúdo textual descritivo do log', sampleValue: 'Novo lançamento cadastrado com sucesso.' },
      { name: 'contexto', type: 'TEXT (JSON)', description: 'Parâmetros técnicos adicionais em JSON', sampleValue: '{"userId":"usr_f89b1c72","txnId":"txn_03"}' },
      { name: 'data_hora', type: 'TIMESTAMP', description: 'Hora exata da ocorrência', sampleValue: '2026-08-01T14:32:01Z' }
    ],
    sampleRows: [
      { id: 'log_01', nivel: 'INFO', classe_metodo: 'TransactionService.create()', mensagem: 'Novo lançamento cadastrado com sucesso.', contexto: '{"userId":"usr_f89b1c72","txnId":"txn_03"}', data_hora: '2026-08-01T14:32:01Z' },
      { id: 'log_02', nivel: 'ERROR', classe_metodo: 'AuthService.login()', mensagem: 'Tentativa de login com senha incorreta.', contexto: '{"email":"cristianokuhn1993@gmail.com"}', data_hora: '2026-08-01T12:00:03Z' }
    ]
  }
];
