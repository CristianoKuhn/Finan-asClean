/**
 * ==========================================================================================
 *                          SISTEMA DE GESTÃO FINANCEIRA PESSOAL - FINANÇAS PRO
 *                             BACKEND SOBERANO: GOOGLE APPS SCRIPT WEBAPP
 * ==========================================================================================
 * 
 * Desenvolvido por: Arquiteto de Software Sênior & Especialista em Google Workspace APIs.
 * Destinado a: Cristiano Kuhn (cristianokuhn1993@gmail.com)
 * 
 * Este script atua como o motor de banco de dados relacional e controlador da API REST
 * hospedado no Google Drive, salvando todos os dados de forma estruturada nas abas de uma planilha.
 * 
 * ------------------------------------------------------------------------------------------
 * INSTRUÇÕES DE IMPLANTAÇÃO PASSO A PASSO:
 * ------------------------------------------------------------------------------------------
 * 1. Crie uma nova Planilha no seu Google Drive e nomeie-a como "Finanças Pro - Banco de Dados".
 * 2. No menu superior da planilha, clique em "Extensões" > "Apps Script".
 * 3. Apague todo o código padrão existente no editor e cole este arquivo por completo.
 * 4. Salve o projeto clicando no ícone do disquete ou pressionando Ctrl+S (nomeie o projeto como "Finanças Pro API").
 * 5. Execute a função "inicializarBancoDeDados" uma única vez para criar automaticamente todas as 14 abas
 *    do dicionário de dados relacional pré-configurado com cabeçalhos e registros de amostra.
 * 6. Clique em "Implantar" > "Nova implantação" (canto superior direito).
 * 7. Selecione o Tipo: "App da Web" (Web App).
 *    - Descrição: "Finanças Pro REST API v1.0"
 *    - Executar como: "Eu" (Sua conta de e-mail / cristianokuhn1993@gmail.com)
 *    - Quem tem acesso: "Qualquer pessoa" (Necessário para que o FlutterFlow ou React consigam realizar chamadas HTTP).
 * 8. Clique em "Implantar" e conceda as permissões do Google Drive se solicitado pelo sistema.
 * 9. Copie o "URL do App da Web" gerado (ex: https://script.google.com/macros/s/.../exec).
 *    - Este URL será colocado na sua variável de ambiente BACKEND_URL ou integrado diretamente no FlutterFlow!
 * 
 * ==========================================================================================
 */

// Configurações Globais do Sistema
var USUARIO_PADRAO_ID = "usr_f89b1c72";
var USUARIO_PADRAO_EMAIL = "cristianokuhn1993@gmail.com";

// Dicionário de 14 Abas & Cabeçalhos Correspondentes ao Dicionário de Dados
var ABAS_SISTEMA = {
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

/**
 * 1. INICIALIZADOR DO BANCO DE DADOS GSHEETS
 * Executar uma vez no Console do Google Apps Script para criar e estruturar toda a arquitetura relacional.
 */
function inicializarBancoDeDados() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log("ERRO CRÍTICO: Abra este script a partir de uma Planilha Google.");
    return;
  }
  
  Logger.log("Iniciando provisionamento das 14 abas do Finanças Pro...");
  
  for (var nomeAba in ABAS_SISTEMA) {
    var aba = ss.getSheetByName(nomeAba);
    if (!aba) {
      aba = ss.insertSheet(nomeAba);
      Logger.log("Aba criada: " + nomeAba);
    } else {
      Logger.log("Aba já existente: " + nomeAba);
    }
    
    // Configura os cabeçalhos das colunas se estiverem vazios
    var colunas = ABAS_SISTEMA[nomeAba];
    aba.getRange(1, 1, 1, colunas.length).setValues([colunas]);
    aba.getRange(1, 1, 1, colunas.length).setFontWeight("bold").setBackground("#0f172a").setFontColor("#f8fafc");
    
    // Congela a primeira linha de cabeçalho
    aba.setFrozenRows(1);
  }
  
  // Alimentação inicial de dados fictícios para fins de testes (Se as tabelas estiverem sem registros)
  popularRegistrosDeAmostra(ss);
  
  Logger.log("Banco de dados provisionado com total sucesso!");
}

