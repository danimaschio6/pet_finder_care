import { supabase } from "../client/supabaseClient";

export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.log("Error obteniendo perfil:", error);
    throw error;
  }

  return data;
};

export const updateAvatar = async (userId, avatarUrl) => {
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", userId);

  if (error) throw error;
};
