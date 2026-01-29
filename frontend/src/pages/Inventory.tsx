import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { type InventoryItem, type Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Search, ArrowUpCircle, ArrowDownCircle, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

interface InventoryWithProduct extends InventoryItem {
  productName: string;
  sku: string;
}

export const Inventory = () => {
  const [inventory, setInventory] = useState<InventoryWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryWithProduct | null>(null);
  
  const [adjustData, setAdjustData] = useState({
    quantity: '',
    type: 'in' as 'in' | 'out',
  });
  const [thresholdData, setThresholdData] = useState({
    threshold: '',
  });

  const fetchData = async () => {
    try {
      const [inventoryRes, productsRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/products'),
      ]);

      const productsMap = new Map<string, Product>(
        productsRes.data.data.map((p: Product) => [p.id, p])
      );

      const combined = inventoryRes.data.data.map((item: InventoryItem) => {
        const product = productsMap.get(item.productId);
        return {
          ...item,
          productName: product?.name || 'Unknown Product',
          sku: product?.sku || 'N/A',
        };
      });

      setInventory(combined);
    } catch (error) {
      toast.error('Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      await api.post('/inventory/adjust', {
        productId: selectedItem.productId,
        quantity: Number(adjustData.quantity),
        type: adjustData.type,
      });
      toast.success('Stock adjusted successfully');
      setIsAdjustModalOpen(false);
      fetchData();
      setAdjustData({ quantity: '', type: 'in' });
    } catch (error) {
      toast.error('Failed to adjust stock');
    }
  };

  const handleUpdateThreshold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      await api.put('/inventory/threshold', {
        productId: selectedItem.productId,
        threshold: Number(thresholdData.threshold),
      });
      toast.success('Threshold updated successfully');
      setIsThresholdModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to update threshold');
    }
  };

  const filteredInventory = inventory.filter(
    (item) =>
      item.productName.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <Search className="h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by product name or SKU..."
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
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Current Stock</th>
                <th className="px-6 py-4">Threshold</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Loading inventory...
                  </td>
                </tr>
              ) : filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No inventory items found
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{item.productName}</td>
                    <td className="px-6 py-4 text-slate-500">{item.sku}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{item.currentStock}</td>
                    <td className="px-6 py-4 text-slate-500">{item.reorderThreshold}</td>
                    <td className="px-6 py-4">
                      {item.currentStock <= item.reorderThreshold ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedItem(item);
                            setAdjustData({ quantity: '', type: 'in' });
                            setIsAdjustModalOpen(true);
                          }}
                        >
                          Adjust Stock
                        </Button>
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setThresholdData({ threshold: String(item.reorderThreshold) });
                            setIsThresholdModalOpen(true);
                          }}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                          title="Set Threshold"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title={`Adjust Stock - ${selectedItem?.productName}`}
      >
        <form onSubmit={handleAdjustStock} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                adjustData.type === 'in'
                  ? 'border-green-500 bg-green-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => setAdjustData({ ...adjustData, type: 'in' })}
            >
              <div className="flex flex-col items-center gap-2">
                <ArrowUpCircle className={`h-6 w-6 ${adjustData.type === 'in' ? 'text-green-600' : 'text-slate-400'}`} />
                <span className={`font-medium ${adjustData.type === 'in' ? 'text-green-700' : 'text-slate-600'}`}>Stock In</span>
              </div>
            </div>
            <div
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                adjustData.type === 'out'
                  ? 'border-red-500 bg-red-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => setAdjustData({ ...adjustData, type: 'out' })}
            >
              <div className="flex flex-col items-center gap-2">
                <ArrowDownCircle className={`h-6 w-6 ${adjustData.type === 'out' ? 'text-red-600' : 'text-slate-400'}`} />
                <span className={`font-medium ${adjustData.type === 'out' ? 'text-red-700' : 'text-slate-600'}`}>Stock Out</span>
              </div>
            </div>
          </div>

          <Input
            label="Quantity"
            type="number"
            min="1"
            value={adjustData.quantity}
            onChange={(e) => setAdjustData({ ...adjustData, quantity: e.target.value })}
            required
            autoFocus
          />

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsAdjustModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Confirm Adjustment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Threshold Modal */}
      <Modal
        isOpen={isThresholdModalOpen}
        onClose={() => setIsThresholdModalOpen(false)}
        title={`Set Reorder Threshold - ${selectedItem?.productName}`}
      >
        <form onSubmit={handleUpdateThreshold} className="space-y-4 mt-4">
          <Input
            label="Reorder Threshold"
            type="number"
            min="0"
            value={thresholdData.threshold}
            onChange={(e) => setThresholdData({ ...thresholdData, threshold: e.target.value })}
            required
            autoFocus
          />
          <p className="text-sm text-slate-500">
            You will be notified when stock falls below this level.
          </p>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsThresholdModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Update Threshold
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
