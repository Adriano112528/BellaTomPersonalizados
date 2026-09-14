import "./SystemStatus.css";

export default function SystemStatus() {
  const indicadores = [
    { titulo: "Pedidos", valor: 18 },
    { titulo: "Produção", valor: 12 },
    { titulo: "Entregues", valor: 6 },
    { titulo: "Clientes Online", valor: 24 },
    { titulo: "Ticket Médio", valor: "R$ 186" },
    { titulo: "Conversão", valor: "82%" },
  ];

  return (
    <section className="system-status">

      <div className="status-header">
        <div className="online-dot"></div>
        <span>Sistema Online</span>
      </div>

      <div className="status-grid">
        {indicadores.map((item, index) => (
          <div className="status-card" key={index}>
            <small>{item.titulo}</small>
            <h3>{item.valor}</h3>
          </div>
        ))}
      </div>

    </section>
  );
}