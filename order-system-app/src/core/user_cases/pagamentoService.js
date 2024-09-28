// Dependências
class PagamentoService {
    /**
     * Construtor que recebe os repositórios injetados.
     * @param {Object} clienteRepository - Instância da interface ClienteRepositoryInterface.
     * @param {Object} pedidoRepository - Instância da interface PedidoRepositoryInterface.
     * @param {Object} pagamentoHttpClient - Cliente HTTP para processar o pagamento (injetado).
     */
    constructor(clienteRepository, pedidoRepository, pagamentoHttpClient) {
        this.clienteRepository = clienteRepository;
        this.pedidoRepository = pedidoRepository;
        this.pagamentoHttpClient = pagamentoHttpClient;
    }

    /**
     * Cria um pagamento para o pedido especificado.
     * @param {String} pedidoId - O ID do pedido.
     * @returns {Promise<Object>} O pagamento criado.
     */
    async criarPagamento(pedidoId) {
        // Buscar o pedido pelo ID
        const pedido = await this.pedidoRepository.getPedidoByPedidoId(pedidoId);
        if (!pedido) {
            throw new Error('Pedido não encontrado');
        }

        // Buscar o cliente associado ao pedido
        const cliente = await this.clienteRepository.getClienteByClienteId(pedido.cliente);
        if (!cliente) {
            throw new Error('Cliente não encontrado');
        }

        // Preparar os produtos do pedido
        const produtos = await this._construirProdutos(pedido.produtos);

        // Construir o corpo da requisição para o serviço de pagamento
        const requestBody = this._construirRequestBody(pedido, cliente, produtos);

        // Realizar a chamada HTTP para o serviço de pagamento via o cliente HTTP
        const response = await this.pagamentoHttpClient.criarPagamento(requestBody);

        // Obter o link do QR code da resposta do serviço de pagamento
        const qrCodeLink = response.data.qr_codes[0].links[1].href;

        // Criar o registro do pagamento no banco de dados
        const pagamento = {
            pedidoId: pedidoId,
            valor: pedido.total,
            status: 'Pendente',
            qrCodeLink: qrCodeLink
        };

        // Salvar o pagamento (neste exemplo, usando o método salvar do pedidoRepository)
        await this.pedidoRepository.updateStatusPagamento(pedidoId, 'Aprovado');

        return pagamento;
    }

    /**
     * Constrói a lista de produtos a partir dos dados do pedido.
     * @param {Array} produtosPedido - Lista de produtos do pedido.
     * @returns {Promise<Array>} Lista de produtos formatada.
     */
    async _construirProdutos(produtosPedido) {
        const produtos = await Promise.all(produtosPedido.map(async (item) => {
            const produto = await this.pedidoRepository.getProdutoByProdutoId(item.produto);
            return {
                name: produto.nomeProduto,
                quantity: item.quantidade,
                unit_amount: produto.precoProduto * 100 // Preço em centavos para o serviço de pagamento
            };
        }));
        return produtos;
    }

    /**
     * Constrói o corpo da requisição para o serviço de pagamento.
     * @param {Object} pedido - Dados do pedido.
     * @param {Object} cliente - Dados do cliente.
     * @param {Array} produtos - Lista de produtos formatados.
     * @returns {Object} Corpo da requisição formatado para o serviço de pagamento.
     */
    _construirRequestBody(pedido, cliente, produtos) {
        return {
            reference_id: pedido.pedidoId, // Referência do pedido
            customer: {
                name: cliente.nomeCliente,
                email: cliente.email,
                tax_id: cliente.cpf,
                phones: [
                    {
                        country: "55",
                        area: "41",
                        number: "999999999",
                        type: "MOBILE"
                    }
                ]
            },
            items: produtos, // Lista de produtos
            qr_codes: [
                {
                    amount: {
                        value: pedido.total * 100 // Valor total do pedido em centavos
                    },
                    expiration_date: new Date(Date.now() + 3600 * 1000).toISOString() // QR code expira em 1 hora
                }
            ],
            shipping: {
                address: {
                    street: "meu endereço",
                    number: "0000",
                    complement: "loja 01",
                    locality: "Meu bairro",
                    city: "Curitiba",
                    region_code: "PR",
                    country: "BRA",
                    postal_code: "80000000"
                }
            },
            notification_urls: [
                "https://meusite.com/notificacoes" // URL para receber notificações de status do pagamento
            ]
        };
    }
}

module.exports = PagamentoService;