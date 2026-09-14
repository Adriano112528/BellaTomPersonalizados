export const dashboardData = {
  cards: {
    pedidosHoje: 18,
    clientes: 245,
    faturamento: 8450,
    produtos: 132,
    ticketMedio: 469,
    pedidosPendentes: 6,
    estoqueBaixo: 5,
  },

  pedidos: [
    {
      id: 1,
      cliente: "João Silva",
      produto: "Caneca Personalizada",
      valor: 120,
      status: "Produção",
    },
    {
      id: 2,
      cliente: "Maria Souza",
      produto: "Azulejo Personalizado",
      valor: 89,
      status: "Aguardando",
    },
    {
      id: 3,
      cliente: "Carlos Pereira",
      produto: "Camiseta Sublimada",
      valor: 230,
      status: "Finalizado",
    },
    {
      id: 4,
      cliente: "Fernanda Lima",
      produto: "Quadro MDF",
      valor: 65,
      status: "Entrega",
    },
    {
      id: 5,
      cliente: "Ricardo Alves",
      produto: "Chaveiro Personalizado",
      valor: 35,
      status: "Produção",
    },
  ],

  agenda: [
    {
      hora: "09:00",
      titulo: "15 Canecas",
      setor: "Produção",
    },
    {
      hora: "11:30",
      titulo: "5 Azulejos",
      setor: "Sublimação",
    },
    {
      hora: "15:00",
      titulo: "10 Camisetas",
      setor: "Impressão",
    },
    {
      hora: "17:30",
      titulo: "Entrega Mercado Livre",
      setor: "Expedição",
    },
  ],

  financeiro: {
    entradas: 8450,
    despesas: 2130,
    lucro: 6320,
    pix: 5980,
  },

  vendasSemana: [
    { dia: "Seg", valor: 420 },
    { dia: "Ter", valor: 680 },
    { dia: "Qua", valor: 510 },
    { dia: "Qui", valor: 980 },
    { dia: "Sex", valor: 860 },
    { dia: "Sáb", valor: 1230 },
    { dia: "Dom", valor: 790 },
  ],

  notificacoes: [
    "5 pedidos aguardando produção",
    "2 pagamentos pendentes",
    "Estoque baixo de Canecas",
    "Entrega Mercado Livre às 17:30",
  ],

  ia: {
    mensagem:
      "Hoje o produto mais vendido foi Caneca Personalizada. O faturamento está acima da média da semana.",
  },
};