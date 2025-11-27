// src/supabase/services/petHistoryService.js
import { supabase } from "../client/supabaseClient";
import * as FileSystem from "expo-file-system/legacy";
import { Buffer } from "buffer";

// ======================================================
// 📌 Obtener historial de una mascota
// ======================================================
export const getPetHistory = async (petId) => {
  const { data, error } = await supabase
    .from("pet_history")
    .select("*")
    .eq("pet_id", petId)
    .order("fecha", { ascending: false });

  if (error) {
    console.error("❌ Error al obtener historial clínico:", error);
    throw error;
  }

  return data;
};

// ======================================================
// ➕ Crear registro de historial
// ======================================================
export const createPetHistory = async (historyData) => {
  const { data, error } = await supabase
    .from("pet_history")
    .insert(historyData)
    .select()
    .single();

  if (error) {
    console.error("❌ Error al crear historial:", error);
    throw error;
  }

  return data;
};

// ======================================================
// ✏ Actualizar historial
// ======================================================
export const updatePetHistory = async (historyId, updates) => {
  const { data, error } = await supabase
    .from("pet_history")
    .update(updates)
    .eq("id", historyId)
    .select()
    .single();

  if (error) {
    console.error("❌ Error al actualizar historial:", error);
    throw error;
  }

  return data;
};

// ======================================================
// 🗑 Eliminar historial
// ======================================================
export const deletePetHistory = async (historyId) => {
  const { error } = await supabase
    .from("pet_history")
    .delete()
    .eq("id", historyId);

  if (error) {
    console.error("❌ Error al eliminar historial:", error);
    throw error;
  }

  return true;
};

// ======================================================
// 📂 SUBIR ARCHIVO (PDF / IMG / PNG / ETC.)
// 100% compatible con EXPO GO + SDK 54
// Ruta final: user_pets/pet_history/petId/historyId.ext
// ======================================================
export const uploadHistoryFile = async (petId, historyId, extension, fileUri) => {
  try {
    // 1) Leer archivo como base64 desde el dispositivo
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 2) Convertir base64 -> Uint8Array (bytes reales)
    const fileBytes = Buffer.from(base64, "base64");

    // 3) Generar ruta REAL en tu bucket user_pets
    const filePath = `pet_history/${petId}/${historyId}.${extension}`;

    // 4) Subir a Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("user_pets")
      .upload(filePath, fileBytes, {
        contentType: getMimeFromExtension(extension),
        upsert: true, // sobrescribir si existe
      });

    if (uploadError) {
      console.error("❌ Error subiendo archivo a Supabase:", uploadError);
      throw uploadError;
    }

    // 5) Obtener URL pública
    const { data } = supabase.storage
      .from("user_pets")
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    console.error("❌ uploadHistoryFile ERROR:", err);
    throw err;
  }
};

// ======================================================
// 📌 Utilidad: detectar MIME por extensión
// ======================================================
const getMimeFromExtension = (ext) => {
  switch (ext.toLowerCase()) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
};
