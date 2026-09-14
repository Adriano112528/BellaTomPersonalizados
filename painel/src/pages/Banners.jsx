import { Image, Pencil } from "lucide-react";
import "./Banners.css";

export default function Banners() {

    const banners = [

        {
            id:1,
            nome:"Banner 1",
            descricao:"Promoção Principal"
        },

        {
            id:2,
            nome:"Banner 2",
            descricao:"Promoção Principal"
        },

        {
            id:3,
            nome:"Banner 3",
            descricao:"Promoção Principal"
        },

        {
            id:4,
            nome:"Banner 4",
            descricao:"Promoção Principal"
        },

        {
            id:5,
            nome:"Banner 5",
            descricao:"Promoção Principal"
        }

    ];

    return(

        <div className="banners-page">

            <div className="page-title">

                <h1>Banners da Home</h1>

                <p>
                    Gerencie os cinco banners do carrossel principal.
                </p>

            </div>

            <div className="banners-list">

                {

                    banners.map((banner)=>(

                        <div
                            className="banner-card"
                            key={banner.id}
                        >

                            <div className="banner-preview">

                                <Image size={60}/>

                            </div>

                            <div className="banner-info">

                                <h2>{banner.nome}</h2>

                                <p>{banner.descricao}</p>

                            </div>

                            <button>

                                <Pencil size={18}/>

                                Editar

                            </button>

                        </div>

                    ))

                }

            </div>

        </div>

    );

}