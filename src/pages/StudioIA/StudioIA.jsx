import { useState } from "react";
import { uploadImage } from "../../services/imageService";

export default function StudioIA() {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  async function handleUpload() {
    if (!file) {
      alert("Selecione uma imagem.");
      return;
    }

    try {
      const result = await uploadImage(file);

      setImageUrl(result.imageUrl);

      alert("Imagem enviada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar imagem.");
    }
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>Studio IA - Bella Tom</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br />
      <br />

      <button onClick={handleUpload}>
        Enviar para Cloudinary
      </button>

      {imageUrl && (
        <div style={{ marginTop: "20px" }}>
          <h3>Imagem enviada:</h3>

          <img
            src={imageUrl}
            alt="Imagem enviada"
            style={{
              maxWidth: "400px",
              borderRadius: "12px",
            }}
          />
        </div>
      )}
    </div>
  );
}