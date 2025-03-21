import { useState, useEffect } from 'react';
import { getSales, createSale, updateSale, deleteSale, type Sale } from '../services/salesService';

export default function SalesManagement() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [editingSale, setEditingSale] = useState<Partial<Sale> | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const response = await getSales();
      setSales(response.sales);
    } catch (error) {
      console.error('Error loading sales:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isCreating && editingSale) {
        await createSale(editingSale as Omit<Sale, 'id'>);
      } else if (editingSale?.id) {
        await updateSale(editingSale.id, editingSale);
      }
      setEditingSale(null);
      setIsCreating(false);
      loadSales();
    } catch (error) {
      console.error('Error saving sale:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta venta?')) {
      try {
        await deleteSale(id);
        loadSales();
      } catch (error) {
        console.error('Error deleting sale:', error);
      }
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Ventas</h1>
      
      <button
        onClick={() => {
          setIsCreating(true);
          setEditingSale({});
        }}
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Nueva Venta
      </button>

      {(editingSale !== null || isCreating) && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded">
          <div className="grid grid-cols-1 gap-4">
            <input
              type="text"
              placeholder="Cliente"
              value={editingSale?.client || ''}
              onChange={e => setEditingSale(prev => ({ ...prev, client: e.target.value }))}
              className="border rounded p-2"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Monto Total"
              value={editingSale?.total_amount || ''}
              onChange={e => setEditingSale(prev => ({ ...prev, total_amount: parseFloat(e.target.value) }))}
              className="border rounded p-2"
              required
            />
            <input
              type="date"
              value={editingSale?.sale_date || ''}
              onChange={e => setEditingSale(prev => ({ ...prev, sale_date: e.target.value }))}
              className="border rounded p-2"
              required
            />
            <input
              type="number"
              placeholder="ID de Usuario"
              value={editingSale?.user_id || ''}
              onChange={e => setEditingSale(prev => ({ ...prev, user_id: parseInt(e.target.value) }))}
              className="border rounded p-2"
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                {isCreating ? 'Crear' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingSale(null);
                  setIsCreating(false);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Cliente</th>
              <th className="px-4 py-2">Monto Total</th>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Usuario ID</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(sale => (
              <tr key={sale.id} className="border-b">
                <td className="px-4 py-2">{sale.id}</td>
                <td className="px-4 py-2">{sale.client}</td>
                <td className="px-4 py-2">${sale.total_amount.toFixed(2)}</td>
                <td className="px-4 py-2">{sale.sale_date}</td>
                <td className="px-4 py-2">{sale.user_id}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => setEditingSale(sale)}
                    className="mr-2 bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(sale.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}