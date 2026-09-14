import { Plus, Search, FileText, Eye, Pencil, Printer, Trash2 } from "lucide-react";
import "../styles/orcamentos.css";

export default function Orcamentos() {
  return (
    <div className="orcamentos-page">

      <div className="page-header">

        <div>
          <h1>Orçamentos</h1>
          <p>Gerencie todos os orçamentos da Bella Tom.</p>
        </div>

        <button className="novo-btn">
          <Plus size={20} />
          Novo Orçamento
        </button>

      </div>

      <div className="toolbar">

        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Pesquisar orçamento..."
          />
        </div>

        <select>

          <option>Todos</option>
          <option>Pendentes</option>
          <option>Aprovados</option>
          <option>Cancelados</option>

        </select>

      </div>

      <div className="table-card">

        <table>

          <thead>

            <tr>

              <th>Nº</th>

              <th>Cliente</th>

              <th>Valor</th>

              <th>Status</th>

              <th>Data</th>

              <th>Ações</th>

            </tr>

          </thead>

          <tbody>

            <tr>

              <td>ORC-0001</td>

              <td>João Silva</td>

              <td>R$ 580,00</td>

              <td>
                <span className="status pendente">
                  Pendente
                </span>
              </td>

              <td>09/09/2026</td>

              <td>

                <button><Eye size={16} /></button>

                <button><Pencil size={16} /></button>

                <button><Printer size={16} /></button>

                <button><Trash2 size={16} /></button>

              </td>

            </tr>

            <tr>

              <td>ORC-0002</td>

              <td>Maria Souza</td>

              <td>R$ 1.250,00</td>

              <td>
                <span className="status aprovado">
                  Aprovado
                </span>
              </td>

              <td>08/09/2026</td>

              <td>

                <button><Eye size={16} /></button>

                <button><Pencil size={16} /></button>

                <button><Printer size={16} /></button>

                <button><Trash2 size={16} /></button>

              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </div>
  );
}