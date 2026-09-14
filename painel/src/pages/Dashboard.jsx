import DashboardChart from "../components/DashboardChart";
import SystemStatus from "../components/SystemStatus";
import ExecutivePanel from "../components/ExecutivePanel";
import { dashboardData } from "../data/dashboardData";

import "../styles/dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard">

      <section className="dashboard-header">

        <div>
          <h1>Painel Master Bella Tom</h1>
          <p>Controle completo da loja em tempo real.</p>
        </div>

        <div className="status-online">
          <span className="status-dot"></span>
          Sistema Online
        </div>

      </section>

      <SystemStatus />

      <section className="cards">

        <div className="card">
          <div className="card-icon">📦</div>
          <span>Pedidos Hoje</span>
          <h2>{dashboardData.cards.pedidosHoje}</h2>
          <small>+12% em relação a ontem</small>
        </div>

        <div className="card">
          <div className="card-icon">👥</div>
          <span>Clientes</span>
          <h2>{dashboardData.cards.clientes}</h2>
          <small>8 novos clientes</small>
        </div>

        <div className="card">
          <div className="card-icon">💰</div>
          <span>Faturamento</span>

          <h2>
            {dashboardData.cards.faturamento.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </h2>

          <small>Meta: R$ 10.000</small>
        </div>

        <div className="card">
          <div className="card-icon">🎁</div>
          <span>Produtos</span>
          <h2>{dashboardData.cards.produtos}</h2>
          <small>5 com estoque baixo</small>
        </div>

      </section>

      <section className="dashboard-grid">

        <div className="panel large">

          <div className="panel-header">

            <h3>Pedidos do Dia</h3>

            <button className="btn-report">
              Ver relatório
            </button>

          </div>

          <DashboardChart />

        </div>

        <div className="panel">

          <h3>Últimos Pedidos</h3>

          <ul className="orders">

            <li>
              <div>
                <strong>João Silva</strong>
                <p>Caneca Personalizada</p>
              </div>
              <span>R$ 120,00</span>
            </li>

            <li>
              <div>
                <strong>Maria Souza</strong>
                <p>Azulejo Personalizado</p>
              </div>
              <span>R$ 89,00</span>
            </li>

            <li>
              <div>
                <strong>Carlos Pereira</strong>
                <p>Camiseta Sublimada</p>
              </div>
              <span>R$ 230,00</span>
            </li>

            <li>
              <div>
                <strong>Fernanda Lima</strong>
                <p>Quadro MDF</p>
              </div>
              <span>R$ 65,00</span>
            </li>

            <li>
              <div>
                <strong>Ricardo Alves</strong>
                <p>Chaveiro Personalizado</p>
              </div>
              <span>R$ 35,00</span>
            </li>

          </ul>

        </div>

      </section>

      <section className="bottom-grid">

        <div className="panel agenda">

          <h3>Agenda de Produção</h3>

          <div className="agenda-item">
            <span>09:00</span>
            <strong>15 Canecas</strong>
            <small>Produção</small>
          </div>

          <div className="agenda-item">
            <span>11:30</span>
            <strong>5 Azulejos</strong>
            <small>Sublimação</small>
          </div>

          <div className="agenda-item">
            <span>15:00</span>
            <strong>10 Camisetas</strong>
            <small>Impressão</small>
          </div>

          <div className="agenda-item">
            <span>17:30</span>
            <strong>Entrega Mercado Livre</strong>
            <small>Expedição</small>
          </div>

        </div>

        <div className="panel">

          <h3>Resumo Financeiro</h3>

          <div className="finance-item">
            <span>Entradas</span>
            <strong>R$ 8.450</strong>
          </div>

          <div className="finance-item">
            <span>Despesas</span>
            <strong>R$ 2.130</strong>
          </div>

          <div className="finance-item">
            <span>Lucro</span>
            <strong>R$ 6.320</strong>
          </div>

          <div className="finance-item">
            <span>PIX Hoje</span>
            <strong>R$ 5.980</strong>
          </div>

        </div>

      </section>

      <ExecutivePanel />

    </div>
  );
}