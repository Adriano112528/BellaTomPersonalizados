import { storage } from "../firebase";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

export async function uploadBanner(arquivo) {

  const nomeArquivo = `banners/${Date.now()}-${arquivo.name}`;

  const referencia = ref(storage, nomeArquivo);

  await uploadBytes(referencia, arquivo);

  const url = await getDownloadURL(referencia);

  return url;

}