import { supabase } from "../client/supabaseClient";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Buffer } from "buffer";

// ✅ SUBIR AVATAR
export const uploadAvatar = async (userId) => {
  // ✅ Pedir permiso
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    alert("Se requiere permiso para acceder a tus fotos");
    return null;
  }

  // ✅ Abrir galería
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: [ImagePicker.MediaType.Images],
    quality: 0.7,
  });

  if (result.canceled) return null;

  const fileUri = result.assets[0].uri;

  // ✅ Convertir a base64
  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const bytes = Buffer.from(base64, "base64");

  const path = `avatars/${userId}.jpg`;

  // ✅ Subir al bucket
  const { error } = await supabase.storage
    .from("user_pets")
    .upload(path, bytes, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (error) {
    console.log("❌ Error al subir avatar:", error);
    throw error;
  }

  // ✅ Obtener URL pública
  const { data } = supabase.storage
    .from("user_pets")
    .getPublicUrl(path);

  return data.publicUrl;
};

// ✅ ELIMINAR AVATAR
export const deleteAvatar = async (userId) => {
  const path = `avatars/${userId}.jpg`;

  await supabase.storage.from("user_pets").remove([path]);

  await supabase
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", userId);

  return true;
};
