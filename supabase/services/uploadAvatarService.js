// src/supabase/services/uploadAvatarService.js
import { supabase } from "../client/supabaseClient";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Buffer } from "buffer";

// ======================================================
// 📂 SUBIR AVATAR (EXPO GO + SDK 54 - ESTABLE)
// Ruta: user_pets/avatars/userId.jpg
// ======================================================
export const uploadAvatar = async (userId) => {
  try {
    // 1) Pedir permiso de galería
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Se necesita permiso para acceder a tus fotos");
      return null;
    }

    // 2) Abrir galería (SDK 54 compatible)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], // ✅ FORMA CORRECTA EN SDK 54 (SIN ENUMS)
      allowsEditing: true,
      quality: 0.7,
    });

    if (result.canceled) return null;

    const fileUri = result.assets[0].uri;

    // 3) Leer archivo como base64 (LEGACY, igual que petHistory)
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 4) Convertir base64 a bytes reales
    const fileBytes = Buffer.from(base64, "base64");

    // 5) Generar ruta REAL en el bucket user_pets
    const filePath = `avatars/${userId}.jpg`;

    // 6) Subir a Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("user_pets")
      .upload(filePath, fileBytes, {
        contentType: "image/jpeg",
        upsert: true, // sobrescribe si existe
      });

    if (uploadError) {
      console.error("❌ Error subiendo avatar:", uploadError);
      throw uploadError;
    }

    // 7) Obtener URL pública
    const { data } = supabase.storage
      .from("user_pets")
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    console.error("❌ uploadAvatar ERROR:", err);
    throw err;
  }
};

// ======================================================
// 🗑 ELIMINAR AVATAR
// ======================================================
export const deleteAvatar = async (userId) => {
  try {
    const filePath = `avatars/${userId}.jpg`;

    // 1) Eliminar del bucket
    await supabase.storage.from("user_pets").remove([filePath]);

    // 2) Limpiar la URL en el perfil
    await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", userId);

    return true;
  } catch (err) {
    console.error("❌ deleteAvatar ERROR:", err);
    throw err;
  }
};
