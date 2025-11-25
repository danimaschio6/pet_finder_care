// supabase/services/reminderStorage.js

import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Clave única por mascota
 */
const key = (petId) => `reminders_${petId}`;

/**
 * Obtener todos los recordatorios de una mascota
 */
export const getReminders = async (petId) => {
  try {
    const stored = await AsyncStorage.getItem(key(petId));
    const list = stored ? JSON.parse(stored) : [];

    // Ordenar por fecha (más próximo primero)
    return list.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  } catch (error) {
    console.log("❌ Error getReminders:", error);
    return [];
  }
};

/**
 * Guardar lista completa — SIEMPRE en formato JSON válido
 */
export const saveReminders = async (petId, reminders) => {
  try {
    await AsyncStorage.setItem(key(petId), JSON.stringify(reminders));
    return true;
  } catch (error) {
    console.log("❌ Error saveReminders:", error);
    return false;
  }
};

/**
 * Agregar un nuevo recordatorio
 */
export const addReminder = async (petId, reminder) => {
  try {
    const oldList = await getReminders(petId);

    // Evitar duplicados por ID
    const filtered = oldList.filter((r) => r.id !== reminder.id);

    const updated = [...filtered, reminder].sort(
      (a, b) => new Date(a.datetime) - new Date(b.datetime)
    );

    await saveReminders(petId, updated);
    return updated;
  } catch (error) {
    console.log("❌ Error addReminder:", error);
    return [];
  }
};

/**
 * Eliminar un recordatorio por ID
 */
export const deleteReminder = async (petId, reminderId) => {
  try {
    const oldList = await getReminders(petId);

    const updated = oldList.filter((r) => r.id !== reminderId);

    await saveReminders(petId, updated);
    return updated;
  } catch (error) {
    console.log("❌ Error deleteReminder:", error);
    return [];
  }
};