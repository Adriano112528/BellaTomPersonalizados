import "./Differentials.css";

import {
  FaStar,
  FaShieldAlt,
  FaTruck,
  FaHeart,
} from "react-icons/fa";

export default function Differentials() {
  return (
    <section className="differentials">

      <div className="differentialsGrid">

        <div className="differentialCard">
          <FaStar />
          <h3>Acabamento Premium</h3>
          <p>Detalhes que fazem a diferença.</p>
        </div>

        <div className="differentialCard">
          <FaShieldAlt />
          <h3>Produção Própria</h3>
          <p>Qualidade do início ao fim.</p>
        </div>

        <div className="differentialCard">
          <FaTruck />
          <h3>Envio para Todo o Brasil</h3>
          <p>Receba onde estiver.</p>
        </div>

        <div className="differentialCard">
          <FaHeart />
          <h3>Feito com Amor</h3>
          <p>Presentes que eternizam momentos.</p>
        </div>

      </div>

    </section>
  );
}