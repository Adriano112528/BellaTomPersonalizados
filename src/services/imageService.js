const API_URL = "http://localhost:3001/api/images";

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