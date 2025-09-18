"use client";

import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

export const StatCard = ({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon, 
  color = 'blue' 
}: StatCardProps) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      border: 'border-blue-200'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      border: 'border-green-200'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      border: 'border-purple-200'
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
      border: 'border-orange-200'
    }
  };

  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-lg border ${colorClasses[color].border} p-6 hover:shadow-xl transition-shadow`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {isPositive && <TrendingUp className="w-4 h-4 text-green-500 mr-1" />}
              {isNegative && <TrendingDown className="w-4 h-4 text-red-500 mr-1" />}
              <span className={`text-sm font-medium ${
                isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
              }`}>
                {change > 0 ? '+' : ''}{change}%
              </span>
              {changeLabel && (
                <span className="text-sm text-gray-500 ml-1">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-lg ${colorClasses[color].bg}`}>
          <div className={colorClasses[color].icon}>
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface ChartContainerProps {
  title: string;
  children: React.ReactElement;
  height?: number;
}

export const ChartContainer = ({ title, children, height = 300 }: ChartContainerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          {children}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

interface SalesChartProps {
  data: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
}

export const SalesChart = ({ data }: SalesChartProps) => {
  return (
    <ChartContainer title="Evolución de Ventas">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip 
          formatter={(value, name) => [
            name === 'sales' ? `€${value}` : value,
            name === 'sales' ? 'Ventas' : 'Pedidos'
          ]}
        />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="sales" 
          stackId="1" 
          stroke="#8b5cf6" 
          fill="#8b5cf6" 
          fillOpacity={0.6}
          name="Ventas (€)"
        />
      </AreaChart>
    </ChartContainer>
  );
};

interface OrdersChartProps {
  data: Array<{
    date: string;
    orders: number;
    completed: number;
    cancelled: number;
  }>;
}

export const OrdersChart = ({ data }: OrdersChartProps) => {
  return (
    <ChartContainer title="Evolución de Pedidos">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completados" />
        <Bar dataKey="cancelled" stackId="a" fill="#ef4444" name="Cancelados" />
      </BarChart>
    </ChartContainer>
  );
};

interface ProductSalesChartProps {
  data: Array<{
    name: string;
    sales: number;
    units: number;
  }>;
}

export const ProductSalesChart = ({ data }: ProductSalesChartProps) => {
  return (
    <ChartContainer title="Productos Más Vendidos" height={400}>
      <BarChart data={data} layout="horizontal">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={150} />
        <Tooltip formatter={(value, name) => [
          name === 'sales' ? `€${value}` : `${value} unidades`,
          name === 'sales' ? 'Ingresos' : 'Unidades'
        ]} />
        <Bar dataKey="sales" fill="#8b5cf6" name="Ingresos (€)" />
      </BarChart>
    </ChartContainer>
  );
};

interface StatusPieChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  title: string;
}

export const StatusPieChart = ({ data, title }: StatusPieChartProps) => {
  return (
    <ChartContainer title={title} height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ChartContainer>
  );
};

interface TrendLineChartProps {
  data: Array<{
    date: string;
    value: number;
  }>;
  title: string;
  color?: string;
  formatter?: (value: number) => string;
}

export const TrendLineChart = ({ 
  data, 
  title, 
  color = "#8b5cf6",
  formatter = (value) => value.toString()
}: TrendLineChartProps) => {
  return (
    <ChartContainer title={title}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value) => [formatter(Number(value)), 'Valor']} />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ChartContainer>
  );
};

// Datos de ejemplo
export const generateSampleData = () => {
  const salesData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric' 
    }),
    sales: Math.floor(Math.random() * 1000) + 500,
    orders: Math.floor(Math.random() * 50) + 20
  }));

  const ordersData = Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', { 
      weekday: 'short' 
    }),
    orders: Math.floor(Math.random() * 30) + 10,
    completed: Math.floor(Math.random() * 25) + 5,
    cancelled: Math.floor(Math.random() * 5) + 1
  }));

  const productData = [
    { name: 'Champú Hidratante Premium', sales: 2450, units: 35 },
    { name: 'Mascarilla Nutritiva', sales: 1890, units: 28 },
    { name: 'Acondicionador Reparador', sales: 1650, units: 22 },
    { name: 'Serum Anti-Frizz', sales: 1320, units: 18 },
    { name: 'Tratamiento Capilar', sales: 980, units: 12 }
  ];

  return { salesData, ordersData, productData };
};