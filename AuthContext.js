import React, { createContext, useState, useContext, useEffect } from 'react';
// ⚠️ Asegúrate de que la ruta a tu archivo supabase.js sea correcta
import { supabase } from './BD-Supabase/supabase'; 
import { Alert } from 'react-native'; // Se mantiene, aunque el uso directo de Alert debe evitarse en favor de UI personalizadas

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null); 
  const [loading, setLoading] = useState(true); 

  // Monitorear la sesión al inicio de la app
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Suscribe la aplicación a los cambios de estado de Supabase (LOGIN, LOGOUT)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Función de Inicio de Sesión (con logs de depuración)
  const signIn = async (email, password) => {
    setLoading(true);
    
    // 🔍 CONSOLE.LOG 1: Datos que se envían (sin mostrar la contraseña)
    console.log("-> INTENTANDO INICIAR SESIÓN con email:", email); 
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    setLoading(false);

    if (error) {
        // 🔍 CONSOLE.LOG 2: Mostrar el error de Supabase
        console.error("<- ERROR DE RESPUESTA DE SUPABASE:", error.message);
        throw error; // Lanzar el error para que sea capturado en LoginScreen
    }
    
    // 🔍 CONSOLE.LOG 3: Mostrar los datos de la sesión exitosa
    console.log("<- SESIÓN EXITOSA. Usuario:", data.user.id, "Sesión:", data.session.access_token.substring(0, 10) + '...');
    
    return data;
  };

  // Función de Registro
  // 🛑 MODIFICADO: Acepta 'name' y maneja la inserción en la tabla 'profiles'.
  const signUp = async (email, password, name) => { 
    setLoading(true);
    
    // 1. Registrar usuario con Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    
    if (authError) {
      setLoading(false);
      throw authError; // Error de autenticación (ej: usuario ya existe, contraseña débil)
    }

    const user = data.user;

    // 2. Si la autenticación fue exitosa y tenemos un usuario, insertar en la tabla 'profiles'
    if (user) {
      // La inserción debe ser: id (UUID del usuario), first_name
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: user.id, // Usar el UUID del usuario de Auth
            first_name: name // Guardar el nombre proporcionado
          }
        ]);
      
      if (profileError) {
        // Este es un error crítico. La cuenta se creó, pero el perfil no.
        console.error("Error al insertar perfil:", profileError);
        // Lanzamos un error que el LoginScreen puede manejar.
        setLoading(false);
        throw new Error(`Registro exitoso, pero el perfil falló: ${profileError.message}`);
      }
      console.log("Perfil creado exitosamente para el usuario:", user.id);
    }
    
    setLoading(false);
    return data;
  };
  
  // Función de Cierre de Sesión (opcional)
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user: session?.user, 
    signIn,
    signUp,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);