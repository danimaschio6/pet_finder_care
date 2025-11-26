import { supabase } from "../client/supabaseClient";

export const reportAsLost = async (pet) => {
  try {
    const { data: session } = await supabase.auth.getUser();
    const userId = session?.user?.id;

    if (!userId) throw new Error("Usuario no autenticado");

    const { error } = await supabase.from("pets").insert([
      {
        name: pet.nombre,
        species: pet.especie,
        breed: pet.raza,
        description: "Reportada por el dueño",
        location: "Ubicación del usuario",
        owner_id: userId,
        image_url: pet.foto_url,
        status: "perdida",
      },
    ]);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error reportando mascota:", error.message);
    throw error;
  }
};
