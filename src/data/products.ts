export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  hairTypes?: string[];
  ingredients?: string[];
  benefits?: string[];
  howToUse?: string;
  size?: string;
  brand?: string;
}

export const mockProducts: Product[] = [
  {
    id: 1,
    name: "Shampoo Hidratante de Argán",
    description: "Shampoo nutritivo con aceite de argán para cabello seco y dañado. Restaura la hidratación natural y aporta brillo.",
    price: 24.99,
    originalPrice: 29.99,
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400",
    category: "Shampoo",
    rating: 4.8,
    reviews: 324,
    inStock: true,
    hairTypes: ["Seco", "Dañado", "Rizado"],
    ingredients: ["Aceite de Argán", "Keratina", "Vitamina E"],
    benefits: ["Hidratación profunda", "Reparación", "Brillo natural"],
    howToUse: "Aplica sobre cabello húmedo, masajea suavemente y enjuaga. Repite si es necesario.",
    size: "300ml",
    brand: "GlowHair"
  },
  {
    id: 2,
    name: "Acondicionador Reparador",
    description: "Acondicionador intensivo que repara y fortalece el cabello desde la raíz hasta las puntas.",
    price: 22.50,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
    category: "Acondicionador",
    rating: 4.7,
    reviews: 198,
    inStock: true,
    hairTypes: ["Dañado", "Quebradizo", "Teñido"],
    ingredients: ["Proteínas de Seda", "Colágeno", "Aceite de Coco"],
    benefits: ["Reparación profunda", "Fortalecimiento", "Suavidad"],
    howToUse: "Aplica sobre cabello lavado, deja actuar 2-3 minutos y enjuaga.",
    size: "250ml",
    brand: "GlowHair"
  },
  {
    id: 3,
    name: "Mascarilla Nutritiva Intensa",
    description: "Tratamiento intensivo semanal que nutre y restaura el cabello más dañado.",
    price: 35.00,
    originalPrice: 42.00,
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400",
    category: "Mascarilla",
    rating: 4.9,
    reviews: 156,
    inStock: true,
    hairTypes: ["Muy Dañado", "Seco", "Poroso"],
    ingredients: ["Manteca de Karité", "Aceite de Jojoba", "Proteínas Hidrolizadas"],
    benefits: ["Nutrición intensa", "Reparación profunda", "Elasticidad"],
    howToUse: "Aplica sobre cabello húmedo, deja actuar 10-15 minutos y enjuaga.",
    size: "200ml",
    brand: "GlowHair"
  },
  {
    id: 4,
    name: "Serum Antifrizz",
    description: "Serum ligero que controla el frizz y aporta definición sin peso.",
    price: 28.75,
    image: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400",
    category: "Serum",
    rating: 4.6,
    reviews: 89,
    inStock: true,
    hairTypes: ["Rizado", "Ondulado", "Frizz"],
    ingredients: ["Aceite de Argán", "Siliconas Ligeras", "Extracto de Lino"],
    benefits: ["Control de frizz", "Definición", "Brillo"],
    howToUse: "Aplica sobre cabello húmedo o seco, desde medios a puntas.",
    size: "100ml",
    brand: "GlowHair"
  },
  {
    id: 5,
    name: "Aceite Capilar Regenerador",
    description: "Aceite nutritivo que regenera y protege el cabello de los daños externos.",
    price: 32.00,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
    category: "Aceite",
    rating: 4.8,
    reviews: 234,
    inStock: true,
    hairTypes: ["Seco", "Dañado", "Maduro"],
    ingredients: ["Aceite de Argán", "Aceite de Ricino", "Vitamina E"],
    benefits: ["Regeneración", "Protección", "Nutrición"],
    howToUse: "Aplica unas gotas sobre cabello húmedo o seco, desde medios a puntas.",
    size: "50ml",
    brand: "GlowHair"
  },
  {
    id: 6,
    name: "Spray Protector Térmico",
    description: "Protección contra el calor del secador y plancha hasta 230°C.",
    price: 18.90,
    originalPrice: 23.90,
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400",
    category: "Protector",
    rating: 4.5,
    reviews: 167,
    inStock: true,
    hairTypes: ["Todos los tipos"],
    ingredients: ["Filtros UV", "Proteínas Vegetales", "Pantenol"],
    benefits: ["Protección térmica", "Facilita peinado", "Brillo"],
    howToUse: "Pulveriza sobre cabello húmedo antes del peinado con calor.",
    size: "150ml",
    brand: "GlowHair"
  },
  {
    id: 7,
    name: "Champú Seco Refrescante",
    description: "Absorbe el exceso de grasa y refresca el cabello entre lavados.",
    price: 15.50,
    image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400",
    category: "Champú Seco",
    rating: 4.4,
    reviews: 298,
    inStock: true,
    hairTypes: ["Graso", "Mixto"],
    ingredients: ["Almidón de Arroz", "Extracto de Ortiga", "Fragancia Natural"],
    benefits: ["Absorbe grasa", "Volumen", "Frescura"],
    howToUse: "Pulveriza sobre raíces, masajea y cepilla.",
    size: "200ml",
    brand: "GlowHair"
  },
  {
    id: 8,
    name: "Crema Definidora de Rizos",
    description: "Define y controla los rizos sin apelmazar, con fijación natural.",
    price: 26.80,
    image: "https://images.unsplash.com/photo-1560869713-7d0ac492c7c2?w=400",
    category: "Definidor",
    rating: 4.7,
    reviews: 145,
    inStock: true,
    hairTypes: ["Rizado", "Ondulado"],
    ingredients: ["Aceite de Coco", "Manteca de Karité", "Gel de Aloe"],
    benefits: ["Definición", "Control", "Hidratación"],
    howToUse: "Aplica sobre cabello húmedo, moldea y deja secar al aire.",
    size: "250ml",
    brand: "GlowHair"
  }
];

// Función para obtener productos por categoría
export const getProductsByCategory = (category: string): Product[] => {
  return mockProducts.filter(product => 
    product.category.toLowerCase() === category.toLowerCase()
  );
};

// Función para obtener productos por tipo de cabello
export const getProductsByHairType = (hairType: string): Product[] => {
  return mockProducts.filter(product => 
    product.hairTypes?.some(type => 
      type.toLowerCase() === hairType.toLowerCase()
    )
  );
};

// Función para buscar productos
export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockProducts.filter(product =>
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery) ||
    product.category.toLowerCase().includes(lowercaseQuery) ||
    product.hairTypes?.some(type => type.toLowerCase().includes(lowercaseQuery)) ||
    product.ingredients?.some(ingredient => ingredient.toLowerCase().includes(lowercaseQuery))
  );
};

// Función para obtener producto por ID
export const getProductById = (id: number): Product | undefined => {
  return mockProducts.find(product => product.id === id);
};

// Función para obtener productos relacionados
export const getRelatedProducts = (productId: number, limit: number = 4): Product[] => {
  const product = getProductById(productId);
  if (!product) return [];
  
  return mockProducts
    .filter(p => p.id !== productId && p.category === product.category)
    .slice(0, limit);
};