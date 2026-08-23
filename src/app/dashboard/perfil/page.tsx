"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  User,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Mail,
  Shield,
  Calendar,
} from "lucide-react";

export default function PerfilPage() {
  const { data: session } = useSession();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg("Completa todos los campos.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("La nueva contraseña y su confirmación no coinciden.");
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMsg("La nueva contraseña debe ser diferente a la actual.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Ocurrió un error al cambiar la contraseña.");
      } else {
        setSuccessMsg("¡Contraseña actualizada con éxito!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setErrorMsg("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-[var(--color-primary)]">
          Mi Cuenta
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Visualiza tu perfil de acceso y actualiza tu contraseña de seguridad.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-[var(--radius-custom)] shadow-sm border border-gray-100 space-y-6">
          <div className="flex flex-col items-center text-center">
            <span className="h-20 w-20 rounded-full bg-sky-50 flex items-center justify-center text-[var(--color-primary)] text-3xl font-bold border border-sky-100 shadow-inner">
              {(session?.user?.name || session?.user?.email || "U").slice(0, 2).toUpperCase()}
            </span>
            <h2 className="mt-4 text-xl font-bold text-[var(--color-text-custom)]">
              {session?.user?.name || "Administrador"}
            </h2>
            <p className="text-sm text-gray-400">Panel de Control de Acceso</p>
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-4">
            <div className="flex items-center text-sm text-gray-600 gap-3">
              <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <div className="truncate">
                <span className="text-[10px] font-bold text-gray-400 block uppercase">Email</span>
                <span className="font-semibold text-gray-700 truncate">{session?.user?.email}</span>
              </div>
            </div>

            <div className="flex items-center text-sm text-gray-600 gap-3">
              <Shield className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-gray-400 block uppercase">Nivel de Acceso</span>
                <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-0.5 text-xs font-bold text-[var(--color-primary)] border border-sky-100 mt-0.5">
                  {session?.user?.role === "admin" ? "Administrador" : "Solo Lectura"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[var(--radius-custom)] shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-[var(--color-text-custom)] mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5 text-[var(--color-primary)]" />
            Cambiar Contraseña
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700 border border-emerald-100 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase">Contraseña Actual *</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full rounded-[var(--radius-custom)] border border-gray-300 px-3 py-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                placeholder="••••••••"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Nueva Contraseña *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full rounded-[var(--radius-custom)] border border-gray-300 px-3 py-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Confirmar Nueva Contraseña *</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full rounded-[var(--radius-custom)] border border-gray-300 px-3 py-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  placeholder="Mismo valor que el campo anterior"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-custom)] bg-[var(--color-primary)] text-white px-5 py-3 text-sm font-bold shadow-md hover:bg-opacity-90 disabled:bg-gray-400 cursor-pointer transition-all"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Guardar Nueva Contraseña"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
