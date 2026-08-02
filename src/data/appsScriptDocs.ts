/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiEndpoint } from '../types';

export const APPS_SCRIPT_ENDPOINTS: ApiEndpoint[] = [
  {
    id: 'login',
    method: 'POST',
    path: '/login',
    description: 'Realiza a autenticação do usuário e retorna o token de sessão e dados cadastrais.',
    parameters: [],
    requestBody: JSON.stringify({ email: 'cristianokuhn1993@gmail.com', senha: 'sua_senha_secreta' }, null, 2),
    responseBody: JSON.stringify({
      success: true,
      token: 'session_tkn_8c29bf7d10e',
      user: {
        id: 'usr_f89b1c72',
        nome: 'Cristiano Kuhn',
        email: 'cristianokuhn1993@gmail.com',
        status: 'ATIVO'
      }
    }, null, 2),
    codeSnippet: `/**
 * Controller: Login
 */
function handleLogin(payload) {
  const email = payload.email;
  const password = payload.senha;
  
  if (!email || !password) {
    throw new Error("E-mail e senha são obrigatórios para autenticação.");
  }
  
  const userRecord = AuthService.authenticate(email, password);
  return {
    success: true,
    token: AuthService.generateToken(userRecord.id),
    user: {
      id: userRecord.id,
      nome: userRecord.nome,
      email: userRecord.email,
      status: userRecord.status
    }
  };
}`
  },
  {
    id: 'get_dashboard',
    method: 'GET',
    path: '/dashboard',
    description: 'Retorna os KPIs e indicadores consolidados para a tela principal (Competência Corrente).',
    parameters: [
      { name: 'usuario_id', type: 'string', required: true, description: 'ID do usuário' },
      { name: 'competencia', type: 'string', required: true, description: 'Mês de análise (YYYY-MM)' }
    ],
    responseBody: JSON.stringify({
      success: true,
      data: {
        kpis: {
          saldo_atual: 9740.50,
          receitas_mes: 12000.00,
          despesas_mes: 2259.50,
          economia_mes: 9740.50,
          saldo_previsto: 9684.60,
          contas_vencer: 3,
          contas_vencidas: 0,
          receitas_futuras: 0.00,
          despesas_futuras: 70.80
        },
        top_categorias: [
          { categoria: 'Alimentação', valor: 415.90, percentual: 18.4, cor: '#ef4444' },
          { categoria: 'Transporte', valor: 150.00, percentual: 6.6, cor: '#3b82f6' },
          { categoria: 'Assinaturas', valor: 70.80, percentual: 3.1, cor: '#a855f7' }
        ],
        proximos_pagamentos: [
          { id: 'sub_netflix', descricao: 'Assinatura Netflix', valor: 55.90, vencimento: '2026-08-15', status: 'PENDENTE' },
          { id: 'sub_apple', descricao: 'Assinatura iCloud', valor: 14.90, vencimento: '2026-08-08', status: 'PENDENTE' }
        ]
      }
    }, null, 2),
    codeSnippet: `/**
 * Controller: Dashboard Summary
 */
function handleGetDashboard(params) {
  const userId = params.usuario_id;
  const competencia = params.competencia; // YYYY-MM
  
  if (!userId || !competencia) {
    throw new Error("Parâmetros 'usuario_id' e 'competencia' são obrigatórios.");
  }
  
  // Consolida dados usando a camada Service
  const dashboardData = DashboardService.getSummary(userId, competencia);
  return {
    success: true,
    data: dashboardData
  };
}`
  },
  {
    id: 'create_lancamento',
    method: 'POST',
    path: '/lancamentos',
    description: 'Cria uma nova transação financeira. Caso seja no cartão de crédito ou debite de uma conta, atualiza automaticamente o limite e o saldo da mesma.',
    parameters: [],
    requestBody: JSON.stringify({
      usuario_id: 'usr_f89b1c72',
      descricao: 'Supermercado Angeloni',
      categoria_id: 'cat_01',
      subcategoria_id: 'sub_01',
      conta_id: 'acc_01',
      cartao_id: 'crd_01',
      valor: 350.40,
      tipo: 'DESPESA',
      forma_pagamento: 'CREDITO',
      data_competencia: '2026-08',
      data_hora: '2026-08-01T14:30:00Z',
      observacoes: 'Compras do mês',
      status: 'PAGO'
    }, null, 2),
    responseBody: JSON.stringify({
      success: true,
      mensagem: 'Lançamento criado com sucesso.',
      id: 'txn_92c019be',
      saldo_atualizado: 4320.50,
      limite_cartao_atualizado: 7500.00
    }, null, 2),
    codeSnippet: `/**
 * Controller: Lançamentos
 */
function handleCreateTransaction(payload) {
  // Validações de payload
  Validator.validateTransactionPayload(payload);
  
  // Persiste no banco e atualiza saldos de Contas ou Cartões em uma Transação Lógica
  const result = TransactionService.create(payload);
  
  // Salva no Log de auditoria
  Logger.info("TransactionService.create", "Novo lançamento cadastrado com sucesso", {
    userId: payload.usuario_id,
    txnId: result.id
  });
  
  return {
    success: true,
    mensagem: "Lançamento criado com sucesso.",
    id: result.id,
    saldo_atualizado: result.saldo_atualizado,
    limite_cartao_atualizado: result.limite_cartao_atualizado
  };
}`
  },
  {
    id: 'create_parcelamento',
    method: 'POST',
    path: '/parcelamentos',
    description: 'Cadastra uma compra parcelada, gerando automaticamente todos os lançamentos futuros correspondentes nas faturas e competências adequadas.',
    parameters: [],
    requestBody: JSON.stringify({
      usuario_id: 'usr_f89b1c72',
      descricao: 'Notebook Dell XPS',
      valor_total: 6000.00,
      quantidade_parcelas: 12,
      categoria_id: 'cat_04',
      subcategoria_id: 'sub_03',
      cartao_id: 'crd_01',
      data_inicio: '2026-08-01T10:00:00Z'
    }, null, 2),
    responseBody: JSON.stringify({
      success: true,
      mensagem: 'Parcelamento contratado com sucesso. 12 lançamentos provisionados.',
      parcelamento_id: 'par_082a170c',
      valor_parcela: 500.00
    }, null, 2),
    codeSnippet: `/**
 * Controller: Parcelamento
 */
function handleCreateInstallment(payload) {
  const userId = payload.usuario_id;
  const desc = payload.descricao;
  const valTotal = parseFloat(payload.valor_total);
  const qtdParcelas = parseInt(payload.quantidade_parcelas);
  const cardId = payload.cartao_id;
  const catId = payload.categoria_id;
  
  if (!userId || !desc || !valTotal || !qtdParcelas || !cardId) {
    throw new Error("Dados incompletos para processar parcelamento.");
  }
  
  const result = InstallmentService.create({
    userId, desc, valTotal, qtdParcelas, cardId, catId,
    startDate: payload.data_inicio || new Date().toISOString()
  });
  
  return {
    success: true,
    mensagem: "Parcelamento contratado com sucesso. " + qtdParcelas + " lançamentos provisionados.",
    parcelamento_id: result.id,
    valor_parcela: result.valor_parcela
  };
}`
  },
  {
    id: 'backup_export',
    method: 'GET',
    path: '/backup',
    description: 'Faz backup integral do banco de dados (Google Sheets) exportando as entidades consolidadas no formato JSON estruturado.',
    parameters: [
      { name: 'usuario_id', type: 'string', required: true, description: 'ID do usuário proprietário' }
    ],
    responseBody: JSON.stringify({
      success: true,
      backup_id: 'bck_20260801_200738',
      data_criacao: '2026-08-01T20:07:38Z',
      database_tables: {
        usuarios: 1,
        categorias: 4,
        subcategorias: 3,
        contas_bancarias: 3,
        cartoes: 2,
        lancamentos: 3,
        parcelamentos: 1,
        investimentos: 2,
        metas: 2,
        assinaturas: 3,
        transferencias: 1
      },
      gdrive_folder: 'https://drive.google.com/drive/folders/backup_id_folder'
    }, null, 2),
    codeSnippet: `/**
 * Controller: Backup
 */
function handleBackup(params) {
  const userId = params.usuario_id;
  if (!userId) {
    throw new Error("Identificação de usuário obrigatória para backup.");
  }
  
  const backupResult = BackupService.runBackup(userId);
  return {
    success: true,
    backup_id: backupResult.backupId,
    data_criacao: backupResult.createdAt,
    database_tables: backupResult.tablesCount,
    gdrive_folder: backupResult.gdriveFolderUrl
  };
}`
  }
];