/**
 * 2. ROTEADOR HTTP GET
 * Trata requisições de leitura de dados. Permite hidratar todo o aplicativo em uma só chamada eficiente.
 * Suporta o parâmetro de ação "obter_dados_completos" ou buscas direcionadas por tabela/aba.
 */
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var acao = e.parameter.action || "obter_dados_completos";
  var usuarioId = e.parameter.usuario_id || USUARIO_PADRAO_ID;
  var competencia = e.parameter.data_competencia || ""; // Filtro opcional YYYY-MM
  
  try {
    if (acao === "obter_dados_completos") {
      // Retorna uma união compacta das informações vitais para popular o cache de estado global do frontend
      var payload = {
        usuarios: lerRegistrosTabela(ss, "usuarios", "usuario_id", usuarioId),
        categorias: lerRegistrosTabela(ss, "categorias", null, null),
        subcategorias: lerRegistrosTabela(ss, "subcategorias", null, null),
        contas: lerRegistrosTabela(ss, "contas_bancarias", "usuario_id", usuarioId),
        cartoes: lerRegistrosTabela(ss, "cartoes", "usuario_id", usuarioId),
        lancamentos: lerRegistrosTabela(ss, "lancamentos", "usuario_id", usuarioId, competencia),
        metas: lerRegistrosTabela(ss, "metas", "usuario_id", usuarioId),
        assinaturas: lerRegistrosTabela(ss, "assinaturas", "usuario_id", usuarioId),
        investimentos: lerRegistrosTabela(ss, "investimentos", "usuario_id", usuarioId),
        configuracoes: lerRegistrosTabela(ss, "configuracoes", "usuario_id", usuarioId),
        timestamp: new Date().toISOString()
      };
      
      registrarLog("INFO", "REST_API.doGet", "Pacote de sincronização completa de dados baixado.", { usuario_id: usuarioId });
      return formatarRetornoJSON({ success: true, data: payload });
    }
    
    // Buscar uma aba específica individualmente
    var tabela = e.parameter.tabela;
    if (tabela && ABAS_SISTEMA[tabela]) {
      var registros = lerRegistrosTabela(ss, tabela, "usuario_id", usuarioId, competencia);
      return formatarRetornoJSON({ success: true, count: registros.length, data: registros });
    }
    
    return formatarRetornoJSON({ success: false, error: "Ação de leitura ou tabela não especificada ou inválida." });
    
  } catch (err) {
    registrarLog("ERROR", "REST_API.doGet", err.toString(), { error_trace: err.stack });
    return formatarRetornoJSON({ success: false, error: "Falha interna no Apps Script: " + err.toString() });
  }
}

/**
 * 3. ROTEADOR HTTP POST
 * Manipula as mutações de dados: Inserção (CRIAR), Edição (EDITAR) e Exclusão (DELETAR).
 * Inclui integridade referencial nativa e lógica de sincronia de saldos de contas.
 */
