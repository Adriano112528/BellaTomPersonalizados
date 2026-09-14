import "./TopBar.css";

export default function TopBar() {
  return (
    <header className="topbar">

      <div className="topbar-left">

        <div className="page-title">
          <h2>Dashboard</h2>
          <span>Painel Master Bella Tom</span>
        </div>

      </div>

      <div className="topbar-center">

        <input
          type="text"
          placeholder="Pesquisar pedidos, clientes, produtos..."
        />

      </div>

      <div className="topbar-right">

        <button className="icon-button">
          🔔
          <span className="badge">3</span>
        </button>

        <button className="icon-button">
          💬
        </button>

        <button className="icon-button">
          ⚙️
        </button>

        <div className="user">

          <div className="avatar">
            BT
          </div>

          <div className="user-info">
            <strong>Administrador</strong>
            <small>Master</small>
          </div>

        </div>

      </div>

    </header>
  );
}