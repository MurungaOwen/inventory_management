import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DollarSign, ShoppingBag, AlertTriangle, Package, TrendingUp } from 'lucide-react';
import { type Product } from '@/types';

export const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data with individual error handling
        let dailyReport = null;
        let weeklyReport = null;
        let lowStockRes = null;
        let productsRes = null;

        try {
          dailyReport = await api.get('/reports/daily');
        } catch (err) {
          console.error('Failed to fetch daily report:', err);
        }

        try {
          weeklyReport = await api.get('/reports/weekly');
        } catch (err) {
          console.error('Failed to fetch weekly report:', err);
        }

        try {
          lowStockRes = await api.get('/inventory/low-stock');
        } catch (err) {
          console.error('Failed to fetch low stock:', err);
        }

        try {
          productsRes = await api.get('/products');
        } catch (err) {
          console.error('Failed to fetch products:', err);
        }

        // Set stats with fallback
        if (dailyReport?.data?.data) {
          setStats(dailyReport.data.data);
        }
        
        // Transform weekly data for chart
        if (weeklyReport?.data?.data?.dailyBreakdown) {
          setWeeklyData(weeklyReport.data.data.dailyBreakdown);
        }

        // Process low stock items
        if (lowStockRes?.data?.data && productsRes?.data?.data) {
          const productsMap = new Map(productsRes.data.data.map((p: Product) => [p.id, p.name]));
          
          const lowStockWithNames = lowStockRes.data.data.slice(0, 5).map((item: any) => ({
            ...item,
            productName: productsMap.get(item.productId) || 'Unknown Product',
          }));
          
          setLowStock(lowStockWithNames);
        } else if (lowStockRes?.data?.data) {
          setLowStock(lowStockRes.data.data.slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  const cards = [
    {
      title: "Today's Sales",
      value: `KES ${stats?.stats?.total_revenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      title: 'Transactions',
      value: stats?.salesCount || 0,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Low Stock Items',
      value: lowStock.length,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
    {
      title: 'Avg. Sale Value',
      value: `KES ${Math.round(stats?.stats?.average_sale || 0).toLocaleString()}`,
      icon: Package,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.bg}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Low Stock Alerts</h2>
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Threshold</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {item.productName}
                    </td>
                    <td className="px-4 py-3 text-red-600 font-bold">{item.currentStock}</td>
                    <td className="px-4 py-3 text-slate-500">{item.reorderThreshold}</td>
                  </tr>
                ))}
                {lowStock.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-center text-slate-500">
                      No low stock items
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Weekly Sales</h2>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
