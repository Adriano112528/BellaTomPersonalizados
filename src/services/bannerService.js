import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase";

const COLLECTION = "banners";

export async function carregarBanners() {
  try {
    const snapshot = await getDocs(
      collection(db, COLLECTION)
    );

    const dados = snapshot.docs.map((docItem) => {
      const item = docItem.data();

      return {
        id: docItem.id,

        title: item.title || item.titulo || "",

        subtitle: item.subtitle || "",

        oldPrice: item.oldPrice || "",

        newPrice: item.newPrice || "",

        discount: item.discount || 0,

        button: item.button || "Comprar Agora",

        ativo: item.ativo ?? true,

        image: item.image || item.imagem || "",
      };
    });

    console.log("========== BANNERS FIRESTORE ==========");
    console.table(dados);

    return dados;

  } catch (erro) {
    console.error(
      "❌ Erro ao carregar banners:",
      erro
    );

    return [];
  }
}