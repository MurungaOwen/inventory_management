import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { type Sale, type User } from '@/types';
import { Search, Eye, Calendar, User as UserIcon, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';

export const Sales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cashiers, setCashiers] = useState<Map<string, string>>(new Map());

  const fetchData = async () => {
    try {
      const [salesRes, usersRes] = await Promise.all([
        api.get('/sales'),
        api.get('/users'),
      ]);

      setSales(salesRes.data.data);
      
      const cashierMap = new Map<string, string>(
        usersRes.data.data.map((u: User) => [u.id, u.fullName])
      );
      setCashiers(cashierMap);
    } catch (error) {
      toast.error('Failed to fetch sales history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredSales = sales.filter(
    (sale) =>
      sale.saleNumber.toLowerCase().includes(search.toLowerCase()) ||
      cashiers.get(sale.cashierId)?.toLowerCase().includes(search.toLowerCase())
  );

  const openSaleDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Sales History</h1>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <Search className="h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by sale number or cashier..."
          className="flex-1 bg-transparent outline-none text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Sale Number</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Cashier</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Loading sales history...
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No sales found
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{sale.saleNumber}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {format(new Date(sale.createdAt), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {cashiers.get(sale.cashierId) || 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        sale.paymentMethod === 'Cash' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      KES {sale.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openSaleDetails(sale)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Sale Details - ${selectedSale?.saleNumber}`}
      >
        {selectedSale && (
          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-slate-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Date
                </p>
                <p className="font-medium">{format(new Date(selectedSale.createdAt), 'PPP p')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 flex items-center gap-1">
                  <UserIcon className="h-3 w-3" /> Cashier
                </p>
                <p className="font-medium">{cashiers.get(selectedSale.cashierId) || 'Unknown'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 flex items-center gap-1">
                  <CreditCard className="h-3 w-3" /> Payment
                </p>
                <p className="font-medium">{selectedSale.paymentMethod}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <p className="text-sm font-bold text-slate-900 mb-3">Items</p>
              <div className="space-y-3">
                {selectedSale.items?.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium text-slate-900">Product ID: {item.productId.slice(0, 8)}...</p>
                      <p className="text-slate-500">
                        {item.quantity} x KES {item.unitPrice.toLocaleString()}
                      </p>
                    </div>
                    <p className="font-bold text-slate-900">
                      KES {item.subtotal.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
              <span className="text-slate-900 font-bold">Total Amount</span>
              <span className="text-xl font-bold text-blue-600">
                KES {selectedSale.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
