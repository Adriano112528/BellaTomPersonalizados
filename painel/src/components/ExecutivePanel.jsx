import "./ExecutivePanel.css";
import {
  DollarSign,
  Package,
  TrendingUp,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";

export default function ExecutivePanel() {
  const indicadores = [
    {
      icon: <DollarSign size={28} />,
      titulo: "Lucro Líquido",
      valor: "R$ 6.320",
      detalhe: "+18% este mês",
    },
    {
      icon: <ShoppingCart size={28} />,
      titulo: "Meta Mensal",
      valor: "84%",
      detalhe: "R$ 8.450 / R$ 10.000",
    },
    {
      icon: <Package size={28} />,
      titulo: "Produção",
      valor: "42",
      detalhe: "Pedidos em andamento",
    },
    {
      icon: <Truck size={28} />,
      titulo: "Entregas",
      valor: "16",
      detalhe: "Saindo hoje",
    },
    {
      icon: <Star size={28} />,
      titulo: "Mais Vendido",
      valor: "Canecas",
      detalhe: "37 unidades",
    },
    {
      icon: <TrendingUp size={28} />,
      titulo: "Crescimento",
      valor: "+22%",
      detalhe: "Últimos 30 dias",
    },
  ];

  return (
    <section className="executive-panel">

      <div className="executive-title">
        <h2>Painel Executivo</h2>
        <p>Resumo estratégico da Bella Tom</p>
      </div>

      <div className="executive-grid">
        {indicadores.map((item, index) => (
          <div className="executive-card" key={index}>

            <div className="executive-icon">
              {item.icon}
            </div>

            <small>{item.titulo}</small>

            <h3>{item.valor}</h3>

            <span>{item.detalhe}</span>

          </div>
        ))}
      </div>

    </section>
  );
}