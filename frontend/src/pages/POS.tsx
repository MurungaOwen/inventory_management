import { useEffect, useState, useMemo } from 'react';
import api from '@/lib/api';
import { type InventoryItem, type Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductWithStock extends Product {
  currentStock: number;
}

interface CartItem extends ProductWithStock {
  quantity: number;
}

export const POS = () => {
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Mobile Money'>('Cash');
  const [processing, setProcessing] = useState(false);

  const fetchData = async () => {
    try {
      const [productsRes, inventoryRes] = await Promise.all([
        api.get('/products'),
        api.get('/inventory'),
      ]);

      const inventoryMap = new Map<string, number>(
        inventoryRes.data.data.map((i: InventoryItem) => [i.productId, i.currentStock])
      );

      const productsWithStock = productsRes.data.data.map((p: Product) => ({
        ...p,
        currentStock: inventoryMap.get(p.id) || 0,
      }));

      setProducts(productsWithStock);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addToCart = (product: ProductWithStock) => {
    if (product.currentStock <= 0) {
      toast.error('Product is out of stock');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.currentStock) {
          toast.error('Not enough stock available');
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.id === productId) {
          const newQuantity = item.quantity + delta;
          if (newQuantity <= 0) return item;
          if (newQuantity > item.currentStock) {
            toast.error('Not enough stock available');
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
  }, [cart]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setProcessing(true);

    try {
      const payload = {
        paymentMethod,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.sellingPrice,
        })),
      };

      await api.post('/sales', payload);
      toast.success('Sale completed successfully');
      setCart([]);
      setIsPaymentModalOpen(false);
      fetchData(); // Refresh stock
    } catch (error) {
      toast.error('Failed to process sale');
    } finally {
      setProcessing(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-theme(spacing.32))] flex gap-6">
      {/* Product List */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            className="flex-1 bg-transparent outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-500">
              Loading products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-500">
              No products found
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={product.currentStock <= 0}
                  className="flex flex-col items-start p-4 rounded-lg border border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-full flex justify-between items-start mb-2">
                    <span className="font-medium text-slate-900 line-clamp-2">{product.name}</span>
                    <span className="text-xs font-mono text-slate-400">{product.sku}</span>
                  </div>
                  <div className="mt-auto w-full">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-blue-600">
                        KES {product.sellingPrice.toLocaleString()}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          product.currentStock > 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {product.currentStock} left
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart */}
      <div className="w-96 flex flex-col bg-white rounded-xl shadow-sm border border-slate-100 h-full">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-slate-900" />
            <h2 className="font-bold text-slate-900">Current Sale</h2>
          </div>
          <span className="text-sm text-slate-500">{cart.length} items</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
              <ShoppingCart className="h-12 w-12 opacity-20" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 line-clamp-1">{item.name}</p>
                  <p className="text-xs text-slate-500">
                    KES {item.sellingPrice.toLocaleString()} x {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-500"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-500"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 hover:bg-red-50 rounded text-red-500 ml-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-500">Total Amount</span>
            <span className="text-2xl font-bold text-slate-900">
              KES {cartTotal.toLocaleString()}
            </span>
          </div>
          <Button
            className="w-full"
            size="lg"
            disabled={cart.length === 0}
            onClick={() => setIsPaymentModalOpen(true)}
          >
            Proceed to Payment
          </Button>
        </div>
      </div>

      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Payment"
      >
        <div className="space-y-6 mt-4">
          <div className="text-center">
            <p className="text-sm text-slate-500">Total Amount to Pay</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">
              KES {cartTotal.toLocaleString()}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setPaymentMethod('Cash')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                paymentMethod === 'Cash'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <Banknote className="h-8 w-8" />
              <span className="font-medium">Cash</span>
            </button>
            <button
              onClick={() => setPaymentMethod('Mobile Money')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                paymentMethod === 'Mobile Money'
                  ? 'border-green-600 bg-green-50 text-green-700'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <CreditCard className="h-8 w-8" />
              <span className="font-medium">M-Pesa</span>
            </button>
          </div>

          <Button
            className="w-full"
            size="lg"
            isLoading={processing}
            onClick={handleCheckout}
          >
            Complete Sale
          </Button>
        </div>
      </Modal>
    </div>
  );
};