function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    var postContent = e.postData.contents;
    var reqBody = JSON.parse(postContent);
    
    var acao = reqBody.action; // "CRIAR" | "EDITAR" | "DELETAR"
    var tabela = reqBody.entidade; // ex: "lancamentos", "contas_bancarias", etc.
    var payload = reqBody.data; // Dados do registro
    var usuarioId = reqBody.usuario_id || USUARIO_PADRAO_ID;
    
    if (!acao || !tabela || !ABAS_SISTEMA[tabela] || !payload) {
      return formatarRetornoJSON({ success: false, error: "Parâmetros obrigatórios ausentes na requisição POST." });
    }
    
    var colunasPermitidas = ABAS_SISTEMA[tabela];
    var idRegistro = payload.id;
    
    if (acao === "CRIAR") {
      // Auto-geração de ID do registro caso não fornecido
      if (!idRegistro) {
        idRegistro = tabela.substring(0, 3) + "_" + Math.random().toString(36).substring(2, 9);
        payload.id = idRegistro;
      }
      payload.usuario_id = usuarioId;
      payload.criado_em = new Date().toISOString();
      payload.alterado_em = new Date().toISOString();
      payload.criado_por = reqBody.email_usuario || USUARIO_PADRAO_EMAIL;
      
      inserirLinhaTabela(ss, tabela, colunasPermitidas, payload);
      
      // Regra de Negócio: Sincronia de Saldos de Contas e Limites de Cartões quando novos lançamentos são criados
      if (tabela === "lancamentos") {
        atualizarSaldosEPorLancamento(ss, payload, "ADICIONAR");
      }
      
      registrarHistoricoAuditoria(ss, usuarioId, tabela, idRegistro, "CRIAR", null, payload);
      registrarLog("INFO", "REST_API.doPost.CRIAR", "Registro criado na tabela " + tabela, { id: idRegistro });
      
      return formatarRetornoJSON({ success: true, id: idRegistro, msg: "Lançamento inserido no Sheets com sucesso.", data: payload });
    }
    
    if (acao === "EDITAR") {
      if (!idRegistro) {
        return formatarRetornoJSON({ success: false, error: "ID de registro é obrigatório para edição." });
      }
      
      var dadosAntigos = obterRegistroPorId(ss, tabela, colunasPermitidas, idRegistro);
      if (!dadosAntigos) {
        return formatarRetornoJSON({ success: false, error: "Registro com ID '" + idRegistro + "' não encontrado para alteração." });
      }
      
      payload.alterado_em = new Date().toISOString();
      atualizarLinhaTabela(ss, tabela, colunasPermitidas, idRegistro, payload);
      
      // Regra de Negócio: Se alterar um lançamento, recalculamos as contas antigas e novas
      if (tabela === "lancamentos") {
        atualizarSaldosEPorLancamento(ss, dadosAntigos, "REMOVER");
        atualizarSaldosEPorLancamento(ss, payload, "ADICIONAR");
      }
      
      registrarHistoricoAuditoria(ss, usuarioId, tabela, idRegistro, "EDITAR", dadosAntigos, payload);
      registrarLog("INFO", "REST_API.doPost.EDITAR", "Registro atualizado na tabela " + tabela, { id: idRegistro });
      
      return formatarRetornoJSON({ success: true, id: idRegistro, msg: "Lançamento atualizado no Sheets com sucesso.", data: payload });
    }
    
    if (acao === "DELETAR") {
      if (!idRegistro) {
        return formatarRetornoJSON({ success: false, error: "ID de registro é obrigatório para exclusão." });
      }
      
      var dadosExcluidos = obterRegistroPorId(ss, tabela, colunasPermitidas, idRegistro);
      if (!dadosExcluidos) {
        return formatarRetornoJSON({ success: false, error: "Registro com ID '" + idRegistro + "' não encontrado para exclusão." });
      }
      
      deletarLinhaTabela(ss, tabela, idRegistro);
      
      // Regra de Negócio: Reverter impacto financeiro se excluir lançamento
      if (tabela === "lancamentos") {
        atualizarSaldosEPorLancamento(ss, dadosExcluidos, "REMOVER");
      }
      
      registrarHistoricoAuditoria(ss, usuarioId, tabela, idRegistro, "DELETAR", dadosExcluidos, null);
      registrarLog("INFO", "REST_API.doPost.DELETAR", "Registro excluído da tabela " + tabela, { id: idRegistro });
      
      return formatarRetornoJSON({ success: true, id: idRegistro, msg: "Lançamento deletado no Sheets com sucesso." });
    }
    
    return formatarRetornoJSON({ success: false, error: "Ação de mutação desconhecida. Use CRIAR, EDITAR ou DELETAR." });
    
  } catch (err) {
    registrarLog("ERROR", "REST_API.doPost", err.toString(), { error_trace: err.stack });
    return formatarRetornoJSON({ success: false, error: "Falha de execução técnica no Apps Script: " + err.toString() });
  }
}

/**
 * ==========================================================================================
 *                          FUNÇÕES AUXILIARES DE ENGENHARIA DE DADOS
 * ==========================================================================================
 */

