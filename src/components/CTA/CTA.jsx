import "./CTA.css";

import banner from "../../assets/images/banner-gatos.webp";
import { FaWhatsapp } from "react-icons/fa";

export default function CTA() {

    return (

        <section className="cta">

            <div className="ctaBanner">

                <img
                    src={banner}
                    alt="Bella Tom Personalizados"
                />

                <a
                    href="https://wa.me/5554999999999"
                    target="_blank"
                    rel="noreferrer"
                    className="ctaButton"
                >

                    <FaWhatsapp />

                    Solicitar Orçamento

                </a>

            </div>

        </section>

    );

}