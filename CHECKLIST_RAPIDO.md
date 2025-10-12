# ✅ CHECKLIST - Solucionar Creación de Productos

## 🎯 HAZ ESTO AHORA (en orden):

### ☑️ PASO 1: Configurar Service Role Key (2 minutos)

1. **Abrir Supabase Dashboard**
   - Ve a: https://supabase.com/dashboard
   - Abre tu proyecto GlowHair

2. **Copiar Service Role Key**
   - Menu → Settings → API
   - Busca: **Project API keys**
   - Copia el valor de: `service_role` (la key MUY larga que empieza con `eyJ...`)

3. **Crear/Editar .env.local**
   - En la raíz del proyecto (donde está `package.json`)
   - Si no existe, créalo
   - Agrega esta línea:
   ```
   SUPABASE_SERVICE_ROLE_KEY=pega_aqui_la_key_que_copiaste
   ```

4. **Verificar .env.local completo**
   Debe tener al menos esto:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   NEXT_PUBLIC_OPENAI_API_KEY=sk-...
   ```

---

### ☑️ PASO 2: Ejecutar SQL en Supabase (1 minuto)

1. **Ir al SQL Editor de Supabase**
   - En Supabase Dashboard
   - Menu lateral → SQL Editor
   - Click "New query"

2. **Copiar y Ejecutar**
   - Abre el archivo: `fix_rls_products.sql`
   - Copia TODO el contenido
   - Pégalo en el SQL Editor
   - Click "RUN" (o Ctrl + Enter)

3. **Verificar resultado**
   Deberías ver 2 tablas al final:
   - ✅ Políticas (4 rows)
   - ✅ Columnas (debería incluir: benefits, features, ingredients, etc.)

---

### ☑️ PASO 3: Reiniciar Servidor (30 segundos)

```bash
# En la terminal donde corre npm run dev:
# 1. Detener: Ctrl + C
# 2. Reiniciar:
npm run dev
```

---

### ☑️ PASO 4: PROBAR (1 minuto)

1. **Ir a:** http://localhost:3000/admin/productos/nuevo

2. **Subir imagen:**
   - Arrastra una imagen de producto
   - Espera que la IA analice (10 seg)

3. **Completar campos:**
   - Revisa que se auto-completaron
   - Precio: 1500
   - Stock: 100

4. **Click "Guardar Producto"**

5. **Ver resultado:**
   - ✅ Toast verde: "¡Producto creado correctamente!"
   - ❌ Si falla: revisar consola

---

## 🔍 ¿QUÉ VERIFICAR?

### ✅ Si TODO funciona:
- Toast verde aparece
- Producto se ve en Supabase
- No hay errores en consola

### ❌ Si FALLA:

#### Error: "infinite recursion"
→ Ejecuta `fix_rls_products.sql` nuevamente

#### Error: "supabaseAdmin is null"
→ Verifica `.env.local` tiene `SUPABASE_SERVICE_ROLE_KEY`
→ Reinicia el servidor

#### Error: "could not find column 'benefits'"
→ El SQL no se ejecutó correctamente
→ Ejecuta `fix_rls_products.sql` de nuevo

#### No aparece nada
→ Abre consola del navegador (F12)
→ Busca errores en rojo
→ Revisa terminal del servidor

---

## 📁 ARCHIVOS QUE NECESITAS

En tu proyecto ya tienes:
- ✅ `fix_rls_products.sql` - SQL completo para ejecutar
- ✅ `SOLUCION_COMPLETA_PRODUCTOS.md` - Documentación detallada
- ✅ `CONFIGURAR_SERVICE_ROLE_KEY.md` - Guía de la key

---

## ⚡ RESUMEN RÁPIDO

```
1. Supabase Dashboard → Settings → API → Copiar service_role key
2. Crear .env.local → Agregar SUPABASE_SERVICE_ROLE_KEY=tu_key
3. Supabase → SQL Editor → Pegar fix_rls_products.sql → RUN
4. Terminal → Ctrl+C → npm run dev
5. Browser → /admin/productos/nuevo → Probar
```

---

## 🎉 DESPUÉS DE QUE FUNCIONE

Todo debería estar operativo:
- ✅ Creación de productos con IA
- ✅ Auto-completado de campos
- ✅ Guardado en base de datos
- ✅ Notificaciones toast
- ✅ Sin errores de recursión

---

**¿Dudas?** Lee `SOLUCION_COMPLETA_PRODUCTOS.md` para más detalles.

**¿Problemas?** Revisa la consola del navegador y del servidor.
