import { supabase } from "../client/supabaseClient";

// -----------------------------------------------------
// 🐶 Obtener todas las mascotas del usuario logueado
// -----------------------------------------------------
export const getUserPets = async (userId) => {
  const { data, error } = await supabase
    .from("user_pets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener mascotas:", error);
    throw error;
  }

  return data;
};

// -----------------------------------------------------
// ➕ Crear nueva mascota
// -----------------------------------------------------
export const createPet = async (petData) => {
  const { data, error } = await supabase
    .from("user_pets")
    .insert([petData])
    .select()
    .single();

  if (error) {
    console.error("Error al crear mascota:", error);
    throw error;
  }

  return data;
};

// -----------------------------------------------------
// ✏ Editar mascota
// -----------------------------------------------------
export const updatePet = async (petId, updates) => {
  const { data, error } = await supabase
    .from("user_pets")
    .update(updates)
    .eq("id", petId)
    .select()
    .single();

  if (error) {
    console.error("Error al actualizar mascota:", error);
    throw error;
  }

  return data;
};

// -----------------------------------------------------
// 🗑 Eliminar mascota
// -----------------------------------------------------
export const deletePet = async (petId) => {
  const { error } = await supabase
    .from("user_pets")
    .delete()
    .eq("id", petId);

  if (error) {
    console.error("Error al eliminar mascota:", error);
    throw error;
  }

  return true;
};