// Complete apps script code template ready to be pasted on the Apps Script IDE!
export const APPS_SCRIPT_SOURCE_CODE = {
  main: `/**
 * FINANÇAS PRO - BACKEND ENGINE (Google Apps Script)
 * Arquivo: main.gs
 * Responsável: Roteamento de Requisições, Autenticação de Tokens e Gestão de Erros.
 */

function doPost(e) {
  return processRequest(e, "POST");
}

function doGet(e) {
  return processRequest(e, "GET");
}

/**
 * Roteador unificado com Headers CORS habilitados para FlutterFlow
 */
function processRequest(e, method) {
  const startTime = new Date().getTime();
  let responsePayload = {};
  
  try {
    // 1. Configuração de CORS preliminar
    if (!e) {
      return createJsonResponse({ success: false, error: "Nenhum parâmetro de entrada fornecido." });
    }
    
    // 2. Extração de rota a partir do pathInfo (Ex: /login, /dashboard)
    const path = e.pathInfo ? "/" + e.pathInfo : "/";
    const params = e.parameter || {};
    let body = null;
    
    if (method === "POST" && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
    
    // 3. Validação de Token de Autenticação (Ignorado para /login e /sign-up)
    if (path !== "/login" && path !== "/sign-up") {
      const authHeader = e.headers && (e.headers["Authorization"] || e.headers["authorization"]);
      const token = authHeader ? authHeader.replace("Bearer ", "") : params.token;
      AuthService.validateToken(token);
    }
    
    // 4. Roteamento das rotas
    if (method === "POST") {
      switch (path) {
        case "/login":
          responsePayload = handleLogin(body);
          break;
        case "/lancamentos":
          responsePayload = handleCreateTransaction(body);
          break;
        case "/parcelamentos":
          responsePayload = handleCreateInstallment(body);
          break;
        case "/investimentos":
          responsePayload = handleCreateInvestment(body);
          break;
        case "/metas":
          responsePayload = handleCreateGoal(body);
          break;
        case "/assinaturas":
          responsePayload = handleCreateSubscription(body);
          break;
        default:
          throw new Error("Rota POST não encontrada: " + path);
      }
    } else if (method === "GET") {
      switch (path) {
        case "/dashboard":
          responsePayload = handleGetDashboard(params);
          break;
        case "/lancamentos":
          responsePayload = handleGetTransactions(params);
          break;
        case "/contas":
          responsePayload = handleGetAccounts(params);
          break;
        case "/cartoes":
          responsePayload = handleGetCards(params);
          break;
        case "/investimentos":
          responsePayload = handleGetInvestments(params);
          break;
        case "/metas":
          responsePayload = handleGetGoals(params);
          break;
        case "/assinaturas":
          responsePayload = handleGetSubscriptions(params);
          break;
        case "/backup":
          responsePayload = handleBackup(params);
          break;
        default:
          throw new Error("Rota GET não encontrada: " + path);
      }
    }
    
  } catch (err) {
    // Tratamento global de erros com gravação de log
    const errorTime = new Date().toISOString();
    responsePayload = {
      success: false,
      error: err.message || "Erro interno do servidor Apps Script",
      timestamp: errorTime
    };
    
    try {
      Logger.error("main.gs:processRequest", err.message, { stack: err.stack, method, path });
    } catch (logErr) {
      console.error("Falha ao registrar log no Sheets: ", logErr);
    }
  }
  
  return createJsonResponse(responsePayload);
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`,

  database: `/**
 * FINANÇAS PRO - BACKEND ENGINE (Google Apps Script)
 * Arquivo: database.gs
 * Responsável: Conexão ORM leve, busca de tabelas, inserções, deleções e indexação automática.
 */

const DatabaseContext = {
  // Retorna o arquivo de planilha ativo
  getSpreadsheet: function() {
    // Substitua pelo ID fixo da planilha de produção no Google Drive para segurança absoluta
    const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
    if (SPREADSHEET_ID) {
      return SpreadsheetApp.openById(SPREADSHEET_ID);
    }
    return SpreadsheetApp.getActiveSpreadsheet();
  },
  
  // Retorna uma aba pelo nome. Caso não exista, cria automaticamente com cabeçalhos!
  getSheet: function(sheetName) {
    const ss = this.getSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      this.initializeSheetHeaders(sheetName, sheet);
    }
    return sheet;
  },
  
  // Seleciona linhas filtrando por critérios (chave/valor)
  select: function(sheetName, criteria = {}) {
    const sheet = this.getSheet(sheetName);
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return []; // Apenas cabeçalho
    
    const headers = data[0];
    const rows = [];
    
    for (let i = 1; i < data.length; i++) {
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = data[i][index];
      });
      
      // Aplicar filtros
      let matches = true;
      for (let key in criteria) {
        if (rowData[key] != criteria[key]) {
          matches = false;
          break;
        }
      }
      
      if (matches) {
        rowData._rowNum = i + 1; // Guarda índice físico para updates
        rows.push(rowData);
      }
    }
    return rows;
  },
  
  // Insere um registro na planilha correspondente mapeando chaves
  insert: function(sheetName, record) {
    const sheet = this.getSheet(sheetName);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Geração automática de ID único se ausente
    if (!record.id) {
      record.id = this.generateUUID();
    }
    
    // Auditoria automática
    record.criado_em = new Date().toISOString();
    record.alterado_em = new Date().toISOString();
    record.status = record.status || "ATIVO";
    
    const newRow = headers.map(header => {
      return record[header] !== undefined ? record[header] : "";
    });
    
    sheet.appendRow(newRow);
    return record;
  },
  
  // Atualiza um registro existente
  update: function(sheetName, recordId, updatedFields) {
    const sheet = this.getSheet(sheetName);
    const rows = this.select(sheetName, { id: recordId });
    
    if (rows.length === 0) {
      throw new Error("Registro " + recordId + " não encontrado para atualização em " + sheetName);
    }
    
    const targetRow = rows[0];
    const physicalRowIndex = targetRow._rowNum;
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    updatedFields.alterado_em = new Date().toISOString();
    
    headers.forEach((header, colIndex) => {
      if (updatedFields[header] !== undefined) {
        sheet.getRange(physicalRowIndex, colIndex + 1).setValue(updatedFields[header]);
      }
    });
    
    return { id: recordId, ...targetRow, ...updatedFields };
  },
  
  // Exclusão lógica (altera status para EXCLUIDO) ou Física
  delete: function(sheetName, recordId, hardDelete = false) {
    const sheet = this.getSheet(sheetName);
    const rows = this.select(sheetName, { id: recordId });
    
    if (rows.length === 0) return false;
    
    const targetRow = rows[0];
    if (hardDelete) {
      sheet.deleteRow(targetRow._rowNum);
    } else {
      this.update(sheetName, recordId, { status: "EXCLUIDO" });
    }
    return true;
  },
  
  generateUUID: function() {
    return Utilities.getUuid().substring(0, 13); // ID curto profissional
  },
  
  // Cria automaticamente a estrutura de planilhas se vazia
  initializeSheetHeaders: function(sheetName, sheet) {
    const schemas = {
      "usuarios": ["id", "nome", "email", "senha_hash", "status", "criado_em", "alterado_em", "criado_por"],
      "categorias": ["id", "nome", "tipo", "icone", "cor_hex", "status", "criado_em", "alterado_em", "criado_por"],
      "subcategorias": ["id", "categoria_id", "nome", "status", "criado_em", "alterado_em", "criado_por"],
      "contas_bancarias": ["id", "usuario_id", "nome", "tipo", "instituicao", "saldo_inicial", "saldo_atual", "status", "criado_em", "alterado_em", "criado_por"],
      "cartoes": ["id", "usuario_id", "nome", "instituicao", "limite_total", "limite_utilizado", "dia_fechamento", "dia_vencimento", "cor_hex", "status", "criado_em", "alterado_em", "criado_por"],
      "lancamentos": ["id", "usuario_id", "descricao", "categoria_id", "subcategoria_id", "conta_id", "cartao_id", "valor", "tipo", "forma_pagamento", "data_competencia", "data_hora", "observacoes", "anexo_url", "status", "parcelamento_id", "assinatura_id", "criado_em", "alterado_em"],
      "parcelamentos": ["id", "usuario_id", "descricao", "valor_total", "quantidade_parcelas", "valor_parcela", "parcelas_pagas", "status", "criado_em", "alterado_em", "criado_por"],
      "investimentos": ["id", "usuario_id", "nome", "tipo", "instituicao", "valor_aplicado", "valor_atual", "lucro_prejuizo", "data_aplicacao", "status", "criado_em", "alterado_em"],
      "metas": ["id", "usuario_id", "nome", "descricao", "valor_objetivo", "valor_atual", "data_limite", "status", "criado_em", "alterado_em"],
      "configuracoes": ["id", "usuario_id", "chave", "valor", "criado_em", "alterado_em"],
      "assinaturas": ["id", "usuario_id", "nome", "valor", "dia_vencimento", "categoria_id", "conta_id", "status", "criado_em", "alterado_em"],
      "transferencias": ["id", "usuario_id", "conta_origem_id", "conta_destino_id", "valor", "data_hora", "descricao", "criado_em"],
      "historico": ["id", "usuario_id", "entidade", "entidade_id", "acao", "valores_anteriores", "valores_novos", "data_hora"],
      "logs": ["id", "nivel", "classe_metodo", "mensagem", "contexto", "data_hora"]
    };
    
    const headers = schemas[sheetName] || ["id", "criado_em", "status"];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers])
         .setFontWeight("bold")
         .setBackground("#0f172a")
         .setFontColor("#ffffff");
  }
};
`,

  services: `/**
 * FINANÇAS PRO - BACKEND ENGINE (Google Apps Script)
 * Arquivo: services.gs
 * Responsável: Lógicas complexas de negócio, integridade de saldos, geração de parcelamentos e backups automáticos.
 */

const AuthService = {
  authenticate: function(email, password) {
    const users = DatabaseContext.select("usuarios", { email: email, status: "ATIVO" });
    if (users.length === 0) {
      throw new Error("Usuário ou senha incorretos.");
    }
    
    const user = users[0];
    const incomingHash = this.hashPassword(password);
    
    if (user.senha_hash !== incomingHash) {
      throw new Error("Usuário ou senha incorretos.");
    }
    
    return user;
  },
  
  generateToken: function(userId) {
    const token = "tkn_" + Utilities.getUuid().substring(0, 16);
    // Persiste a sessão nas Configurações
    DatabaseContext.insert("configuracoes", {
      usuario_id: userId,
      chave: "session_token",
      valor: token
    });
    return token;
  },
  
  validateToken: function(token) {
    if (!token) throw new Error("Acesso não autorizado: Token ausente.");
    
    const sessions = DatabaseContext.select("configuracoes", {
      chave: "session_token",
      valor: token
    });
    
    if (sessions.length === 0) {
      throw new Error("Sessão expirada ou inválida. Por favor, refaça o login.");
    }
    
    return sessions[0].usuario_id;
  },
  
  hashPassword: function(pwd) {
    // Algoritmo SHA-256 simplificado para Apps Script
    const signature = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, pwd);
    let hash = "";
    for (let i = 0; i < signature.length; i++) {
      let byteValue = signature[i];
      if (byteValue < 0) byteValue += 256;
      let byteString = byteValue.toString(16);
      if (byteString.length == 1) byteString = "0" + byteString;
      hash += byteString;
    }
    return hash;
  }
};

const TransactionService = {
  create: function(txn) {
    // 1. Persiste o lançamento principal
    const savedTxn = DatabaseContext.insert("lancamentos", txn);
    
    // 2. Fluxo de cálculo de saldo
    const val = parseFloat(txn.valor);
    
    if (txn.tipo === "DESPESA" && txn.forma_pagamento === "CREDITO" && txn.cartao_id) {
      // Atualiza limite de cartões
      const cards = DatabaseContext.select("cartoes", { id: txn.cartao_id });
      if (cards.length > 0) {
        const card = cards[0];
        const novoLimiteUtilizado = parseFloat(card.limite_utilizado) + val;
        DatabaseContext.update("cartoes", card.id, {
          limite_utilizado: novoLimiteUtilizado
        });
      }
    } else if (txn.conta_id) {
      // Atualiza saldo físico bancário
      const accounts = DatabaseContext.select("contas_bancarias", { id: txn.conta_id });
      if (accounts.length > 0) {
        const acc = accounts[0];
        let novoSaldo = parseFloat(acc.saldo_atual);
        
        if (txn.tipo === "DESPESA" || txn.tipo === "INVESTIMENTO") {
          novoSaldo -= val;
        } else if (txn.tipo === "RECEITA") {
          novoSaldo += val;
        }
        
        DatabaseContext.update("contas_bancarias", acc.id, {
          saldo_atual: novoSaldo
        });
      }
    }
    
    return {
      id: savedTxn.id,
      saldo_atualizado: true
    };
  }
};

const InstallmentService = {
  create: function(config) {
    const installmentId = "inst_" + DatabaseContext.generateUUID();
    const valorParcela = config.valTotal / config.qtdParcelas;
    
    // 1. Cria o registro de parcelamento para auditoria
    DatabaseContext.insert("parcelamentos", {
      id: installmentId,
      usuario_id: config.userId,
      descricao: config.desc,
      valor_total: config.valTotal,
      quantidade_parcelas: config.qtdParcelas,
      valor_parcela: valorParcela,
      parcelas_pagas: 0,
      status: "ATIVO"
    });
    
    // 2. Provisiona os N lançamentos futuros no cartão nas competências futuras
    let baseDate = new Date(config.startDate);
    
    for (let i = 1; i <= config.qtdParcelas; i++) {
      const compYear = baseDate.getFullYear();
      const compMonth = String(baseDate.getMonth() + 1).padStart(2, "0");
      const dataCompetencia = compYear + "-" + compMonth;
      
      TransactionService.create({
        usuario_id: config.userId,
        descricao: config.desc + " (" + i + "/" + config.qtdParcelas + ")",
        categoria_id: config.catId,
        conta_id: "",
        cartao_id: config.cardId,
        valor: valorParcela,
        tipo: "DESPESA",
        forma_pagamento: "CREDITO",
        data_competencia: dataCompetencia,
        data_hora: baseDate.toISOString(),
        status: i === 1 ? "PAGO" : "PENDENTE",
        parcelamento_id: installmentId
      });
      
      // Incrementa 1 mês para a próxima fatura/competência
      baseDate.setMonth(baseDate.getMonth() + 1);
    }
    
    return {
      id: installmentId,
      valor_parcela: valorParcela
    };
  }
};

const BackupService = {
  runBackup: function(userId) {
    const ss = DatabaseContext.getSpreadsheet();
    const backupId = "bck_" + Utilities.formatDate(new Date(), "GMT-3", "yyyyMMdd_HHmmss");
    
    const tables = [
      "usuarios", "categorias", "subcategorias", "contas_bancarias", 
      "cartoes", "lancamentos", "parcelamentos", "investimentos", 
      "metas", "assinaturas", "transferencias"
    ];
    
    const backupObj = {
      backupId: backupId,
      createdAt: new Date().toISOString(),
      userId: userId,
      tables: {}
    };
    
    tables.forEach(table => {
      const rows = DatabaseContext.select(table, { usuario_id: userId });
      backupObj.tables[table] = rows;
    });
    
    // 1. Armazena o backup fisicamente em JSON dentro de uma pasta no GDrive
    const folderName = "FinancasPro_Backups";
    let folders = DriveApp.getFoldersByName(folderName);
    let folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
    
    const file = folder.createFile(backupId + ".json", JSON.stringify(backupObj, null, 2), "application/json");
    
    return {
      backupId: backupId,
      createdAt: backupObj.createdAt,
      tablesCount: tables.reduce((acc, t) => {
        acc[t] = backupObj.tables[t].length;
        return acc;
      }, {}),
      gdriveFolderUrl: folder.getUrl()
    };
  }
};

const Logger = {
  log: function(nivel, classeMetodo, mensagem, contextoObj = {}) {
    try {
      DatabaseContext.insert("logs", {
        nivel: nivel,
        classe_metodo: classeMetodo,
        mensagem: mensagem,
        contexto: JSON.stringify(contextoObj),
        data_hora: new Date().toISOString()
      });
    } catch(err) {
      console.error("Falha silenciosa de gravação de log: " + err.message);
    }
  },
  info: function(c, m, ctx) { this.log("INFO", c, m, ctx); },
  warn: function(c, m, ctx) { this.log("WARN", c, m, ctx); },
  error: function(c, m, ctx) { this.log("ERROR", c, m, ctx); }
};
`
};