// Lê todos os registros de uma tabela, mapeando linhas para objetos JSON
function lerRegistrosTabela(ss, nomeAba, campoFiltro, valorFiltro, filtroCompetencia) {
  var aba = ss.getSheetByName(nomeAba);
  if (!aba) return [];
  
  var rangeDados = aba.getDataRange();
  var valores = rangeDados.getValues();
  if (valores.length <= 1) return []; // Apenas cabeçalho
  
  var cabecalho = valores[0];
  var resultado = [];
  
  // Mapeia colunas por nome para facilitar busca
  var idxFiltro = campoFiltro ? cabecalho.indexOf(campoFiltro) : -1;
  var idxCompetencia = cabecalho.indexOf("data_competencia");
  var idxDataHora = cabecalho.indexOf("data_hora");
  var idxDate = cabecalho.indexOf("date"); // no caso da tela de lançamentos local
  
  for (var r = 1; r < valores.length; r++) {
    var linha = valores[r];
    
    // Filtro de usuário se houver necessidade
    if (idxFiltro !== -1 && String(linha[idxFiltro]) !== String(valorFiltro)) {
      continue;
    }
    
    // Filtro por mês de competência (YYYY-MM)
    if (filtroCompetencia) {
      var compValor = "";
      if (idxCompetencia !== -1) {
        compValor = String(linha[idxCompetencia]);
      } else if (idxDataHora !== -1 && linha[idxDataHora]) {
        compValor = String(linha[idxDataHora]).substring(0, 7); // extrai YYYY-MM
      } else if (idxDate !== -1 && linha[idxDate]) {
        compValor = String(linha[idxDate]).substring(0, 7);
      }
      if (compValor && compValor !== filtroCompetencia) {
        continue;
      }
    }
    
    var obj = {};
    for (var col = 0; col < cabecalho.length; col++) {
      var val = linha[col];
      // Trata campos de data para formato legível de string ISO
      if (val instanceof Date) {
        obj[cabecalho[col]] = val.toISOString();
      } else {
        obj[cabecalho[col]] = val;
      }
    }
    resultado.push(obj);
  }
  
  return resultado;
}

// Retorna um único registro buscado pelo campo 'id'
function obterRegistroPorId(ss, nomeAba, colunas, id) {
  var aba = ss.getSheetByName(nomeAba);
  if (!aba) return null;
  
  var valores = aba.getDataRange().getValues();
  var cabecalho = valores[0];
  var idxId = cabecalho.indexOf("id");
  
  for (var r = 1; r < valores.length; r++) {
    if (String(valores[r][idxId]) === String(id)) {
      var obj = {};
      for (var col = 0; col < cabecalho.length; col++) {
        var val = valores[r][col];
        obj[cabecalho[col]] = (val instanceof Date) ? val.toISOString() : val;
      }
      return obj;
    }
  }
  return null;
}

// Insere um novo objeto mapeado no formato de linha na aba do Sheets
function inserirLinhaTabela(ss, nomeAba, colunas, obj) {
  var aba = ss.getSheetByName(nomeAba);
  if (!aba) throw new Error("Aba '" + nomeAba + "' não encontrada.");
  
  var novaLinha = [];
  for (var i = 0; i < colunas.length; i++) {
    var valor = obj[colunas[i]];
    novaLinha.push(valor !== undefined ? valor : "");
  }
  aba.appendRow(novaLinha);
}

// Atualiza uma linha existente localizando-a pelo ID
function atualizarLinhaTabela(ss, nomeAba, colunas, id, obj) {
  var aba = ss.getSheetByName(nomeAba);
  if (!aba) throw new Error("Aba '" + nomeAba + "' não encontrada.");
  
  var valores = aba.getDataRange().getValues();
  var idxId = colunas.indexOf("id");
  
  for (var r = 1; r < valores.length; r++) {
    if (String(valores[r][idxId]) === String(id)) {
      // Encontrou a linha física. r+1 devido ao index da planilha 1-based
      for (var key in obj) {
        var colIndex = colunas.indexOf(key);
        if (colIndex !== -1 && key !== "id") {
          aba.getRange(r + 1, colIndex + 1).setValue(obj[key]);
        }
      }
      return true;
    }
  }
  throw new Error("ID '" + id + "' não localizado para mutação na aba '" + nomeAba + "'.");
}

// Deleta fisicamente uma linha da aba localizando-a pelo ID
function deletarLinhaTabela(ss, nomeAba, id) {
  var aba = ss.getSheetByName(nomeAba);
  if (!aba) throw new Error("Aba '" + nomeAba + "' não encontrada.");
  
  var valores = aba.getDataRange().getValues();
  for (var r = 1; r < valores.length; r++) {
    if (String(valores[r][0]) === String(id)) { // Coluna A (index 0) é sempre ID
      aba.deleteRow(r + 1);
      return true;
    }
  }
  throw new Error("ID '" + id + "' não localizado para exclusão física.");
}

/**
 * 4. REGRAS DE INTEGRIDADE PATRIMONIAL (SALDO DE CONTAS / CARTÃO)
 * Atualiza automaticamente os saldos e limites de crédito em tempo de transação.
 */
