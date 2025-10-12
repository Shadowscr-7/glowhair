-- ==========================================
-- AGREGAR MÁS CATEGORÍAS DE PRODUCTOS CAPILARES
-- ==========================================
-- Categorías adicionales para completar el catálogo de productos para el cabello

-- Insertar nuevas categorías
INSERT INTO glowhair_categories (name, slug, description, is_active, display_order) VALUES

-- PRODUCTOS DE LIMPIEZA
('Champús Clarificantes', 'champus-clarificantes', 'Champús de limpieza profunda para eliminar residuos y acumulación', true, 13),
('Champús Sin Sulfatos', 'champus-sin-sulfatos', 'Champús suaves sin sulfatos para cuidado delicado', true, 14),
('Champús Secos', 'champus-secos', 'Champús en seco para refrescar el cabello sin agua', true, 15),
('Pre-Champú', 'pre-champu', 'Tratamientos previos al lavado para preparar el cabello', true, 16),

-- TRATAMIENTOS ESPECIALIZADOS
('Ampollas Capilares', 'ampollas-capilares', 'Ampollas de tratamiento intensivo y reparación', true, 17),
('Botox Capilar', 'botox-capilar', 'Tratamientos de botox para rejuvenecer el cabello', true, 18),
('Nanoplastia', 'nanoplastia', 'Tratamientos de nanoplastia para alisado natural', true, 19),
('Cauterización', 'cauterizacion', 'Tratamientos de cauterización capilar para reparación profunda', true, 20),
('Reconstrucción Capilar', 'reconstruccion-capilar', 'Productos para reconstruir la fibra capilar dañada', true, 21),

-- ESTILIZADO Y PEINADO
('Geles de Peinado', 'geles-peinado', 'Geles para fijar y moldear el peinado', true, 22),
('Ceras y Pomadas', 'ceras-pomadas', 'Ceras y pomadas para texturizar y definir', true, 23),
('Mousse', 'mousse', 'Espumas voluminizadoras y fijadoras', true, 24),
('Spray Fijadores', 'spray-fijadores', 'Sprays para fijar el peinado con diferentes niveles de fijación', true, 25),
('Lacas', 'lacas', 'Lacas profesionales de alta fijación', true, 26),
('Cremas para Peinar', 'cremas-peinar', 'Cremas para facilitar el peinado y controlar el frizz', true, 27),
('Texturizadores', 'texturizadores', 'Productos para dar textura y volumen', true, 28),

-- PROTECCIÓN Y CUIDADO
('Protectores de Calor', 'protectores-calor', 'Protectores térmicos para planchado y secado', true, 29),
('Protección Solar Capilar', 'proteccion-solar', 'Productos con protección UV para el cabello', true, 30),
('Protección de Color', 'proteccion-color', 'Productos para proteger y prolongar el color', true, 31),
('Anti-Rotura', 'anti-rotura', 'Tratamientos para fortalecer y prevenir la rotura', true, 32),
('Anti-Puntas Abiertas', 'anti-puntas-abiertas', 'Productos para sellar y reparar puntas abiertas', true, 33),

-- TRATAMIENTOS ESPECÍFICOS
('Tratamientos Rizos', 'tratamientos-rizos', 'Productos especializados para cabello rizado', true, 34),
('Método Curly', 'metodo-curly', 'Productos aptos para el método Curly Girl', true, 35),
('Cabello Graso', 'cabello-graso', 'Productos para controlar el exceso de grasa', true, 36),
('Cabello Seco', 'cabello-seco', 'Hidratación intensiva para cabello muy seco', true, 37),
('Caspa y Cuero Cabelludo', 'caspa-cuero-cabelludo', 'Tratamientos anticaspa y para el cuero cabelludo', true, 38),
('Crecimiento Capilar', 'crecimiento-capilar', 'Productos para estimular el crecimiento del cabello', true, 39),
('Caída del Cabello', 'caida-cabello', 'Tratamientos anti-caída y fortalecedores', true, 40),

-- COLORACIÓN
('Tintes Permanentes', 'tintes-permanentes', 'Tintes de coloración permanente', true, 41),
('Tintes Semipermanentes', 'tintes-semipermanentes', 'Coloración semipermanente sin amoníaco', true, 42),
('Decolorantes', 'decolorantes', 'Productos para aclarar y decolorar el cabello', true, 43),
('Matizadores', 'matizadores', 'Matizadores para neutralizar tonos no deseados', true, 44),
('Baños de Color', 'banos-color', 'Baños de color para refrescar y tonificar', true, 45),

-- ALISADOS Y PERMANENTES
('Alisado Brasileño', 'alisado-brasileno', 'Kits y productos de alisado brasileño', true, 46),
('Alisado Japonés', 'alisado-japones', 'Sistemas de alisado permanente japonés', true, 47),
('Permanentes', 'permanentes', 'Productos para rizado permanente', true, 48),
('Relajantes', 'relajantes', 'Relajantes químicos para alisado', true, 49),

-- COMPLEMENTOS
('Vitaminas Capilares', 'vitaminas-capilares', 'Suplementos vitamínicos para fortalecer el cabello', true, 50),
('Accesorios Profesionales', 'accesorios-profesionales', 'Herramientas y accesorios para el cuidado del cabello', true, 51),
('Cepillos y Peines', 'cepillos-peines', 'Cepillos profesionales y peines especializados', true, 52),
('Sets y Kits', 'sets-kits', 'Kits completos de tratamiento y cuidado', true, 53),

-- LÍNEAS ESPECIALES
('Productos Veganos', 'productos-veganos', 'Línea de productos 100% veganos', true, 54),
('Orgánicos y Naturales', 'organicos-naturales', 'Productos con ingredientes orgánicos certificados', true, 55),
('Sin Parabenos', 'sin-parabenos', 'Productos libres de parabenos y químicos agresivos', true, 56),
('Profesional Salon', 'profesional-salon', 'Línea exclusiva para uso profesional en salones', true, 57),
('Low Poo/No Poo', 'low-poo-no-poo', 'Productos para técnicas Low Poo y No Poo', true, 58);

-- Verificar las categorías insertadas
SELECT 
  name, 
  slug, 
  description, 
  is_active, 
  display_order
FROM glowhair_categories
WHERE display_order >= 13
ORDER BY display_order;

-- Contar total de categorías
SELECT COUNT(*) as total_categorias FROM glowhair_categories WHERE is_active = true;

-- NOTA: Si algunas categorías ya existen, el INSERT fallará en esas filas
-- Para evitar errores, puedes usar INSERT ... ON CONFLICT DO NOTHING
-- Pero PostgreSQL requiere un constraint único. Si tienes unique constraint en 'slug':
/*
INSERT INTO glowhair_categories (name, slug, description, is_active, display_order) VALUES
(...valores...)
ON CONFLICT (slug) DO NOTHING;
*/
