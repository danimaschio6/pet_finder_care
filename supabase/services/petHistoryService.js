import { supabase } from "../client/supabaseClient";

// -----------------------------------------------------
// 📌 Obtener historial de una mascota
// -----------------------------------------------------
export const getPetHistory = async (petId) => {
  const { data, error } = await supabase
    .from("pet_history")
    .select("*")
    .eq("pet_id", petId)
    .order("fecha", { ascending: false });

  if (error) {
    console.error("Error al obtener historial clínico:", error);
    throw error;
  }

  return data;
};

// -----------------------------------------------------
// ➕ Crear registro en historial
// -----------------------------------------------------
export const createPetHistory = async (historyData) => {
  const { data, error } = await supabase
    .from("pet_history")
    .insert(historyData)
    .select()
    .single();

  if (error) {
    console.error("Error al crear historial:", error);
    throw error;
  }

  return data;
};

// -----------------------------------------------------
// ✏ Editar registro del historial
// -----------------------------------------------------
export const updatePetHistory = async (historyId, updates) => {
  const { data, error } = await supabase
    .from("pet_history")
    .update(updates)
    .eq("id", historyId)
    .select()
    .single();

  if (error) {
    console.error("Error al actualizar historial:", error);
    throw error;
  }

  return data;
};

// -----------------------------------------------------
// 🗑 Eliminar registro del historial
// -----------------------------------------------------
export const deletePetHistory = async (historyId) => {
  const { error } = await supabase
    .from("pet_history")
    .delete()
    .eq("id", historyId);

  if (error) {
    console.error("Error al eliminar historial:", error);
    throw error;
  }

  return true;
};

// -----------------------------------------------------
// 📂 Subir archivo adjunto (PDF, imagen, etc.)
// Ruta: pet_history/petId/historyId.extension
// -----------------------------------------------------
export const uploadHistoryFile = async (petId, historyId, extension, fileBytes) => {
  const filePath = `pet_history/${petId}/${historyId}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("user_pets") // ❗ Usa el mismo bucket que usas para mascotas
    .upload(filePath, fileBytes, {
      contentType: "application/octet-stream",
      upsert: true,
    });

  if (uploadError) {
    console.error("Error subiendo archivo:", uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage
    .from("user_pets")
    .getPublicUrl(filePath);

  return data.publicUrl;
};
