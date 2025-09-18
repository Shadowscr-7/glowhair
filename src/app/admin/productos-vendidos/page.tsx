"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Package, 
  TrendingUp, 
  Euro, 
  Eye, 
  Download,
  Star,
  ShoppingCart,
  BarChart3,
  Award
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  DateRangeFilter, 
  SearchFilter, 
  SelectFilter, 
  FiltersSummary, 
  QuickDateFilters 
} from "@/components/admin/Filters";
import { 
  StatCard, 
  ProductSalesChart, 
  TrendLineChart,
  generateSampleData 
} from "@/components/admin/Charts";

interface ProductSale {
  id: string;
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;
  profit: number;
  avgRating: number;
  totalReviews: number;
  image: string;
  trend: number; // Percentage change from previous period
}

const ProductsPage = () => {
  const { state: authState } = useAuth();
  const router = useRouter();

  // Filters state
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [quickFilter, setQuickFilter] = useState<number | undefined>(30);
  const [sortBy, setSortBy] = useState('revenue'); // revenue, units, rating, trend

  // Mock data - In real app, this would come from API
  const [products] = useState<ProductSale[]>([
    {
      id: '1',
      name: 'Champú Hidratante Premium',
      category: 'Champús',
      unitsSold: 156,
      revenue: 3899.44,
      profit: 1559.78,
      avgRating: 4.8,
      totalReviews: 124,
      image: '/images/products/shampoo.jpg',
      trend: 12.5
    },
    {
      id: '2',
      name: 'Mascarilla Nutritiva',
      category: 'Tratamientos',
      unitsSold: 89,
      revenue: 3115.11,
      profit: 1557.56,
      avgRating: 4.9,
      totalReviews: 87,
      image: '/images/products/mask.jpg',
      trend: 8.3
    },
    {
      id: '3',
      name: 'Acondicionador Reparador',
      category: 'Acondicionadores',
      unitsSold: 134,
      revenue: 2814.66,
      profit: 1125.86,
      avgRating: 4.7,
      totalReviews: 156,
      image: '/images/products/conditioner.jpg',
      trend: -2.1
    },
    {
      id: '4',
      name: 'Serum Anti-Frizz',
      category: 'Serums',
      unitsSold: 67,
      revenue: 2679.33,
      profit: 1339.67,
      avgRating: 4.6,
      totalReviews: 89,
      image: '/images/products/serum.jpg',
      trend: 18.7
    },
    {
      id: '5',
      name: 'Tratamiento Capilar Intensivo',
      category: 'Tratamientos',
      unitsSold: 45,
      revenue: 2024.55,
      profit: 1012.28,
      avgRating: 4.9,
      totalReviews: 67,
      image: '/images/products/treatment.jpg',
      trend: 5.2
    },
    {
      id: '6',
      name: 'Aceite Reparador',
      category: 'Aceites',
      unitsSold: 78,
      revenue: 1716.84,
      profit: 858.42,
      avgRating: 4.5,
      totalReviews: 45,
      image: '/images/products/oil.jpg',
      trend: -5.8
    }
  ]);

  // Check authentication
  useEffect(() => {
    if (!authState.isAuthenticated || authState.user?.role !== "admin") {
      router.push("/");
    }
  }, [authState, router]);

  // Quick date filter handler
  const handleQuickFilter = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    setStartDate(startDate.toISOString().split('T')[0]);
    setEndDate(endDate.toISOString().split('T')[0]);
    setQuickFilter(days);
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || product.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'revenue':
          return b.revenue - a.revenue;
        case 'units':
          return b.unitsSold - a.unitsSold;
        case 'rating':
          return b.avgRating - a.avgRating;
        case 'trend':
          return b.trend - a.trend;
        default:
          return b.revenue - a.revenue;
      }
    });

    return filtered;
  }, [products, searchTerm, categoryFilter, sortBy]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalRevenue = filteredProducts.reduce((sum, product) => sum + product.revenue, 0);
    const totalUnits = filteredProducts.reduce((sum, product) => sum + product.unitsSold, 0);
    const totalProfit = filteredProducts.reduce((sum, product) => sum + product.profit, 0);
    const avgRating = filteredProducts.reduce((sum, product) => sum + product.avgRating, 0) / filteredProducts.length;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalUnits,
      totalProfit,
      avgRating: avgRating || 0,
      profitMargin
    };
  }, [filteredProducts]);

  // Generate chart data
  const { productData } = generateSampleData();

  // Category options for filter
  const categoryOptions = [
    { value: 'Champús', label: 'Champús' },
    { value: 'Acondicionadores', label: 'Acondicionadores' },
    { value: 'Tratamientos', label: 'Tratamientos' },
    { value: 'Serums', label: 'Serums' },
    { value: 'Aceites', label: 'Aceites' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'revenue', label: 'Ingresos' },
    { value: 'units', label: 'Unidades Vendidas' },
    { value: 'rating', label: 'Valoración' },
    { value: 'trend', label: 'Tendencia' }
  ];

  // Active filters for summary
  const activeFilters = [
    ...(searchTerm ? [{ label: 'Búsqueda', value: searchTerm }] : []),
    ...(categoryFilter ? [{ label: 'Categoría', value: categoryFilter }] : []),
    { label: 'Fecha', value: `${startDate} - ${endDate}` },
    { label: 'Ordenar por', value: sortOptions.find(s => s.value === sortBy)?.label || sortBy }
  ];

  const clearFilter = (index: number) => {
    if (activeFilters[index].label === 'Búsqueda') {
      setSearchTerm('');
    } else if (activeFilters[index].label === 'Categoría') {
      setCategoryFilter('');
    } else if (activeFilters[index].label === 'Ordenar por') {
      setSortBy('revenue');
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setSortBy('revenue');
    handleQuickFilter(30);
  };

  // Generate trend data for chart
  const trendData = Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', { 
      weekday: 'short' 
    }),
    value: Math.floor(Math.random() * 1000) + 500
  }));

  if (!authState.isAuthenticated || authState.user?.role !== "admin") {
    return null;
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Productos Más Vendidos</h1>
            <p className="text-gray-600 mt-1">
              Analiza el rendimiento de tus productos más exitosos
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-glow-600 text-white px-4 py-2 rounded-lg hover:bg-glow-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar
          </motion.button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Ingresos Totales"
            value={`€${stats.totalRevenue.toFixed(2)}`}
            icon={<Euro className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="Unidades Vendidas"
            value={stats.totalUnits}
            icon={<Package className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Beneficio Total"
            value={`€${stats.totalProfit.toFixed(2)}`}
            icon={<TrendingUp className="w-6 h-6" />}
            color="purple"
          />
          <StatCard
            title="Valoración Media"
            value={stats.avgRating.toFixed(1)}
            icon={<Star className="w-6 h-6" />}
            color="orange"
          />
          <StatCard
            title="Margen de Beneficio"
            value={`${stats.profitMargin.toFixed(1)}%`}
            icon={<BarChart3 className="w-6 h-6" />}
            color="blue"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProductSalesChart data={productData} />
          <TrendLineChart 
            data={trendData} 
            title="Tendencia de Ventas (7 días)" 
            formatter={(value) => `€${value}`}
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
          
          <SearchFilter
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
          
          <SelectFilter
            title="Categoría"
            options={categoryOptions}
            value={categoryFilter}
            onChange={setCategoryFilter}
            placeholder="Todas las categorías"
          />

          <SelectFilter
            title="Ordenar por"
            options={sortOptions}
            value={sortBy}
            onChange={setSortBy}
          />
          
          <QuickDateFilters
            onQuickFilter={handleQuickFilter}
            activeFilter={quickFilter}
          />
        </div>

        {/* Active Filters Summary */}
        <FiltersSummary
          activeFilters={activeFilters}
          onClearFilter={clearFilter}
          onClearAll={clearAllFilters}
        />

        {/* Products Grid */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Productos ({filteredProducts.length})
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                {/* Ranking Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {index < 3 && (
                      <div className={`p-2 rounded-full ${
                        index === 0 ? 'bg-yellow-100 text-yellow-600' :
                        index === 1 ? 'bg-gray-100 text-gray-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        <Award className="w-4 h-4" />
                      </div>
                    )}
                    <span className="text-lg font-bold text-gray-900">#{index + 1}</span>
                  </div>
                  
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                    product.trend > 0 
                      ? 'bg-green-100 text-green-600' 
                      : product.trend < 0 
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-600'
                  }`}>
                    <TrendingUp className={`w-3 h-3 ${product.trend < 0 ? 'rotate-180' : ''}`} />
                    {product.trend > 0 ? '+' : ''}{product.trend.toFixed(1)}%
                  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-glow-600">€{product.revenue.toFixed(0)}</p>
                      <p className="text-xs text-gray-500">Ingresos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{product.unitsSold}</p>
                      <p className="text-xs text-gray-500">Unidades</p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium text-gray-900">{product.avgRating}</span>
                      <span className="text-sm text-gray-500">({product.totalReviews})</span>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">€{product.profit.toFixed(0)}</p>
                      <p className="text-xs text-gray-500">Beneficio</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 text-glow-600 hover:text-glow-700 text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Detalles
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-700 text-sm font-medium"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Ver Pedidos
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProductsPage;