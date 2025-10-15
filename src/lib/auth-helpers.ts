/**
 * Utilidades para manejo de autenticación
 */

/**
 * Maneja el logout de forma segura y consistente
 * Limpia la sesión y redirige al login
 */
export const handleLogout = async (
  logoutFunction: () => Promise<void>,
  options?: {
    onBeforeLogout?: () => void;
    redirectUrl?: string;
  }
) => {
  try {
    // Ejecutar función antes del logout si existe
    if (options?.onBeforeLogout) {
      options.onBeforeLogout();
    }

    console.log('🚪 Iniciando logout...');
    
    // Ejecutar la función de logout
    await logoutFunction();
    
    console.log('✅ Logout completado');
    
    // Limpiar cualquier dato adicional del localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userId');
      localStorage.removeItem('cartItems');
    }
    
    // Pequeño delay para asegurar que todo se limpió
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Redirigir usando window.location para forzar recarga completa
    const redirectTo = options?.redirectUrl || '/login';
    window.location.href = redirectTo;
    
  } catch (error) {
    console.error('❌ Error en handleLogout:', error);
    
    // Aún así redirigir para evitar quedarse en estado inconsistente
    window.location.href = options?.redirectUrl || '/login';
  }
};