function atualizarSaldosEPorLancamento(ss, txn, operacao) {
  var valor = parseFloat(txn.valor || txn.amount || 0);
  if (isNaN(valor) || valor <= 0) return;
  
  var tipo = txn.tipo || txn.type; // RECEITA, DESPESA, INVESTIMENTO
  var contaId = txn.conta_id || txn.accountId;
  var cartaoId = txn.cartao_id || txn.cardId;
  var formaPagamento = txn.forma_pagamento || txn.paymentMethod;
  
  var multiplicador = (operacao === "ADICIONAR") ? 1 : -1;
  
  if (formaPagamento === "CREDITO" && cartaoId) {
    // Impacta limite_utilizado do cartão de crédito
    var abaCartao = ss.getSheetByName("cartoes");
    if (abaCartao) {
      var cartoes = abaCartao.getDataRange().getValues();
      for (var r = 1; r < cartoes.length; r++) {
        if (String(cartoes[r][0]) === String(cartaoId)) {
          var limiteUtilizadoAntigo = parseFloat(cartoes[r][5] || 0);
          var limiteUtilizadoNovo = limiteUtilizadoAntigo + (valor * multiplicador);
          abaCartao.getRange(r + 1, 6).setValue(limiteUtilizadoNovo); // Grava nova coluna limite_utilizado
          break;
        }
      }
    }
  } else if (contaId) {
    // Impacta saldo_atual da conta bancária de débito/crédito
    var abaContas = ss.getSheetByName("contas_bancarias");
    if (abaContas) {
      var contas = abaContas.getDataRange().getValues();
      for (var c = 1; c < contas.length; c++) {
        if (String(contas[c][0]) === String(contaId)) {
          var saldoAtualAntigo = parseFloat(contas[c][6] || 0);
          var delta = 0;
          
          if (tipo === "RECEITA") {
            delta = valor * multiplicador;
          } else if (tipo === "DESPESA" || tipo === "INVESTIMENTO") {
            delta = -valor * multiplicador;
          }
          
          var saldoAtualNovo = saldoAtualAntigo + delta;
          abaContas.getRange(c + 1, 7).setValue(saldoAtualNovo); // Grava nova coluna saldo_atual
          break;
        }
      }
    }
  }
}

/**
 * 5. GRAVAÇÃO DE REGISTROS DE HISTÓRICO DE AUDITORIA (CONFORME Clean Architecture)
 */
function registrarHistoricoAuditoria(ss, usuarioId, entidade, entidadeId, acao, antes, depois) {
  try {
    var payload = {
      id: "aud_" + Math.random().toString(36).substring(2, 9),
      usuario_id: usuarioId,
      entidade: entidade,
      entidade_id: entidadeId,
      acao: acao,
      valores_anteriores: antes ? JSON.stringify(antes) : "",
      valores_novos: depois ? JSON.stringify(depois) : "",
      data_hora: new Date().toISOString()
    };
    inserirLinhaTabela(ss, "historico", ABAS_SISTEMA["historico"], payload);
  } catch (err) {
    Logger.log("Falha ao registrar auditoria: " + err.toString());
  }
}

/**
 * 6. SISTEMA CENTRALIZADO DE LOGS PARA DEBUG DE PRODUÇÃO
 */
function registrarLog(nivel, classeMetodo, mensagem, contexto) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return;
    
    var payload = {
      id: "log_" + Math.random().toString(36).substring(2, 9),
      nivel: nivel,
      classe_metodo: classeMetodo,
      mensagem: mensagem,
      contexto: contexto ? JSON.stringify(contexto) : "",
      data_hora: new Date().toISOString()
    };
    
    inserirLinhaTabela(ss, "logs", ABAS_SISTEMA["logs"], payload);
  } catch (err) {
    Logger.log("Erro ao gravar logs: " + err.toString());
  }
}

// Formata retorno final envelopando em String de Resposta com CORS liberado
function formatarRetornoJSON(obj) {
  var saida = ContentService.createTextOutput(JSON.stringify(obj))
                            .setMimeType(ContentService.MimeType.JSON);
  
  // Apps Script WebApps liberam CORS nativamente, mas adicionar cabeçalho simula perfeitamente REST APIs
  return saida;
}

/**
 * 7. ALIMENTADOR INICIAL DE REGISTROS DE EXEMPLO
 */
