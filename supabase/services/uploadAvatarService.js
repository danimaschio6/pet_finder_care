import { supabase } from "../client/supabaseClient";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Buffer } from "buffer";

export const uploadAvatar = async (userId) => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
  });

  if (result.canceled) return null;

  const fileUri = result.assets[0].uri;

  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const bytes = Buffer.from(base64, "base64");

  const path = `avatars/${userId}.jpg`;

  const { error } = await supabase.storage
    .from("user_pets")
    .upload(path, bytes, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from("user_pets")
    .getPublicUrl(path);

  return data.publicUrl;
};
