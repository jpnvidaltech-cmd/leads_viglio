"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  FileCode,
  Plus,
  Edit2,
  Trash2,
  Search,
  Tag,
  DollarSign,
  Info,
  X,
  AlertCircle,
  Loader2,
  Filter,
} from "lucide-react";

interface CatalogItem {
  id: number;
  producto: string | null;
  precioActual: number | string | null;
  precioOriginal: number | string | null;
  moneda: string | null;
  enOferta: boolean;
  gratis: boolean;
  notas: string | null;
}

export default function CatalogoDigitalPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const isAdmin = session?.user?.role === "admin";

  const [search, setSearch] = useState("");
  const [filterOferta, setFilterOferta] = useState(false);
  const [filterGratis, setFilterGratis] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // Form state
  const [form, setForm] = useState({
    producto: "",
    precioActual: "",
    precioOriginal: "",
    moneda: "USD",
    enOferta: false,
    gratis: false,
    notas: "",
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  // Fetch catalog elements
  const { data: items = [], isLoading } = useQuery<CatalogItem[]>({
    queryKey: ["catalogo-digital"],
    queryFn: async () => {
      const res = await fetch("/api/catalogo-digital");
      if (!res.ok) throw new Error("Error fetching digital catalog");
      return res.json();
    },
  });

  const refetch = () => queryClient.invalidateQueries({ queryKey: ["catalogo-digital"] });

  const handleOpenModal = (item?: CatalogItem) => {
    setErrorMsg(null);
    if (item) {
      setEditingItem(item);
      setForm({
        producto: item.producto || "",
        precioActual: item.precioActual ? item.precioActual.toString() : "",
        precioOriginal: item.precioOriginal ? item.precioOriginal.toString() : "",
        moneda: item.moneda || "USD",
        enOferta: item.enOferta || false,
        gratis: item.gratis || false,
        notas: item.notas || "",
      });
    } else {
      setEditingItem(null);
      setForm({
        producto: "",
        precioActual: "",
        precioOriginal: "",
        moneda: "USD",
        enOferta: false,
        gratis: false,
        notas: "",
      });
    }
    setModalOpen(true);
  };

  const handleOpenDeleteConfirm = (id: number) => {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.producto) {
      setErrorMsg("El nombre del archivo/producto es obligatorio.");
      return;
    }

    setLoadingAction(true);
    setErrorMsg(null);

    // Si es gratis, forzar los precios correspondientes a 0 o vacíos
    const payload = {
      ...form,
      precioActual: form.gratis ? "0" : form.precioActual,
      precioOriginal: form.gratis ? "0" : form.precioOriginal,
    };

    try {
      const url = editingItem ? `/api/catalogo-digital/${editingItem.id}` : "/api/catalogo-digital";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Ocurrió un error inesperado");
      } else {
        refetch();
        setModalOpen(false);
      }
    } catch {
      setErrorMsg("Error al conectar con el servidor.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;

    setLoadingAction(true);

    try {
      const res = await fetch(`/api/catalogo-digital/${deleteTargetId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Error al eliminar");
      } else {
        refetch();
        setDeleteConfirmOpen(false);
        setDeleteTargetId(null);
      }
    } catch {
      alert("Error de red.");
    } finally {
      setLoadingAction(false);
    }
  };

  // Filter items based on search and checkbox selections
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.producto?.toLowerCase().includes(search.toLowerCase());
    const matchesOferta = !filterOferta || item.enOferta;
    const matchesGratis = !filterGratis || item.gratis;
    return matchesSearch && matchesOferta && matchesGratis;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--color-primary)]">
            Librería Digital STL
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestión del catálogo de archivos STL, aditamentos clínicos y recursos 3D descargables.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 rounded-[var(--radius-custom)] bg-[var(--color-primary)] text-white px-4 py-2.5 text-sm font-bold shadow-md hover:bg-opacity-95 cursor-pointer transition-all self-start sm:self-center"
          >
            <Plus className="h-5 w-5" />
            Nuevo Recurso STL
          </button>
        )}
      </div>

      {/* Filters and Search controls */}
      <div className="bg-white p-4 rounded-[var(--radius-custom)] shadow-sm border border-gray-100 mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar recursos STL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-[var(--radius-custom)] border border-gray-300 py-2.5 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          />
        </div>

        {/* Quick Toggles */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-bold text-gray-400 uppercase">Filtros:</span>
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filterOferta}
              onChange={(e) => setFilterOferta(e.target.checked)}
              className="rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)] h-4 w-4 border-gray-300 cursor-pointer"
            />
            <span className="text-sm font-semibold text-gray-600">En Oferta</span>
          </label>

          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filterGratis}
              onChange={(e) => setFilterGratis(e.target.checked)}
              className="rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)] h-4 w-4 border-gray-300 cursor-pointer"
            />
            <span className="text-sm font-semibold text-gray-600">Descarga Gratis</span>
          </label>
        </div>
      </div>

      {/* Main List */}
      <div className="flex-1 bg-white rounded-[var(--radius-custom)] shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[400px]">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent mb-4"></div>
            <p className="text-sm text-gray-500">Cargando librería STL...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
            <FileCode className="h-12 w-12 mb-2 stroke-[1.5]" />
            <p className="text-sm">No se encontraron archivos en la librería.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Archivo / Modelo</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Moneda</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Precio Actual</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Precio Original</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Notas</th>
                    {isAdmin && <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-[var(--color-text-custom)]">
                        {item.producto}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-500">
                        {item.gratis ? "-" : item.moneda || "USD"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                        {item.gratis ? (
                          <span className="text-emerald-600 font-extrabold">Gratis</span>
                        ) : (
                          `${item.precioActual || 0}`
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 line-through">
                        {!item.gratis && item.enOferta && item.precioOriginal ? `${item.precioOriginal}` : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.gratis ? (
                          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-100">
                            Descarga Libre
                          </span>
                        ) : item.enOferta ? (
                          <span className="inline-flex items-center rounded-md bg-sky-50 px-2.5 py-1 text-xs font-bold text-[var(--color-primary)] border border-sky-100">
                            En Oferta
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-0.5 text-xs font-bold text-gray-600 border border-gray-100">
                            Estándar
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate">
                        {item.notas || "-"}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="p-1.5 text-gray-400 hover:text-[var(--color-primary)] hover:bg-sky-50 rounded-lg transition-all cursor-pointer mr-1"
                            title="Editar Elemento"
                          >
                            <Edit2 className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteConfirm(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                            title="Eliminar Elemento"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredItems.map((item) => (
                <div key={item.id} className="p-5 space-y-2 hover:bg-gray-50/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-800 text-base">{item.producto}</h3>
                    <div className="text-right">
                      {item.gratis ? (
                        <span className="text-emerald-600 font-extrabold text-sm">Gratis</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-gray-800">
                            {item.moneda} {item.precioActual}
                          </span>
                          {item.enOferta && item.precioOriginal && (
                            <span className="text-xs text-gray-400 line-through">
                              {item.precioOriginal}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {item.notas && <p className="text-xs text-gray-500 line-clamp-2">{item.notas}</p>}
                  <div className="flex items-center justify-between pt-2">
                    {item.gratis ? (
                      <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100">
                        Descarga Libre
                      </span>
                    ) : item.enOferta ? (
                      <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-1 text-[10px] font-bold text-[var(--color-primary)] border border-sky-100">
                        En Oferta
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-600 border border-gray-100">
                        Catálogo
                      </span>
                    )}

                    {isAdmin && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="inline-flex items-center gap-1 text-xs text-[var(--color-primary)] font-bold cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" /> Editar
                        </button>
                        <button
                          onClick={() => handleOpenDeleteConfirm(item.id)}
                          className="inline-flex items-center gap-1 text-xs text-red-500 font-bold cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Catalog Item Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-[var(--radius-custom)] shadow-2xl overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="bg-[var(--color-primary)] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-white" style={{ color: '#ffffff' }}>
                {editingItem ? "Editar Recurso STL" : "Agregar Recurso STL"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-white hover:text-sky-200 cursor-pointer">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-600 border border-rose-100">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Nombre / Archivo STL *</label>
                <input
                  type="text"
                  required
                  value={form.producto}
                  onChange={(e) => setForm({ ...form, producto: e.target.value })}
                  className="mt-1 block w-full rounded-[var(--radius-custom)] border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  placeholder="E.g. Modelo Mandíbula STL para Práctica"
                />
              </div>

              {/* Toggles: Gratis / Oferta */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-[var(--radius-custom)] border border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.gratis}
                    onChange={(e) => setForm({ ...form, gratis: e.target.checked })}
                    className="rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)] h-4 w-4 border-gray-300 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-gray-600 uppercase">Gratis</span>
                </label>

                {!form.gratis && (
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.enOferta}
                      onChange={(e) => setForm({ ...form, enOferta: e.target.checked })}
                      className="rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)] h-4 w-4 border-gray-300 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-gray-600 uppercase">En Oferta</span>
                  </label>
                )}
              </div>

              {/* Pricing section (Hidden if gratis) */}
              {!form.gratis && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase">Moneda</label>
                      <select
                        value={form.moneda}
                        onChange={(e) => setForm({ ...form, moneda: e.target.value })}
                        className="mt-1 block w-full rounded-[var(--radius-custom)] border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] bg-white"
                      >
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                        <option value="ARS">ARS</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase">Precio Actual</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.precioActual}
                        onChange={(e) => setForm({ ...form, precioActual: e.target.value })}
                        className="mt-1 block w-full rounded-[var(--radius-custom)] border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase disabled:opacity-50">Precio Orig.</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        disabled={!form.enOferta}
                        value={form.precioOriginal}
                        onChange={(e) => setForm({ ...form, precioOriginal: e.target.value })}
                        className="mt-1 block w-full rounded-[var(--radius-custom)] border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Notas / Detalles</label>
                <textarea
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                  rows={2}
                  className="mt-1 block w-full rounded-[var(--radius-custom)] border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  placeholder="E.g. Archivo en formato ZIP, incluye 3 variantes de modelo..."
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-[var(--radius-custom)] border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="inline-flex items-center gap-1 rounded-[var(--radius-custom)] bg-[var(--color-primary)] text-white px-4 py-2 text-sm font-bold hover:bg-opacity-90 disabled:bg-gray-400 cursor-pointer"
                >
                  {loadingAction && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingItem ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setDeleteConfirmOpen(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-[var(--radius-custom)] shadow-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <AlertCircle className="h-8 w-8 flex-shrink-0" />
              <div>
                <h3 className="font-extrabold text-lg leading-tight text-gray-800">
                  ¿Confirmar eliminación?
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Esta acción no se puede deshacer.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              Se eliminará permanentemente esta pieza del catálogo digital 3D.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="rounded-[var(--radius-custom)] border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={loadingAction}
                className="inline-flex items-center gap-1 rounded-[var(--radius-custom)] bg-red-600 text-white px-4 py-2 text-sm font-bold hover:bg-red-700 disabled:bg-gray-400 cursor-pointer animate-pulse"
              >
                {loadingAction && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
