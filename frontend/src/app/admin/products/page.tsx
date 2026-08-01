"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { products as initialProducts } from "@/data/products";
import { formatKes } from "@/lib/format";

export default function AdminProductsPage() {
  const [products, setProducts] = useState(initialProducts);

  function handleDelete(id: string) {
    if (!confirm("Remove this product listing?")) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Products</h1>
        <button className="btn-gold !px-4 !py-2 text-sm">
          <Plus size={15} /> Add Product
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl2 border border-ink-900/10 bg-white dark:border-white/10 dark:bg-ink-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-900/10 bg-beige-50 text-xs uppercase tracking-wider text-ink-700/60 dark:border-white/10 dark:bg-ink-800 dark:text-beige-100/50">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-900/10 dark:divide-white/10">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="max-w-[220px] truncate px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-ink-700/70 dark:text-beige-100/60">{p.sku}</td>
                <td className="px-4 py-3 text-ink-700/70 dark:text-beige-100/60">{p.categoryName}</td>
                <td className="px-4 py-3">{formatKes(p.priceKes)}</td>
                <td className="px-4 py-3">
                  <span className={p.stockQuantity < 8 ? "font-medium text-red-500" : ""}>{p.stockQuantity}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${p.isAvailable ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                    {p.isAvailable ? "Active" : "Out of Stock"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="rounded-lg p-2 hover:bg-beige-100 dark:hover:bg-ink-700" aria-label="Edit">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" aria-label="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
