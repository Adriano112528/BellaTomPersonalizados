import { useMemo, useState } from "react";

import DashboardChart from "../components/DashboardChart";
import SystemStatus from "../components/SystemStatus";
import ExecutivePanel from "../components/ExecutivePanel";
import { dashboardData } from "../data/dashboardData";

import "../styles/dashboard.css";

const eventosAgenda = [
  {
    id: 1,
    data: "2026-09-15",
    hora: "09:00",
    titulo: "15 Canecas Personalizadas",
    tipo: "Produção",
  },
  {
    id: 2,
    data: "2026-09-15",
    hora: "11:30",
    titulo: "5 Azulejos Personalizados",
    tipo: "Sublimação",
  },
  {
    id: 3,
    data: "2026-09-15",
    hora: "15:00",
    titulo: "10 Camisetas Sublimadas",
    tipo: "Impressão",
  },
  {
    id: 4,
    data: "2026-09-15",
    hora: "17:30",
    titulo: "Entrega Mercado Livre",
    tipo: "Expedição",
  },
  {
    id: 5,
    data: "2026-09-18",
    hora: "10:00",
    titulo: "Conferência de estoque",
    tipo: "Estoque",
  },
  {
    id: 6,
    data: "2026-09-22",
    hora: "14:00",
    titulo: "Reunião de planejamento",
    tipo: "Reunião",
  },
];

function formatarData(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function obterNomeMes(data) {
  return data.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

export default function Dashboard() {
  const hoje = new Date();

  const [mesAtual, setMesAtual] = useState(
    new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  );

  const [diaSelecionado, setDiaSelecionado] = useState(formatarData(hoje));

  const diasDoCalendario = useMemo(() => {
    const primeiroDia = new Date(
      mesAtual.getFullYear(),
      mesAtual.getMonth(),
      1
    );

    const ultimoDia = new Date(
      mesAtual.getFullYear(),
      mesAtual.getMonth() + 1,
      0
    );

    const primeiroDiaSemana = primeiroDia.getDay();
    const totalDias = ultimoDia.getDate();

    const dias = [];

    for (let i = 0; i < primeiroDiaSemana; i += 1) {
      dias.push(null);
    }

    for (let dia = 1; dia <= totalDias; dia += 1) {
      dias.push(
        new Date(mesAtual.getFullYear(), mesAtual.getMonth(), dia)
      );
    }

    return dias;
  }, [mesAtual]);

  const eventosDoDia = eventosAgenda
    .filter((evento) => evento.data === diaSelecionado)
    .sort((a, b) => a.hora.localeCompare(b.hora));

  function mudarMes(direcao) {
    setMesAtual(
      new Date(
        mesAtual.getFullYear(),
        mesAtual.getMonth() + direcao,
        1
      )
    );
  }

  function voltarParaHoje() {
    const dataHoje = new Date();

    setMesAtual(
      new Date(dataHoje.getFullYear(), dataHoje.getMonth(), 1)
    );

    setDiaSelecionado(formatarData(dataHoje));
  }

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

      <section className="calendar-agenda-panel">
        <div className="calendar-header">
          <div>
            <span className="calendar-eyebrow">Organização</span>
            <h2>Calendário e Agenda</h2>
            <p>Visualize os compromissos e a programação da loja.</p>
          </div>

          <button
            type="button"
            className="calendar-today-button"
            onClick={voltarParaHoje}
          >
            Hoje
          </button>
        </div>

        <div className="calendar-agenda-content">
          <div className="calendar-box">
            <div className="calendar-navigation">
              <button
                type="button"
                onClick={() => mudarMes(-1)}
                aria-label="Mês anterior"
              >
                ‹
              </button>

              <strong>{obterNomeMes(mesAtual)}</strong>

              <button
                type="button"
                onClick={() => mudarMes(1)}
                aria-label="Próximo mês"
              >
                ›
              </button>
            </div>

            <div className="calendar-weekdays">
              <span>Dom</span>
              <span>Seg</span>
              <span>Ter</span>
              <span>Qua</span>
              <span>Qui</span>
              <span>Sex</span>
              <span>Sáb</span>
            </div>

            <div className="calendar-days">
              {diasDoCalendario.map((dia, index) => {
                if (!dia) {
                  return (
                    <span
                      key={`vazio-${index}`}
                      className="calendar-day empty"
                    ></span>
                  );
                }

                const dataFormatada = formatarData(dia);

                const possuiEvento = eventosAgenda.some(
                  (evento) => evento.data === dataFormatada
                );

                const estaSelecionado = dataFormatada === diaSelecionado;

                const ehHoje = dataFormatada === formatarData(hoje);

                return (
                  <button
                    type="button"
                    key={dataFormatada}
                    className={`calendar-day ${
                      estaSelecionado ? "selected" : ""
                    } ${ehHoje ? "today" : ""}`}
                    onClick={() => setDiaSelecionado(dataFormatada)}
                  >
                    <span>{dia.getDate()}</span>

                    {possuiEvento && (
                      <small className="calendar-event-dot"></small>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="calendar-events">
            <div className="calendar-events-header">
              <div>
                <span className="calendar-eyebrow">Programação</span>
                <h3>
                  {new Date(
                    `${diaSelecionado}T12:00:00`
                  ).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                  })}
                </h3>
              </div>

              <span className="calendar-event-count">
                {eventosDoDia.length} evento
                {eventosDoDia.length !== 1 ? "s" : ""}
              </span>
            </div>

            {eventosDoDia.length > 0 ? (
              <div className="calendar-event-list">
                {eventosDoDia.map((evento) => (
                  <div className="calendar-event-item" key={evento.id}>
                    <div className="calendar-event-time">
                      {evento.hora}
                    </div>

                    <div className="calendar-event-info">
                      <strong>{evento.titulo}</strong>
                      <span>{evento.tipo}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="calendar-empty">
                <span>🗓️</span>
                <strong>Nenhum compromisso</strong>
                <p>Não existem eventos cadastrados para este dia.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <ExecutivePanel />
    </div>
  );
}