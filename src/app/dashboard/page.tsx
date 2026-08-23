"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Filter,
  Instagram,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  MessageSquare,
  Phone,
  Bookmark,
  Calendar,
  X,
  Eye,
} from "lucide-react";

interface Lead {
  id: number;
  channel: string;
  contactName: string;
  phone: string;
  telegramId: string;
  instagramId: string;
  categoriaInteres: string;
  detalleInteres: string;
  requiereFollowup: boolean;
  resumenEjecutivo: string;
  fechaMensaje: string;
  horaMensaje: string;
  cantidadMensajes: number;
  conversationId: string;
}

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("all");
  const [requiresFollowUp, setRequiresFollowUp] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Fetch leads using React Query
  const { data: leads = [], isLoading, error } = useQuery<Lead[]>({
    queryKey: ["leads", channel, requiresFollowUp, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (channel !== "all") params.append("channel", channel);
      if (requiresFollowUp !== "all") params.append("requiresFollowUp", requiresFollowUp);
      if (search) params.append("search", search);

      const res = await fetch(`/api/leads?${params.toString()}`);
      if (!res.ok) throw new Error("Error fetching leads");
      return res.json();
    },
  });

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "";
    // timeString is like "1970-01-01T15:30:00.000Z" or similar due to Postgres TIME mapping
    try {
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
      }
      // fallback if it's already a clean string "15:30:00"
      return timeString.split(".")[0].slice(0, 5);
    } catch {
      return timeString;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC"
      });
    } catch {
      return dateString;
    }
  };

  // Métricas del Dashboard calculadas dinámicamente sobre los leads actuales
  const totalLeads = leads.length;

  const canalStats = leads.reduce(
    (acc, lead) => {
      const channel = (lead.channel || "").toLowerCase();
      if (channel === "instagram") {
        acc.instagram += 1;
      } else if (channel === "telegram") {
        acc.telegram += 1;
      } else {
        acc.otros += 1;
      }
      return acc;
    },
    { instagram: 0, telegram: 0, otros: 0 }
  );

  const categoriaStats = leads.reduce(
    (acc, lead) => {
      const cat = (lead.categoriaInteres || "").toLowerCase().trim();
      if (cat.includes("curso")) {
        acc.curso += 1;
      } else if (cat.includes("servicio") || cat.includes("clinico") || cat.includes("clínico")) {
        acc.servicio_clinico += 1;
      } else if (cat.includes("producto") || cat.includes("equipo")) {
        acc.productos_equipos += 1;
      } else if (cat.includes("perfil") || cat.includes("doctor") || cat.includes("empresa")) {
        acc.perfil_doctor_empresa += 1;
      } else if (cat.includes("turno") || cat.includes("consulta")) {
        acc.turno_consulta += 1;
      } else {
        acc.otro += 1;
      }
      return acc;
    },
    { curso: 0, servicio_clinico: 0, productos_equipos: 0, perfil_doctor_empresa: 0, turno_consulta: 0, otro: 0 }
  );

  const trackingStats = leads.reduce(
    (acc, lead) => {
      if (lead.requiereFollowup) {
        acc.atencion += 1;
      } else {
        acc.alDia += 1;
      }
      return acc;
    },
    { atencion: 0, alDia: 0 }
  );

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-[var(--color-primary)]">
          Seguimiento de Leads
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Registro histórico de contactos e interés recopilados por el Agente de IA.
        </p>
      </div>

      {/* Dashboard de Métricas Analíticas */}
      {!isLoading && !error && leads.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Card 1: Canales de Entrada */}
          <div className="bg-white p-5 rounded-[var(--radius-custom)] shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <h3 className="text-xs font-bold text-[var(--color-muted-custom)] uppercase tracking-wider mb-3">Canales de Entrada</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-extrabold text-[var(--color-primary)]">{totalLeads}</span>
                <span className="text-xs text-gray-500 font-medium">leads registrados</span>
              </div>
              
              {/* Barra segmentada */}
              <div className="h-3.5 w-full rounded-full bg-gray-100 overflow-hidden flex mb-4 border border-gray-50">
                {canalStats.instagram > 0 && (
                  <div 
                    className="bg-gradient-to-r from-rose-500 to-purple-600 transition-all duration-500" 
                    style={{ width: `${(canalStats.instagram / totalLeads) * 100}%` }}
                    title={`Instagram: ${canalStats.instagram}`}
                  />
                )}
                {canalStats.telegram > 0 && (
                  <div 
                    className="bg-sky-500 transition-all duration-500" 
                    style={{ width: `${(canalStats.telegram / totalLeads) * 100}%` }}
                    title={`Telegram: ${canalStats.telegram}`}
                  />
                )}
                {canalStats.otros > 0 && (
                  <div 
                    className="bg-gray-300 transition-all duration-500" 
                    style={{ width: `${(canalStats.otros / totalLeads) * 100}%` }}
                    title={`Otros: ${canalStats.otros}`}
                  />
                )}
              </div>
            </div>
            
            {/* Leyenda */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-50">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span className="text-gray-600 font-semibold">Instagram:</span>
                <span className="font-extrabold text-gray-800">{canalStats.instagram}</span>
                <span className="text-[10px] text-gray-400 font-medium">({Math.round((canalStats.instagram / totalLeads) * 100)}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                <span className="text-gray-600 font-semibold">Telegram:</span>
                <span className="font-extrabold text-gray-800">{canalStats.telegram}</span>
                <span className="text-[10px] text-gray-400 font-medium">({Math.round((canalStats.telegram / totalLeads) * 100)}%)</span>
              </div>
            </div>
          </div>

          {/* Card 2: Categorías de Interés */}
          <div className="bg-white p-5 rounded-[var(--radius-custom)] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h3 className="text-xs font-bold text-[var(--color-muted-custom)] uppercase tracking-wider mb-3">Categorías de Interés</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {[
                { label: "Cursos", key: "curso" },
                { label: "Servicios Clínicos", key: "servicio_clinico" },
                { label: "Equipos y Prod.", key: "productos_equipos" },
                { label: "Perfil Dr./Empresa", key: "perfil_doctor_empresa" },
                { label: "Turnos y Consultas", key: "turno_consulta" },
                { label: "Otros", key: "otro" }
              ].map((item) => {
                const count = (categoriaStats as any)[item.key] || 0;
                const percentage = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
                return (
                  <div key={item.key} className="space-y-0.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-600 truncate text-[11px]" title={item.label}>{item.label}</span>
                      <span className="text-gray-800 font-bold text-[11px]">{count} <span className="text-[9px] text-gray-400 font-normal">({percentage}%)</span></span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="bg-[var(--color-primary)] h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: Estado de Seguimiento (Semáforo) */}
          <div className="bg-white p-5 rounded-[var(--radius-custom)] shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <h3 className="text-xs font-bold text-[var(--color-muted-custom)] uppercase tracking-wider mb-4">Estado de Seguimiento</h3>
              
              <div className="flex items-center justify-around gap-4 py-1">
                {/* Semáforo Naranja: Por Enviar */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative flex items-center justify-center mb-2">
                    {trackingStats.atencion > 0 && (
                      <span className="absolute inline-flex h-10 w-10 rounded-full bg-amber-500/20 animate-ping" />
                    )}
                    <span className={`h-9 w-9 rounded-full flex items-center justify-center ${
                      trackingStats.atencion > 0 
                        ? "bg-amber-500 shadow-[0_0_14px_rgba(231,138,30,0.5)] border border-amber-400/30" 
                        : "bg-gray-100 border border-gray-200"
                    } transition-all duration-300`}>
                      <span className="h-3 w-3 rounded-full bg-white/40" />
                    </span>
                  </div>
                  <span className="text-2xl font-extrabold text-gray-800">{trackingStats.atencion}</span>
                  <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider mt-1">Por Enviar</span>
                </div>

                {/* Divisor */}
                <div className="h-12 w-px bg-gray-100" />

                {/* Semáforo Verde: Al día */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative flex items-center justify-center mb-2">
                    {trackingStats.alDia > 0 && (
                      <span className="absolute inline-flex h-10 w-10 rounded-full bg-emerald-500/10 animate-ping" style={{ animationDelay: '0.5s' }} />
                    )}
                    <span className={`h-9 w-9 rounded-full flex items-center justify-center ${
                      trackingStats.alDia > 0 
                        ? "bg-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.5)] border border-emerald-400/30" 
                        : "bg-gray-100 border border-gray-200"
                    } transition-all duration-300`}>
                      <span className="h-3 w-3 rounded-full bg-white/40" />
                    </span>
                  </div>
                  <span className="text-2xl font-extrabold text-gray-800">{trackingStats.alDia}</span>
                  <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider mt-1">Al Día</span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-gray-400 font-medium text-center pt-2 border-t border-gray-50">
              Clasificación automática del Agente IA
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search controls */}
      <div className="bg-white p-4 rounded-[var(--radius-custom)] shadow-sm border border-gray-100 mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono, categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-[var(--radius-custom)] border border-gray-300 py-2.5 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          />
        </div>

        {/* Filter Channel */}
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="rounded-[var(--radius-custom)] border border-gray-300 py-2.5 px-3 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] bg-white"
            >
              <option value="all">Todos los Canales</option>
              <option value="instagram">Instagram</option>
              <option value="telegram">Telegram</option>
            </select>
          </div>

          {/* Filter Follow Up */}
          <select
            value={requiresFollowUp}
            onChange={(e) => setRequiresFollowUp(e.target.value)}
            className="rounded-[var(--radius-custom)] border border-gray-300 py-2.5 px-3 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] bg-white"
          >
            <option value="all">Todos los Estados</option>
            <option value="true">Requiere Seguimiento</option>
            <option value="false">Al día</option>
          </select>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex-1 bg-white rounded-[var(--radius-custom)] shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[400px]">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent mb-4"></div>
            <p className="text-sm text-gray-500">Cargando datos de leads...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-red-500">
            <AlertCircle className="h-10 w-10 mb-2" />
            <p className="text-sm font-semibold">Error al conectar con el servidor.</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
            <MessageSquare className="h-12 w-12 mb-2 stroke-[1.5]" />
            <p className="text-sm">No se encontraron leads con los filtros aplicados.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-3 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Canal</th>
                    <th className="px-3 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contacto</th>
                    <th className="px-3 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Teléfono / IDs</th>
                    <th className="px-3 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Interés</th>
                    <th className="px-3 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha / Hora</th>
                    <th className="px-3 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Seguimiento</th>
                    <th className="px-3 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.map((lead) => {
                    const isInstagram = lead.channel?.toLowerCase() === "instagram";
                    return (
                      <tr
                        key={lead.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        {/* Channel Column */}
                        <td className="px-3 py-4 whitespace-nowrap">
                          {isInstagram ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                              <Instagram className="h-3.5 w-3.5" />
                              Instagram
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-100">
                              <Send className="h-3.5 w-3.5" />
                              Telegram
                            </span>
                          )}
                        </td>

                        {/* Contact Name */}
                        <td className="px-3 py-4 whitespace-nowrap text-xs font-bold text-[var(--color-text-custom)]">
                          {lead.contactName || "Sin Nombre"}
                        </td>

                        {/* Phone / IDs */}
                        <td className="px-3 py-4 whitespace-nowrap text-xs text-gray-500">
                          {lead.phone ? (
                            <span>{lead.phone}</span>
                          ) : isInstagram ? (
                            <span className="font-mono">IG: {lead.instagramId || "n/a"}</span>
                          ) : (
                            <span className="font-mono">TG: {lead.telegramId || "n/a"}</span>
                          )}
                        </td>

                        {/* Categoria Interes */}
                        <td className="px-3 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-bold text-gray-600">
                            {lead.categoriaInteres || "General"}
                          </span>
                        </td>

                        {/* Date/Time */}
                        <td className="px-3 py-4 whitespace-nowrap text-xs text-gray-500">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-700">{formatDate(lead.fechaMensaje)}</span>
                            <span className="text-xs text-gray-400">{formatTime(lead.horaMensaje)}</span>
                          </div>
                        </td>

                        {/* Followup Status Badge */}
                        <td className="px-3 py-4 whitespace-nowrap">
                          {lead.requiereFollowup ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
                              <AlertCircle className="h-3.5 w-3.5" />
                              Pendiente
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              <CheckCircle className="h-3.5 w-3.5" />
                              Al día
                            </span>
                          )}
                        </td>

                        {/* Actions (View details) */}
                        <td className="px-3 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline font-bold cursor-pointer"
                          >
                            <Eye className="h-4.5 w-4.5" />
                            Ver Ficha
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-gray-100">
              {leads.map((lead) => {
                const isInstagram = lead.channel?.toLowerCase() === "instagram";
                return (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="p-5 active:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-800 text-base">
                        {lead.contactName || "Sin Nombre"}
                      </h3>
                      {isInstagram ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
                          <Instagram className="h-3 w-3" />
                          Instagram
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-100">
                          <Send className="h-3 w-3" />
                          Telegram
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 font-mono mb-2">
                      {lead.phone || (isInstagram ? `IG: ${lead.instagramId}` : `TG: ${lead.telegramId}`)}
                    </p>

                    <div className="flex flex-wrap gap-2 items-center justify-between mt-3">
                      <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                        {lead.categoriaInteres || "General"}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {formatDate(lead.fechaMensaje)}
                        </span>
                        {lead.requiereFollowup && (
                          <span className="inline-flex items-center h-2 w-2 rounded-full bg-accent animate-pulse" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Slide-over Side Panel for Lead Details */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            {/* Backdrop */}
            <div
              onClick={() => setSelectedLead(null)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
            />
            {/* Panel container */}
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md transform bg-white shadow-2xl transition-all duration-300 ease-in-out">
                {/* Header */}
                <div className="flex h-20 items-center justify-between px-6 border-b border-gray-100 bg-[var(--color-primary)] text-white">
                  <div className="flex items-center gap-2">
                    <User className="h-6 w-6" />
                    <div>
                      <h2 className="font-extrabold text-lg leading-tight">
                        {selectedLead.contactName || "Detalle del Lead"}
                      </h2>
                      <p className="text-xs text-sky-100">Ficha Técnica de Conversación</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="rounded-md text-white hover:text-sky-200 focus:outline-none cursor-pointer"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="h-[calc(100vh-80px)] overflow-y-auto p-6 space-y-6">
                  {/* Lead Information Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-[var(--radius-custom)] border border-gray-100">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                        Canal
                      </span>
                      {selectedLead.channel?.toLowerCase() === "instagram" ? (
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-rose-700">
                          <Instagram className="h-4 w-4" /> Instagram
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700">
                          <Send className="h-4 w-4" /> Telegram
                        </span>
                      )}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-[var(--radius-custom)] border border-gray-100">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                        Mensajes
                      </span>
                      <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                        <MessageSquare className="h-4 w-4 text-gray-400" />
                        {selectedLead.cantidadMensajes || 1}
                      </span>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="bg-gray-50 p-5 rounded-[var(--radius-custom)] border border-gray-100 space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Información de Contacto
                    </h3>
                    {selectedLead.phone && (
                      <div className="flex items-center text-sm text-gray-700">
                        <Phone className="h-4.5 w-4.5 text-gray-400 mr-2.5 flex-shrink-0" />
                        <span className="font-medium">{selectedLead.phone}</span>
                      </div>
                    )}
                    {selectedLead.instagramId && (
                      <div className="flex items-center text-sm text-gray-700">
                        <Instagram className="h-4.5 w-4.5 text-gray-400 mr-2.5 flex-shrink-0" />
                        <span className="font-mono text-xs">{selectedLead.instagramId}</span>
                      </div>
                    )}
                    {selectedLead.telegramId && (
                      <div className="flex items-center text-sm text-gray-700">
                        <Send className="h-4.5 w-4.5 text-gray-400 mr-2.5 flex-shrink-0" />
                        <span className="font-mono text-xs">{selectedLead.telegramId}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-700">
                      <Calendar className="h-4.5 w-4.5 text-gray-400 mr-2.5 flex-shrink-0" />
                      <span>
                        {formatDate(selectedLead.fechaMensaje)} a las {formatTime(selectedLead.horaMensaje)}
                      </span>
                    </div>
                  </div>

                  {/* Follow up status banner */}
                  <div
                    className={`p-4 rounded-[var(--radius-custom)] border flex items-center gap-3 ${
                      selectedLead.requiereFollowup
                        ? "bg-amber-50 border-amber-200 text-amber-800"
                        : "bg-emerald-50 border-emerald-200 text-emerald-800"
                    }`}
                  >
                    {selectedLead.requiereFollowup ? (
                      <>
                        <AlertCircle className="h-6 w-6 text-accent flex-shrink-0" />
                        <div>
                          <p className="font-bold text-sm">Requiere Seguimiento</p>
                          <p className="text-xs opacity-90">Este lead necesita respuesta o contacto proactivo.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-sm">Al Día / Cerrado</p>
                          <p className="text-xs opacity-90">No hay acciones pendientes identificadas por la IA.</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Categoria Interes */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                      Categoría de Interés
                    </span>
                    <span className="inline-flex items-center rounded-md bg-sky-50 px-3 py-1.5 text-sm font-semibold text-[var(--color-primary)] border border-sky-100">
                      <Bookmark className="h-4 w-4 mr-1.5" />
                      {selectedLead.categoriaInteres || "No Categorizado"}
                    </span>
                  </div>

                  {/* Resumen Ejecutivo */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                      Resumen Ejecutivo de la IA
                    </span>
                    <div className="bg-gray-50 p-4 rounded-[var(--radius-custom)] border border-gray-100 text-sm text-gray-700 leading-relaxed font-medium">
                      {selectedLead.resumenEjecutivo || "Sin resumen disponible."}
                    </div>
                  </div>

                  {/* Detalle de Conversación */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                      Detalle de Interés / Conversación
                    </span>
                    <div className="bg-white p-4 rounded-[var(--radius-custom)] border border-gray-200 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {selectedLead.detalleInteres || "No hay detalles registrados."}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
