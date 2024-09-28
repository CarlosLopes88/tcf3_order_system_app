const axios = require('axios');
require('dotenv').config();

class PagamentoHttpClient {
    async criarPagamento(requestBody) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': process.env.PAGSEGURO_AUTH_TOKEN
        };

        return axios.post('https://sandbox.api.pagseguro.com/orders', requestBody, { headers });
    }
}

module.exports = new PagamentoHttpClient();