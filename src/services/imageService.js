const API_URL = "https://bellatompersonalizados.onrender.com/api/images";

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Erro ao enviar imagem.");
  }

  return await response.json();
}