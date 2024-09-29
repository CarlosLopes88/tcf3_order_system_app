const mongoose = require('mongoose');

// Construindo a string de conexão com o MongoDB a partir das variáveis de ambiente
const mongoUri = process.env.DB_URI || `mongodb://${process.env.DB_MASTER_USERNAME}:${process.env.DB_MASTER_PASSWORD}@localhost:27017/order_system`;

// Exibindo a URI (sem as credenciais) para depuração
console.log('Conectando ao MongoDB com URI:', mongoUri.replace(/\/\/.*@/, '//****:****@'));

// Função para conectar ao MongoDB
const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB conectado com sucesso');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    process.exit(1); // Sai da aplicação em caso de falha de conexão
  }
};

// Invocando a função de conexão ao MongoDB
connectToMongo();

module.exports = mongoose;