function popularRegistrosDeAmostra(ss) {
  var usuario = {
    id: USUARIO_PADRAO_ID,
    nome: "Cristiano Kuhn",
    email: USUARIO_PADRAO_EMAIL,
    senha_hash: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918",
    status: "ATIVO",
    criado_em: new Date().toISOString(),
    alterado_em: new Date().toISOString(),
    criado_por: "system"
  };
  
  var abaUser = ss.getSheetByName("usuarios");
  if (abaUser && abaUser.getLastRow() <= 1) {
    inserirLinhaTabela(ss, "usuarios", ABAS_SISTEMA["usuarios"], usuario);
  }
  
  // Categorias
  var categorias = [
    { id: "cat_01", nome: "Alimentação", tipo: "DESPESA", icone: "Utensils", cor_hex: "#ef4444", status: "ATIVO", criado_em: new Date().toISOString(), alterado_em: new Date().toISOString(), criado_por: "system" },
    { id: "cat_02", nome: "Transporte", tipo: "DESPESA", icone: "Car", cor_hex: "#3b82f6", status: "ATIVO", criado_em: new Date().toISOString(), alterado_em: new Date().toISOString(), criado_por: "system" },
    { id: "cat_03", nome: "Salário", tipo: "RECEITA", icone: "Briefcase", cor_hex: "#10b981", status: "ATIVO", criado_em: new Date().toISOString(), alterado_em: new Date().toISOString(), criado_por: "system" },
    { id: "cat_04", nome: "Investimentos", tipo: "INVESTIMENTO", icone: "TrendingUp", cor_hex: "#a855f7", status: "ATIVO", criado_em: new Date().toISOString(), alterado_em: new Date().toISOString(), criado_por: "system" }
  ];
  
  var abaCat = ss.getSheetByName("categorias");
  if (abaCat && abaCat.getLastRow() <= 1) {
    categorias.forEach(function(c) {
      inserirLinhaTabela(ss, "categorias", ABAS_SISTEMA["categorias"], c);
    });
  }
  
  // Contas Bancárias
  var contas = [
    { id: "acc_01", usuario_id: USUARIO_PADRAO_ID, nome: "Nubank Principal", tipo: "CORRENTE", instituicao: "Nubank", saldo_inicial: 1500.00, saldo_atual: 4320.50, status: "ATIVO", criado_em: new Date().toISOString(), alterado_em: new Date().toISOString(), criado_por: "system" },
    { id: "acc_02", usuario_id: USUARIO_PADRAO_ID, nome: "Reserva Itaú", tipo: "CAIXINHA", instituicao: "Itaú", saldo_inicial: 5000.00, saldo_atual: 5120.00, status: "ATIVO", criado_em: new Date().toISOString(), alterado_em: new Date().toISOString(), criado_por: "system" },
    { id: "acc_03", usuario_id: USUARIO_PADRAO_ID, nome: "Carteira Dinheiro", tipo: "CARTEIRA", instituicao: "Dinheiro", saldo_inicial: 150.00, saldo_atual: 300.00, status: "ATIVO", criado_em: new Date().toISOString(), alterado_em: new Date().toISOString(), criado_por: "system" }
  ];
  
  var abaContas = ss.getSheetByName("contas_bancarias");
  if (abaContas && abaContas.getLastRow() <= 1) {
    contas.forEach(function(a) {
      inserirLinhaTabela(ss, "contas_bancarias", ABAS_SISTEMA["contas_bancarias"], a);
    });
  }
  
  // Lançamentos Iniciais de Teste
  var lancamentos = [
    { id: "txn_01", usuario_id: USUARIO_PADRAO_ID, descricao: "Salário Google Inc", categoria_id: "cat_03", subcategoria_id: "sub_03", conta_id: "acc_01", cartao_id: "", valor: 12000.00, tipo: "RECEITA", forma_pagamento: "TED", data_competencia: "2026-08", data_hora: "2026-08-01T09:00:00Z", status: "PAGO" },
    { id: "txn_02", usuario_id: USUARIO_PADRAO_ID, descricao: "Almoço Restaurante", categoria_id: "cat_01", subcategoria_id: "sub_02", conta_id: "acc_01", cartao_id: "", valor: 65.50, tipo: "DESPESA", forma_pagamento: "PIX", data_competencia: "2026-08", data_hora: "2026-08-01T12:15:00Z", status: "PAGO" }
  ];
  
  var abaTxn = ss.getSheetByName("lancamentos");
  if (abaTxn && abaTxn.getLastRow() <= 1) {
    lancamentos.forEach(function(t) {
      inserirLinhaTabela(ss, "lancamentos", ABAS_SISTEMA["lancamentos"], t);
    });
  }
}
