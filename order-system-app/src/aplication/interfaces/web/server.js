const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const db = require('../../../infrastructure/dbconnect');

// Repositórios e clientes HTTP
const ClienteRepository = require('../../../infrastructure/repositories/clienteRepository');
const PedidoRepository = require('../../../infrastructure/repositories/pedidoRepository');
const ProdutoRepository = require('../../../infrastructure/repositories/produtoRepository');
const PagamentoHttpClient = require('../../../infrastructure/http/pagamentoHttpClient'); // Corrigido

// Casos de uso (use cases)
const PagamentoService = require('../../../core/user_cases/pagamentoService');
const PedidoService = require('../../../core/user_cases/pedidoService');

// Rotas
const clienteRoutes = require('../../../aplication/interfaces/api/clienteRoutes');
const pedidoRoutes = require('../../../aplication/interfaces/api/pedidoRoutes');
const produtoRoutes = require('../../../aplication/interfaces/api/produtoRoutes');
const pagamentoRoutes = require('../../../aplication/interfaces/api/pagamentoRoutes');
const webhookRoutes = require('../../../aplication/interfaces/api/webhookRoutes');

// Instanciando repositórios
const clienteRepository = new ClienteRepository();
const pedidoRepository = new PedidoRepository();
const produtoRepository = new ProdutoRepository();
const pagamentoHttpClient = new PagamentoHttpClient(); // Corrigido, agora estamos instanciando a classe

// Injetando dependências nos casos de uso
const pagamentoService = new PagamentoService(clienteRepository, pedidoRepository, pagamentoHttpClient);
const pedidoService = new PedidoService(produtoRepository, pedidoRepository);

// Inicialização do app Express
const app = express();
app.use(bodyParser.json());

// Configurações de CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

// Conexão com o MongoDB
db.once('open', () => {
    console.log('Application Connected to MongoDB');
    const PORT = process.env.PORT || 3000;

    // Documentação Swagger
    const swaggerDocument = YAML.load(path.join(__dirname, '../../../../docs/openapi.yaml'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    // Rotas da aplicação, passando as instâncias dos casos de uso como middleware
    app.use('/api/cliente', clienteRoutes(clienteRepository));
    app.use('/api/pedido', pedidoRoutes(pedidoService));
    app.use('/api/produto', produtoRoutes(produtoRepository));
    app.use('/api/pagamento', pagamentoRoutes(pagamentoService));
    app.use('/api/webhook', webhookRoutes());

    // Iniciar o servidor
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
