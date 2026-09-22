import { storage } from "../firebase";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

export async function uploadBanner(arquivo) {
  console.log("📤 INICIANDO UPLOAD");
  console.log("📁 Arquivo:", arquivo.name);
  console.log("📦 Tamanho:", arquivo.size);
  console.log("📝 Tipo:", arquivo.type);

  if (!arquivo) {
    throw new Error("Nenhum arquivo selecionado.");
  }

  if (!arquivo.type.startsWith("image/")) {
    throw new Error("O arquivo selecionado não é uma imagem.");
  }

  try {
    const nomeArquivo = `banners/${Date.now()}-${arquivo.name}`;
    console.log("📍 Caminho:", nomeArquivo);

    const referencia = ref(storage, nomeArquivo);

    console.log("⏳ Enviando para Firebase Storage...");

    const resultado = await uploadBytes(referencia, arquivo);

    console.log("✅ UPLOAD CONCLUÍDO");
    console.log(resultado);

    console.log("🔗 Obtendo URL...");

    const url = await getDownloadURL(referencia);

    console.log("✅ URL OBTIDA:");
    console.log(url);

    return url;

  } catch (erro) {
    console.error("❌ ERRO NO STORAGE");
    console.error("Código:", erro.code);
    console.error("Mensagem:", erro.message);
    console.error(erro);

    throw erro;
  }
}