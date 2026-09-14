import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "../firebase";

const COLLECTION = "banners";

// Buscar todos os banners
export async function carregarBanners() {

  const snapshot = await getDocs(collection(db, COLLECTION));

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

      // aceita "image" ou "imagem"
      image: item.image || item.imagem || "",

    };

  });

  console.log("========== FIRESTORE ==========");
  console.table(dados);
  console.log(dados);
  console.log("===============================");

  return dados;
}

// Criar banner
export async function salvarBanner(banner) {
  await addDoc(collection(db, COLLECTION), banner);
}

// Atualizar banner
export async function atualizarBanner(id, banner) {
  await updateDoc(doc(db, COLLECTION, id), banner);
}

// Excluir banner
export async function excluirBanner(id) {
  await deleteDoc(doc(db, COLLECTION, id));
}