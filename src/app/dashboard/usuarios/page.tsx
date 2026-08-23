"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  Users,
  Plus,
  Shield,
  UserCheck,
  UserX,
  Trash2,
  Mail,
  User,
  Lock,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface UserProfile {
  id: number;
  nombre: string | null;
  email: string;
  rol: string;
  activo: boolean;
  creadoEn: string;
  ultimoLogin: string | null;
}

export default function UsuariosPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const currentUserId = session?.user?.id;

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // Form state
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "lectura",
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  // Fetch users
  const { data: users = [], isLoading } = useQuery<UserProfile[]>({
    queryKey: ["usuarios"],
    queryFn: async () => {
      const res = await fetch("/api/usuarios");
      if (!res.ok) throw new Error("Error fetching users");
      return res.json();
    },
  });

  const refetch = () => queryClient.invalidateQueries({ queryKey: ["usuarios"] });

  const handleOpenModal = () => {
    setErrorMsg(null);
    setForm({
      nombre: "",
      email: "",
      password: "",
      rol: "lectura",
    });
    setModalOpen(true);
  };

  const handleToggleStatus = async (user: UserProfile) => {
    if (currentUserId === user.id.toString()) {
      alert("No puedes desactivar tu propia cuenta.");
      return;
    }

    try {
      const res = await fetch(`/api/usuarios/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: user.nombre,
          rol: user.rol,
          activo: !user.activo,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Error al actualizar estado");
      } else {
        refetch();
      }
    } catch {
      alert("Error de red.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.rol) {
      setErrorMsg("Completa todos los campos obligatorios.");
      return;
    }

    setLoadingAction(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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

  const handleOpenDeleteConfirm = (id: number) => {
    if (currentUserId === id.toString()) {
      alert("No puedes eliminar tu propia cuenta.");
      return;
    }
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;

    setLoadingAction(true);

    try {
      const res = await fetch(`/api/usuarios/${deleteTargetId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Error al eliminar usuario");
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

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--color-primary)]">
            Gestión de Usuarios
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Administración de cuentas con permisos de administrador o solo lectura.
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 rounded-[var(--radius-custom)] bg-[var(--color-primary)] text-white px-4 py-2.5 text-sm font-bold shadow-md hover:bg-opacity-95 cursor-pointer transition-all self-start sm:self-center"
        >
          <Plus className="h-5 w-5" />
          Nuevo Usuario
        </button>
      </div>

      {/* Users DataTable */}
      <div className="flex-1 bg-white rounded-[var(--radius-custom)] shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[400px]">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent mb-4"></div>
            <p className="text-sm text-gray-500">Cargando usuarios...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Rol</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => {
                    const isSelf = currentUserId === u.id.toString();
                    return (
                      <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-[var(--color-text-custom)]">
                          <div className="flex items-center gap-2">
                            <span className="h-8 w-8 rounded-full bg-sky-50 flex items-center justify-center text-[var(--color-primary)] font-bold border border-sky-100">
                              {(u.nombre || u.email).slice(0, 2).toUpperCase()}
                            </span>
                            <span>{u.nombre || "Sin Nombre"} {isSelf && <span className="text-xs text-gray-400 font-semibold">(Tú)</span>}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                          {u.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {u.rol === "admin" ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2.5 py-1 text-xs font-bold text-[var(--color-primary)] border border-sky-100">
                              <Shield className="h-3.5 w-3.5" />
                              Administrador
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2.5 py-1 text-xs font-bold text-gray-500 border border-gray-100">
                              Solo Lectura
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            disabled={isSelf}
                            onClick={() => handleToggleStatus(u)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${
                              isSelf ? "cursor-not-allowed opacity-80" : "cursor-pointer hover:opacity-90"
                            } ${
                              u.activo
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-red-50 text-red-600 border-red-100"
                            }`}
                          >
                            {u.activo ? (
                              <>
                                <UserCheck className="h-3.5 w-3.5" /> Activo
                              </>
                            ) : (
                              <>
                                <UserX className="h-3.5 w-3.5" /> Suspendido
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            disabled={isSelf}
                            onClick={() => handleOpenDeleteConfirm(u.id)}
                            className={`p-1.5 rounded transition-all ${
                              isSelf
                                ? "text-gray-200 cursor-not-allowed"
                                : "text-gray-400 hover:text-red-500 hover:bg-red-50 cursor-pointer"
                            }`}
                            title={isSelf ? "No puedes eliminarte a ti mismo" : "Eliminar Usuario"}
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile List View */}
            <div className="md:hidden divide-y divide-gray-100">
              {users.map((u) => {
                const isSelf = currentUserId === u.id.toString();
                return (
                  <div key={u.id} className="p-5 space-y-3 hover:bg-gray-50/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="h-8 w-8 rounded-full bg-sky-50 flex items-center justify-center text-[var(--color-primary)] font-bold border border-sky-100">
                          {(u.nombre || u.email).slice(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <h3 className="font-bold text-gray-800 text-sm">
                            {u.nombre || "Sin Nombre"} {isSelf && <span className="text-xs text-gray-400 font-semibold">(Tú)</span>}
                          </h3>
                          <span className="text-xs text-gray-400">{u.email}</span>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                          u.rol === "admin"
                            ? "bg-sky-50 text-[var(--color-primary)] border-sky-100"
                            : "bg-gray-50 text-gray-500 border-gray-100"
                        }`}
                      >
                        {u.rol === "admin" ? "Admin" : "Lectura"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <button
                        disabled={isSelf}
                        onClick={() => handleToggleStatus(u)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          isSelf ? "cursor-not-allowed opacity-80" : "cursor-pointer"
                        } ${
                          u.activo
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-red-50 text-red-600 border-red-100"
                        }`}
                      >
                        {u.activo ? "Activo" : "Suspendido"}
                      </button>

                      {!isSelf && (
                        <button
                          onClick={() => handleOpenDeleteConfirm(u.id)}
                          className="inline-flex items-center gap-1 text-xs text-red-500 font-bold cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" /> Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* User Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-[var(--radius-custom)] shadow-2xl overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="bg-[var(--color-primary)] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-white" style={{ color: '#ffffff' }}>Crear Nuevo Usuario</h3>
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
                <label className="block text-xs font-bold text-gray-500 uppercase">Nombre Completo</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-4.5 w-4.5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="block w-full rounded-[var(--radius-custom)] border border-gray-300 py-2.5 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                    placeholder="E.g. Dr. Marcelo Pérez"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Email *</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-4.5 w-4.5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="block w-full rounded-[var(--radius-custom)] border border-gray-300 py-2.5 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                    placeholder="E.g. marcelo@perezgiugovaz.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Contraseña *</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4.5 w-4.5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="block w-full rounded-[var(--radius-custom)] border border-gray-300 py-2.5 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Rol *</label>
                <select
                  value={form.rol}
                  onChange={(e) => setForm({ ...form, rol: e.target.value })}
                  className="mt-1 block w-full rounded-[var(--radius-custom)] border border-gray-300 py-2.5 px-3 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] bg-white"
                >
                  <option value="lectura">Solo Lectura (Ver leads, cursos, productos)</option>
                  <option value="admin">Administrador (Control total y CRUDs)</option>
                </select>
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
                  Crear Usuario
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
                  ¿Eliminar usuario?
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Esta acción no se puede deshacer.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              Se revocará el acceso permanentemente de esta cuenta y ya no podrá ingresar al panel.
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
