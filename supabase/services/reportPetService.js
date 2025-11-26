import { supabase } from "../client/supabaseClient";

/* ================================
   🔴 REPORTAR COMO PERDIDA (INSERT)
   ================================ */
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

/* ================================
   ✅ MARCAR COMO ENCONTRADA (FIX REAL)
   ================================ */
export const markAsFound = async (pet) => {
  try {
    const { data: session } = await supabase.auth.getUser();
    const userId = session?.user?.id;

    if (!userId) throw new Error("Usuario no autenticado");

    // 🔍 1. BUSCAR LA PUBLICACIÓN PERDIDA REAL
    const { data: lostPet, error: findError } = await supabase
      .from("pets")
      .select("id")
      .eq("owner_id", userId)
      .eq("name", pet.nombre)
      .eq("species", pet.especie)
      .eq("status", "perdida")
      .limit(1)
      .maybeSingle();

    if (findError) throw findError;
    if (!lostPet) throw new Error("No se encontró publicación perdida");

    // ✅ 2. ACTUALIZAR POR ID REAL
    const { error: updateError } = await supabase
      .from("pets")
      .update({ status: "encontrada" })
      .eq("id", lostPet.id);

    if (updateError) throw updateError;

    return true;
  } catch (error) {
    console.error("🔥 Error marcando como encontrada:", error.message);
    throw error;
  }
};
