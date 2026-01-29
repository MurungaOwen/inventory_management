import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';
import { TrendingUp, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface ReportData {
  period: string;
  stats: {
    total_revenue: number;
    average_sale: number;
    total_sales: number;
  };
  salesCount?: number;
  dailyBreakdown?: Array<{
    date: string;
    revenue: number;
    transactionCount: number;
  }>;
  paymentBreakdown?: Array<{
    name: string;
    value: number;
    total: number;
  }>;
  topProducts?: Array<{
    productName: string;
    quantity: number;
    revenue: number;
    transactionCount: number;
  }>;
  cashierPerformance?: Array<{
    userName: string;
    transactionCount: number;
    totalRevenue: number;
    averageSale: number;
  }>;
}

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#ea580c', '#8b5cf6', '#06b6d4'];

export const Reports = () => {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCustomRange, setShowCustomRange] = useState(false);

  const fetchReport = useCallback(async (type?: string, start?: string, end?: string) => {
    setLoading(true);
    try {
      const finalType = type || reportType;
      let url = `/reports/${finalType}`;
      
      if (finalType === 'custom-range' && start && end) {
        url = `/reports/custom-range?startDate=${start}&endDate=${end}`;
      } else if (finalType === 'daily') {
        if (start) url += `?date=${start}`;
      }
      
      const response = await api.get(url);
      setReportData(response.data.data);
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError.response?.data?.message || `Failed to fetch ${reportType} report`);
    } finally {
      setLoading(false);
    }
  }, [reportType]);

  useEffect(() => {
    fetchReport();
  }, [reportType, fetchReport]);

  const handleCustomRange = useCallback(() => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date must be before end date');
      return;
    }
    setReportType('weekly');
    fetchReport('custom-range', startDate, endDate);
  }, [startDate, endDate, fetchReport]);

  const getTransactionCount = useCallback(() => {
    if (reportData?.salesCount) return reportData.salesCount;
    if (reportData?.stats?.total_sales) return reportData.stats.total_sales;
    return 0;
  }, [reportData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
            <button
              onClick={() => {
                setShowCustomRange(false);
                setReportType('daily');
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                reportType === 'daily' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => {
                setShowCustomRange(false);
                setReportType('weekly');
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                reportType === 'weekly' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => {
                setShowCustomRange(false);
                setReportType('monthly');
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                reportType === 'monthly' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowCustomRange(!showCustomRange)}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Custom Range
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {showCustomRange && (
        <div className="bg-gradient-to-r from-blue-50 to-slate-50 p-6 rounded-xl border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button 
              onClick={handleCustomRange}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Generate Report
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="h-96 flex items-center justify-center bg-white rounded-xl border border-slate-100 shadow-sm text-slate-500">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Generating report...</p>
          </div>
        </div>
      ) : reportData ? (
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-md">
              <p className="text-sm font-medium opacity-90">Total Revenue</p>
              <p className="text-3xl font-bold mt-2">
                KES {(reportData?.stats?.total_revenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-md">
              <p className="text-sm font-medium opacity-90">Total Transactions</p>
              <p className="text-3xl font-bold mt-2">
                {getTransactionCount()}
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-md">
              <p className="text-sm font-medium opacity-90">Avg. Transaction Value</p>
              <p className="text-3xl font-bold mt-2">
                KES {Math.round(reportData?.stats?.average_sale || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-md">
              <p className="text-sm font-medium opacity-90">Period</p>
              <p className="text-xl font-bold mt-2">
                {reportData?.period}
              </p>
            </div>
          </div>

          {reportData?.dailyBreakdown && reportData.dailyBreakdown.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Revenue Trend</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={reportData.dailyBreakdown}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
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
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#2563eb" fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {reportData?.dailyBreakdown && reportData.dailyBreakdown.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Daily Transactions</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.dailyBreakdown}>
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
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="transactionCount" fill="#16a34a" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportData?.paymentBreakdown && reportData.paymentBreakdown.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Payment Methods</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.paymentBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {reportData.paymentBreakdown.map((_: unknown, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {reportData?.topProducts && reportData.topProducts.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Top Products</h2>
                <div className="space-y-3">
                  {reportData.topProducts.slice(0, 5).map((product, idx) => (
                    <div key={idx} className="flex items-between justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{product.productName}</p>
                        <p className="text-sm text-slate-500">{product.quantity} units sold</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">KES {product.revenue.toLocaleString()}</p>
                        <p className="text-sm text-slate-500">{product.transactionCount} transactions</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {reportData?.cashierPerformance && reportData.cashierPerformance.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Cashier Performance</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-medium text-slate-600">Cashier Name</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-600">Transactions</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-600">Total Revenue</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-600">Avg. Per Transaction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.cashierPerformance.map((cashier, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-900">{cashier.userName}</td>
                        <td className="py-3 px-4 text-slate-900">{cashier.transactionCount}</td>
                        <td className="py-3 px-4 font-medium text-green-600">KES {cashier.totalRevenue.toLocaleString()}</td>
                        <td className="py-3 px-4 text-slate-900">KES {Math.round(cashier.averageSale).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Performance Summary</h2>
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg text-blue-800 text-sm">
              <TrendingUp className="h-5 w-5 flex-shrink-0" />
              <div>
                <p>
                  <span className="font-bold">{reportData?.stats?.total_sales || 0} transactions</span> completed with an average value of <span className="font-bold">KES {Math.round(reportData?.stats?.average_sale || 0).toLocaleString()}</span> during the {reportData?.period?.toLowerCase()} period.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-96 flex items-center justify-center bg-white rounded-xl border border-slate-100 shadow-sm text-slate-500">
          No data available for this period
        </div>
      )}
    </div>
  );
};
