/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DocSection {
  id: string;
  title: string;
  category: 'arquitetura' | 'database' | 'integration' | 'seguranca' | 'futuro';
  content: string;
}

export const ARCHITECTURE_SECTIONS: DocSection[] = [
  {
    id: 'arquitetura_global',
    title: '1. Arquitetura Global do Sistema',
    category: 'arquitetura',
    content: `A arquitetura de nossa plataforma financeira pessoal segue o padrão **Clean Architecture**, dividindo responsabilidades de forma clara para isolar o visual (FlutterFlow), as regras de negócio (Google Apps Script Services) e os mecanismos de dados (Google Sheets & Drive).

### Visão Panorâmica do Fluxo de Dados:
\`\`\`text
[ FLUTTERFLOW ] --(HTTPS / REST JSON)--> [ APPS SCRIPT WEBAPP ]
      │                                             │
      │ (Upload Direto de Comprovantes)             ├─> [ SERVICES LAYER ] (Validações e Saldo)
      ▼                                             ├─> [ ORM DATABASE CONTEXT ]
[ GOOGLE DRIVE API ] <──────────────────────────────┼─> [ GOOGLE SHEETS ] (Banco de Dados)
                                                    └─> [ GOOGLE DRIVE ] (Backups JSON)
\`\`\`

Esta topologia garante que a interface FlutterFlow permaneça **leve, rápida e totalmente desacoplada** de como o banco armazena as informações, permitindo migrar de Google Sheets para um banco SQL tradicional futuramente sem mexer em uma única tela do aplicativo.`
  },
  {
    id: 'estrutura_componentes',
    title: '2. Estrutura de Código & Componentes',
    category: 'arquitetura',
    content: `O backend escrito em Google Apps Script é estruturado de forma a emular um framework modular moderno (similar a NestJS ou Express), dividindo o projeto em arquivos \`.gs\` com limites estritos de escopo:

*   **\`main.gs\` (Router & Middleware Layer):** Ponto de entrada unificado que implementa \`doPost(e)\` e \`doGet(e)\`, responsável pelo tratamento global de CORS, descriptografia do cabeçalho de autenticação, roteamento de caminhos e manipulação global de exceções.
*   **\`database.gs\` (Data Access Layer - ORM):** Implementa o objeto global \`DatabaseContext\`. Ele abstrai o acesso às planilhas do Sheets, lida com criação dinâmica de tabelas ausentes, mapeamento de cabeçalhos, inserts com herança de IDs únicos (UUIDs) e atualização cirúrgica de linhas por indexação física.
*   **\`services.gs\` (Business Logic Layer):** Contém os objetos de serviço (\`AuthService\`, \`TransactionService\`, \`InstallmentService\`, \`BackupService\`). Implementa cálculos complexos como desmembramento de compras parceladas, conciliação financeira de saldos e controle de limites.
*   **\`validators.gs\` (Validation Layer):** Executa asserções rígidas sobre os campos recebidos antes de qualquer persistência, evitando corrupção de tipos ou dados em branco nas planilhas.
*   **\`logs.gs\` (Observability Layer):** Escrita silenciosa de rastros no Sheets para depuração técnica rápida.`
  },
  {
    id: 'banco_sheets',
    title: '3. Topologia do Banco de Dados (Google Sheets)',
    category: 'database',
    content: `O banco de dados é hospedado em uma planilha mestre do Google Sheets no Google Drive do usuário. Cada entidade solicitada é mapeada para uma **Aba (Sheet) independente**.

### Benefícios desta topologia:
1.  **Chaves Primárias Únicas (PK):** IDs curtos e criptográficos gerados programaticamente no salvamento (ex: \`txn_a81f3b\`), eliminando colisões de ID incremental simples.
2.  **Integridade Referencial (FK):** Embora o Sheets não possua restrições nativas de chaves estrangeiras, o \`DatabaseContext\` realiza a verificação de existência de registros pai (Ex: validar se o \`categoria_id\` existe na aba \`Categorias\` antes de criar um lançamento).
3.  **Metadados e Auditoria:** Todas as tabelas herdam obrigatoriamente colunas de controle para garantir rastreabilidade completa:
    *   \`id\`: Identificador único (UUID)
    *   \`criado_em\`: Timestamp ISO-8601 de criação
    *   \`alterado_em\`: Timestamp ISO-8601 de modificação
    *   \`status\`: Estado do registro para deleção lógica (\`ATIVO\`, \`EXCLUIDO\`, \`PENDENTE\`)
    *   \`criado_por\`: Auditoria do usuário originário da operação`
  },
  {
    id: 'explicacao_tabelas',
    title: '4. Dicionário de Dados do Banco (14 Tabelas)',
    category: 'database',
    content: `O banco é composto por 14 entidades estruturadas para alta eficiência no Sheets:

1.  **Usuários:** Credenciais criptografadas e dados básicos do usuário do aplicativo.
2.  **Categorias:** Grupos principais de receitas e despesas (Ex: Alimentação, Transporte).
3.  **Subcategorias:** Classificações finas vinculadas a uma Categoria-mãe.
4.  **Contas Bancárias:** Carteiras, bancos digitais e poupanças que guardam saldo físico.
5.  **Cartões:** Controle de múltiplos cartões de crédito, faturas e limites disponíveis.
6.  **Lançamentos:** Registro histórico e provisionado de receitas, saídas e investimentos.
7.  **Parcelamentos:** Contratos de compras de alto valor parceladas a longo prazo.
8.  **Investimentos:** Ativos custodiados de renda fixa ou variável com rentabilidade acumulada.
9.  **Metas:** Projetos de poupança financeira com metas de arrecadação.
10. **Configurações:** Chaves de preferências visuais e tokens de sessão válidos.
11. **Assinaturas:** Serviços recorrentes periódicos (Ex: Netflix, Spotify) com auto-lançamento.
12. **Transferências:** Registro de movimentação monetária entre contas do próprio usuário.
13. **Histórico:** Log de auditoria que salva estados anteriores e novos em formato JSON (Change Data Capture).
14. **Logs:** Logs do servidor Apps Script para rastreabilidade de requisições e diagnósticos técnicos.`
  },
  {
    id: 'fluxo_apps_script',
    title: '5. Ciclo de Execução do Apps Script',
    category: 'arquitetura',
    content: `Quando uma interação acontece no FlutterFlow, o ciclo de execução do backend segue os passos abaixo:

\`\`\`text
[REQUISIÇÃO HTTPS] 
       │
       ▼
[main.gs] -> Descriptografa Header 'Authorization' 
       │     (Valida Token contra aba 'Configurações')
       ▼
[main.gs] -> Redireciona para o Handler (ex: handleCreateTransaction)
       │
       ▼
[validators.gs] -> Valida tipos, valores e integridade referencial (FK)
       │
       ▼
[services.gs] -> Executa regra de negócio:
       │          - Deduz saldo da Conta Bancária OU
       │          - Incrementa limite utilizado do Cartão de Crédito
       ▼
[database.gs] -> Grava as mutações nas abas correspondentes em lote
       │
       ▼
[logs.gs] -> Salva o log da transação com status de sucesso
       │
       ▼
[RESPOSTA JSON] -> Retorna payload limpo com status e novos saldos ao FlutterFlow
\`\`\`

Este fluxo desacoplado garante transações consistentes e impede que o banco fique em estado parcial inconsistente.`
  },
  {
    id: 'api_rest',
    title: '6. Arquitetura da API REST',
    category: 'integration',
    content: `O WebApp do Apps Script é publicado como uma URL única executável. Ele aceita parâmetros de consulta na URL para rotas \`GET\` e payloads JSON estruturados para rotas \`POST\`.

### Padrão de Cabeçalho (Headers):
*   \`Content-Type: application/json\`
*   \`Authorization: Bearer <token_de_sessao>\` (Essencial para todas as rotas protegidas)

### Resposta Padrão de Sucesso:
\`\`\`json
{
  "success": true,
  "data": { ... }
}
\`\`\`

### Resposta Padrão de Erro:
\`\`\`json
{
  "success": false,
  "error": "Descrição clara do erro de validação ou de sistema",
  "timestamp": "2026-08-01T20:07:38Z"
}
\`\`\`

Este contrato unificado facilita o tratamento de erros no FlutterFlow através de uma única Action reutilizável.`
  },
  {
    id: 'endpoints_detalhados',
    title: '7. Matriz de Endpoints da API',
    category: 'integration',
    content: `Os endpoints cobrem todas as necessidades funcionais do aplicativo:

*   **\`POST /login\`**: Autenticação inicial. Retorna o token gerado.
*   **\`GET /dashboard\`**: Retorna os KPIs consolidados (saldo, receitas, despesas, faturas), gráfico de pizza de gastos por categoria e próximos pagamentos.
*   **\`POST /lancamentos\`**: Cria uma transação (despesa, receita, investimento). Atualiza saldos agregados automaticamente.
*   **\`GET /lancamentos\`**: Lista movimentações mensais aplicando múltiplos filtros.
*   **\`POST /parcelamentos\`**: Cria um parcelamento de compras futuras e projeta automaticamente N parcelas.
*   **\`GET /contas\` & \`GET /cartoes\`**: Retorna os estados atuais de saldos e limites.
*   **\`GET /backup\`**: Aciona backup instantâneo salvando um snapshot JSON no Drive.`
  },
  {
    id: 'fluxo_flutterflow',
    title: '8. Fluxo de Integração no FlutterFlow',
    category: 'integration',
    content: `No FlutterFlow, a arquitetura do aplicativo é estruturada utilizando recursos nativos de alto desempenho:

1.  **API Calls Manager:** Cada endpoint descrito é registrado na seção "API Calls" do FlutterFlow. Criamos um grupo de chamadas chamado \`FinancasProAPI\` contendo a URL base do Apps Script WebApp e o header \`Authorization\` herdado dinamicamente de uma variável local.
2.  **App State Variables:** Variáveis locais estruturadas mantêm estados rápidos do applet:
    *   \`tokenAutenticacao\` (String persistente local para reter login)
    *   \`competenciaCorrente\` (String contendo o mês ativo de navegação, ex: "2026-08")
    *   \`cachedDashboard\` (JSON contendo o último dashboard carregado offline)
3.  **Custom Actions (Upload de Comprovantes):** O upload de anexos (fotos/PDFs) é feito enviando o arquivo diretamente para o Google Drive do usuário usando a integração de Drive nativa ou via Custom Action, retornando a URL do arquivo para salvamento no lançamento.`
  },
  {
    id: 'conversacao_sistemas',
    title: '9. Integração & Comunicação de Sistemas',
    category: 'integration',
    content: `A sincronia e comunicação entre FlutterFlow e Google Apps Script funcionam de forma fluida baseada em eventos do ciclo de vida das páginas:

1.  **Carregamento de Tela (On Page Load):** O app lê \`competenciaCorrente\`. Dispara a API Call \`GET /dashboard?competencia=2026-08\`. Atualiza a interface e salva o payload no \`cachedDashboard\` para carregamento instantâneo subsequente.
2.  **Mutação de Estado (On Submit Form):** Ao clicar em "Salvar Lançamento", o app dispara \`POST /lancamentos\` exibindo um indicador de progresso. O Apps Script responde com sucesso e retorna o saldo consolidado atualizado. O app atualiza a variável local de saldo instantaneamente com uma animação de fade, sem precisar recarregar toda a página.`
  },
  {
    id: 'seguranca_gcp',
    title: '10. Políticas e Protocolos de Segurança',
    category: 'seguranca',
    content: `Mesmo utilizando uma infraestrutura sem servidores dedicados tradicionais, a segurança dos dados financeiros é tratada com rigor:

1.  **Privacidade do Google Drive:** A planilha e a pasta de anexos pertencem exclusivamente ao usuário. O WebApp é publicado configurado para rodar com a permissão "Execute as: Me" (Dono do script) e "Who has access: Anyone", controlando internamente a autenticação por e-mail e chave token.
2.  **Isolamento de Chaves:** A chave mestre do Apps Script e chaves auxiliares de APIs são registradas usando o \`PropertiesService.getScriptProperties()\` do Google Cloud, impedindo exposição no código-fonte.
3.  **Sanitização de Input:** Todos os payloads recebidos na API passam por expressões regulares para neutralizar injeções de script ou corrupção de fórmulas das células do Google Sheets.`
  },
  {
    id: 'autenticacao_cripto',
    title: '11. Mecanismo de Autenticação & Hashes',
    category: 'seguranca',
    content: `O sistema não trafega senhas em texto limpo e garante sessões consistentes:

1.  **Criptografia de Senha (SHA-256):** No cadastro do usuário, a senha passa por uma função hash SHA-256 combinada com um salt fixo de segurança. O valor de 64 caracteres resultante é gravado na aba \`usuarios\`.
2.  **Tokens de Sessão Dinâmicos:** Ao fazer login com sucesso, o Apps Script gera um token criptográfico único (Ex: \`tkn_f8a02bd388\`) associado ao ID do usuário. Este token é inserido na aba \`configuracoes\` com um tempo limite de validade de 30 dias.
3.  **Validação de Header:** Todas as rotas subsequentes leem o cabeçalho HTTP \`Authorization\`, consultam se o token recebido existe na tabela de configurações e está ativo. Caso contrário, retornam instantaneamente \`401 Unauthorized\`, forçando o FlutterFlow a redirecionar o usuário para a tela de login.`
  },
  {
    id: 'backup_automacao',
    title: '12. Estratégia de Backup e Exportação',
    category: 'seguranca',
    content: `Para garantir total soberania dos dados do usuário e evitar perdas por modificações manuais na planilha, o sistema oferece dois fluxos de backup automatizados:

1.  **Backup Manual / Gatilho de Botão:** O usuário clica em "Gerar Backup" nas configurações. O FlutterFlow dispara \`GET /backup\`. O Apps Script lê todas as abas correspondentes ao ID do usuário, compacta em um arquivo estruturado de formato JSON com cabeçalho de data e cria um arquivo físico na pasta segura \`FinancasPro_Backups\` no Google Drive do usuário.
2.  **Backup Automático (Time-Driven Trigger):** Registramos um gatilho automático nas configurações do Apps Script (Gatilhos do Projeto) para rodar o método \`BackupService.runBackup()\` de forma silenciosa todas as noites, guardando um histórico rotativo dos últimos 30 dias.`
  },
  {
    id: 'escalabilidade_sheets',
    title: '13. Escalabilidade e Otimização de Performance',
    category: 'futuro',
    content: `O Google Sheets suporta até 10 milhões de células por arquivo, o que garante vários anos de uso para controle pessoal. Para garantir que o aplicativo continue rodando de forma instantânea, implementamos as seguintes otimizações:

1.  **Limitação de Escaneamento:** Em vez de carregar todos os lançamentos históricos da vida do usuário, o FlutterFlow sempre filtra e solicita apenas a competência atual (\`YYYY-MM\`). O método \`DatabaseContext.select()\` para de varrer as linhas assim que sai da faixa de data do mês solicitado.
2.  **Fórmulas Inteligentes do Lado do Servidor:** Evitamos colocar fórmulas complexas (SUM, VLOOKUP) diretamente nas células do Sheets, pois isso deixa a planilha lenta a cada inserção. Todos os cálculos matemáticos são executados na memória RAM de alta velocidade do Apps Script V8 Engine, persistindo apenas valores consolidados estáticos nas células.`
  },
  {
    id: 'versionamento_deploy',
    title: '14. Versionamento e Pipeline de Deploy',
    category: 'futuro',
    content: `O versionamento do sistema é crucial para garantir que novas telas de aplicativo não quebrem as versões em produção já instaladas no celular do usuário:

1.  **Deploy Controlado no Apps Script:** Ao alterar o código no Apps Script, não alteramos o link de produção ativo de imediato. Em vez disso, criamos uma nova "Versão" (Deploy -> New Deployment) que gera um novo ID de WebApp separado para testes. Somente após a validação integral no FlutterFlow, alteramos o Deployment principal para apontar para a versão homologada.
2.  **Suporte Multi-Ambiente (Staging/Production):** Registramos duas conexões de API Calls no FlutterFlow: \`API_Staging\` (aponta para o script de testes) e \`API_Production\` (aponta para a URL publicada estável).`
  },
  {
    id: 'modulo_ia_futuro',
    title: '15. Roadmap de Integração de Inteligência Artificial',
    category: 'futuro',
    content: `A arquitetura foi cuidadosamente projetada para receber recursos de Inteligência Artificial generativa futuramente usando o **Gemini API** sem precisar refatorar as bases de dados:

1.  **API de Insights Financeiros:** Criaremos o endpoint \`GET /ai-insights\`. O Apps Script consolidará em texto formatado o saldo do mês, maiores categorias de despesas do usuário e a meta atual.
2.  **Engenharia de Prompt (System Prompt):** Esse resumo consolidado é enviado ao modelo Gemini, configurado com uma persona de Consultor Financeiro de Elite, que responderá com insights acionáveis personalizados como:
    *   *"Cristiano, seus gastos em Alimentação cresceram 18% em relação a Julho. Economizar R$ 250 em restaurantes este mês ajudará você a atingir a meta da Viagem à Europa 2 meses mais cedo!"*
    *   *"Atenção: Suas assinaturas ativas somam R$ 145,70 por mês, mas você não acessa o serviço Spotify há 25 dias. Deseja cancelar?"*
3.  **Resposta Segura:** Os dados sensíveis do usuário permanecem totalmente protegidos e isolados dentro do ecossistema do Google Drive, sem tráfego de dados para servidores terceiros não homologados.`
  }
];
