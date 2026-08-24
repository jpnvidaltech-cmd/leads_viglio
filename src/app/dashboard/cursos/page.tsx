"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Calendar,
  DollarSign,
  User,
  Users,
  MapPin,
  Clock,
  BookOpen,
  Check,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface Course {
  id: number;
  codigo: string;
  nombreDelCurso: string | null;
  tipoModalidad: string | null;
  nivel: string | null;
  cargaHorariaDuracion: string | null;
  contenidoResumido: string | null;
  incluye: string | null;
  formaDePago: string | null;
  contactoInscripcion: string | null;
  ediciones: Edition[];
}

interface Edition {
  id: number;
  cursoId: number;
  nombreEdicion: string | null;
  dictante: string | null;
  fechaInicio: string | null;
  fechasEspecificas: string | null;
  participantes: string | null;
  precio: string | null;
  estado: string | null;
}

interface EditionForm {
  id?: number;
  nombreEdicion: string;
  dictante: string;
  fechaInicio: string;
  fechasEspecificas: string;
  participantes: string;
  precio: string;
  estado: string;
}

export default function CursosPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const isAdmin = session?.user?.role === "admin";

  // State management
  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);

  // Modals state
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "course"; id: number } | null>(null);

  // Form states
  const [courseForm, setCourseForm] = useState<{
    codigo: string;
    nombreDelCurso: string;
    tipoModalidad: string;
    nivel: string;
    cargaHorariaDuracion: string;
    contenidoResumido: string;
    incluye: string;
    formaDePago: string;
    contactoInscripcion: string;
    ediciones: EditionForm[];
  }>({
    codigo: "",
    nombreDelCurso: "",
    tipoModalidad: "",
    nivel: "",
    cargaHorariaDuracion: "",
    contenidoResumido: "",
    incluye: "",
    formaDePago: "",
    contactoInscripcion: "",
    ediciones: [],
  });
 
  const [editionForm, setEditionForm] = useState({
    nombreEdicion: "",
    dictante: "",
    fechaInicio: "",
    fechasEspecificas: "",
    participantes: "",
    precio: "",
    estado: "Programada",
  });
 
  // Estados locales para la administración de ediciones de un curso en el modal único
  const [subEditionForm, setSubEditionForm] = useState<EditionForm>({
    nombreEdicion: "",
    dictante: "",
    fechaInicio: "",
    fechasEspecificas: "",
    participantes: "",
    precio: "",
    estado: "Programada",
  });
  const [editingSubEditionIndex, setEditingSubEditionIndex] = useState<number | null>(null);
  const [subEditionFormOpen, setSubEditionFormOpen] = useState(false);
 
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
 
  // Fetch courses with editions
  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ["cursos"],
    queryFn: async () => {
      const res = await fetch("/api/cursos");
      if (!res.ok) throw new Error("Error fetching courses");
      return res.json();
    },
  });
 
  // Queries invalidation
  const refetch = () => queryClient.invalidateQueries({ queryKey: ["cursos"] });
 
  // Open modals with pre-filled fields
  const handleOpenCourseModal = (course?: Course) => {
    setErrorMsg(null);
    setSubEditionForm({
      nombreEdicion: "",
      dictante: "",
      fechaInicio: "",
      fechasEspecificas: "",
      participantes: "",
      precio: "",
      estado: "Programada",
    });
    setEditingSubEditionIndex(null);
    setSubEditionFormOpen(false);
 
    if (course) {
      setEditingCourse(course);
      setCourseForm({
        codigo: course.codigo || "",
        nombreDelCurso: course.nombreDelCurso || "",
        tipoModalidad: course.tipoModalidad || "",
        nivel: course.nivel || "",
        cargaHorariaDuracion: course.cargaHorariaDuracion || "",
        contenidoResumido: course.contenidoResumido || "",
        incluye: course.incluye || "",
        formaDePago: course.formaDePago || "",
        contactoInscripcion: course.contactoInscripcion || "",
        ediciones: (course.ediciones || []).map((ed) => ({
          id: ed.id,
          nombreEdicion: ed.nombreEdicion || "",
          dictante: ed.dictante || "",
          fechaInicio: ed.fechaInicio ? ed.fechaInicio.split("T")[0] : "",
          fechasEspecificas: ed.fechasEspecificas || "",
          participantes: ed.participantes || "",
          precio: ed.precio || "",
          estado: ed.estado || "Programada",
        })),
      });
    } else {
      setEditingCourse(null);
      setCourseForm({
        codigo: "",
        nombreDelCurso: "",
        tipoModalidad: "",
        nivel: "",
        cargaHorariaDuracion: "",
        contenidoResumido: "",
        incluye: "",
        formaDePago: "",
        contactoInscripcion: "",
        ediciones: [],
      });
    }
    setCourseModalOpen(true);
  };

  const handleOpenDeleteConfirm = (type: "course", id: number) => {
    setDeleteTarget({ type, id });
    setDeleteConfirmOpen(true);
  };

  // Funciones de gestión de sub-ediciones locales
  const handleSaveSubEdition = () => {
    if (!subEditionForm.nombreEdicion) {
      alert("El nombre de la edición es obligatorio.");
      return;
    }

    if (editingSubEditionIndex !== null) {
      const updated = [...courseForm.ediciones];
      updated[editingSubEditionIndex] = subEditionForm;
      setCourseForm({ ...courseForm, ediciones: updated });
      setEditingSubEditionIndex(null);
    } else {
      setCourseForm({
        ...courseForm,
        ediciones: [...courseForm.ediciones, subEditionForm],
      });
    }

    setSubEditionForm({
      nombreEdicion: "",
      dictante: "",
      fechaInicio: "",
      fechasEspecificas: "",
      participantes: "",
      precio: "",
      estado: "Programada",
    });
    setSubEditionFormOpen(false);
  };

  const handleEditSubEdition = (index: number) => {
    setSubEditionForm(courseForm.ediciones[index]);
    setEditingSubEditionIndex(index);
    setSubEditionFormOpen(true);
  };

  const handleDeleteSubEdition = (index: number) => {
    const updated = courseForm.ediciones.filter((_, i) => i !== index);
    setCourseForm({ ...courseForm, ediciones: updated });
    if (editingSubEditionIndex === index) {
      setEditingSubEditionIndex(null);
      setSubEditionFormOpen(false);
    }
  };

  // Submit Course Form
  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.codigo || !courseForm.nombreDelCurso) {
      setErrorMsg("El código y el nombre del curso son obligatorios.");
      return;
    }

    setLoadingAction(true);
    setErrorMsg(null);

    try {
      const url = editingCourse ? `/api/cursos/${editingCourse.id}` : "/api/cursos";
      const method = editingCourse ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Ocurrió un error inesperado");
      } else {
        refetch();
        setCourseModalOpen(false);
      }
    } catch {
      setErrorMsg("Error de conexión con el servidor.");
    } finally {
      setLoadingAction(false);
    }
  };

  // Confirm delete (solo para curso padre)
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setLoadingAction(true);
    const { id } = deleteTarget;

    try {
      const url = `/api/cursos/${id}`;
      const res = await fetch(url, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Error al eliminar el curso");
      } else {
        refetch();
        setDeleteConfirmOpen(false);
        setDeleteTarget(null);
      }
    } catch {
      alert("Error de red.");
    } finally {
      setLoadingAction(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Sin fecha";
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

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--color-primary)]">
            Cursos y Ediciones
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestión del catálogo académico de odontología digital.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => handleOpenCourseModal()}
            className="inline-flex items-center gap-2 rounded-[var(--radius-custom)] bg-[var(--color-primary)] text-white px-4 py-2.5 text-sm font-bold shadow-md hover:bg-opacity-95 cursor-pointer transition-all self-start sm:self-center"
          >
            <Plus className="h-5 w-5" />
            Nuevo Curso
          </button>
        )}
      </div>

      {/* Main List */}
      <div className="flex-1 bg-white rounded-[var(--radius-custom)] shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[400px]">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent mb-4"></div>
            <p className="text-sm text-gray-500">Cargando catálogo...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
            <GraduationCap className="h-12 w-12 mb-2 stroke-[1.5]" />
            <p className="text-sm">No hay cursos registrados todavía.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <div className="divide-y divide-gray-100">
              {courses.map((course) => {
                const isExpanded = expandedCourseId === course.id;
                return (
                  <div key={course.id} className="transition-colors">
                    {/* Course Summary Row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-4 bg-white hover:bg-gray-50/50">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center rounded-md bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-[var(--color-primary)] border border-sky-100">
                            {course.codigo}
                          </span>
                          <span className="text-sm text-gray-500 font-semibold uppercase tracking-wider">
                            {course.nivel || "Todos los niveles"}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-[var(--color-text-custom)]">
                          {course.nombreDelCurso}
                        </h3>
                        <p className="text-sm text-gray-500 max-w-2xl line-clamp-2">
                          {course.contenidoResumido || "Sin descripción corta."}
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-400 pt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {course.cargaHorariaDuracion || "n/a"}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            {course.tipoModalidad || "n/a"}
                          </span>
                        </div>
                      </div>

                      {/* Course Row Actions */}
                      <div className="flex items-center gap-2.5 self-end md:self-center">
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleOpenCourseModal(course)}
                              className="p-2 text-gray-400 hover:text-[var(--color-primary)] hover:bg-sky-50 rounded-lg transition-all cursor-pointer"
                              title="Editar Curso"
                            >
                              <Edit2 className="h-4.5 w-4.5" />
                            </button>
                            <button
                              onClick={() => handleOpenDeleteConfirm("course", course.id)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                              title="Eliminar Curso"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                          className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-[var(--radius-custom)] text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                        >
                          {course.ediciones.length === 1 ? "1 Edición" : `${course.ediciones.length} Ediciones`}
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Detail (Editions Table) */}
                    {isExpanded && (
                      <div className="bg-gray-50/50 p-6 border-t border-b border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-wider">
                            Ediciones Programadas
                          </h4>
                        </div>

                        {course.ediciones.length === 0 ? (
                          <p className="text-sm text-gray-400 py-4 text-center">
                            No hay ediciones programadas para este curso.
                          </p>
                        ) : (
                          <div className="overflow-x-auto rounded-[var(--radius-custom)] border border-gray-100 bg-white shadow-sm">
                            <table className="min-w-full text-left text-sm">
                              <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/30 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                  <th className="px-5 py-3">Edición</th>
                                  <th className="px-5 py-3">Dictante</th>
                                  <th className="px-5 py-3">Fecha de Inicio</th>
                                  <th className="px-5 py-3">Estado</th>
                                  <th className="px-5 py-3 text-right">Cupos / Precio</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {course.ediciones.map((ed) => (
                                  <tr key={ed.id} className="hover:bg-gray-50/50">
                                    <td className="px-5 py-3.5 font-bold text-[var(--color-text-custom)]">
                                      {ed.nombreEdicion}
                                    </td>
                                    <td className="px-5 py-3.5 text-gray-600 font-medium">
                                      {ed.dictante || "n/a"}
                                    </td>
                                    <td className="px-5 py-3.5 text-gray-600">
                                      <div className="flex flex-col">
                                        <span className="font-medium">{formatDate(ed.fechaInicio)}</span>
                                        <span className="text-xs text-gray-400">{ed.fechasEspecificas || ""}</span>
                                      </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                      <span
                                        className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold border ${
                                          ed.estado === "abierta"
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                            : ed.estado === "finalizada"
                                            ? "bg-gray-100 text-gray-600 border-gray-200"
                                            : "bg-amber-50 text-amber-700 border-amber-100" // cerrada / cupos llenos
                                        }`}
                                      >
                                        {ed.estado || "abierta"}
                                      </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-gray-500 font-medium text-right">
                                      <div className="flex flex-col">
                                        <span className="text-gray-700 font-bold">{ed.precio || "Sin precio"}</span>
                                        <span className="text-xs">{ed.participantes || "Cupos n/a"}</span>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Course Modal */}
      {courseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setCourseModalOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[var(--radius-custom)] shadow-2xl overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="bg-[var(--color-primary)] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-white" style={{ color: '#ffffff' }}>
                {editingCourse ? "Editar Curso" : "Crear Nuevo Curso"}
              </h3>
              <button onClick={() => setCourseModalOpen(false)} className="text-white hover:text-sky-200 cursor-pointer">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCourseSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {errorMsg && (
                <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-600 border border-rose-100">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase">Código del Curso *</label>
                  <input
                    type="text"
                    required
                    value={courseForm.codigo}
                    onChange={(e) => setCourseForm({ ...courseForm, codigo: e.target.value })}
                    className="mt-1 block w-full rounded-[var(--radius-custom)] border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                    placeholder="E.g. DIG-REH"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase">Nivel</label>
                  <input
                    type="text"
                    value={courseForm.nivel}
                    onChange={(e) => setCourseForm({ ...courseForm, nivel: e.target.value })}
                    className="mt-1 block w-full rounded-[var(--radius-custom)] border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                    placeholder="E.g. Avanzado"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Nombre del Curso *</label>
                <input
                  type="text"
                  required
                  value={courseForm.nombreDelCurso}
                  onChange={(e) => setCourseForm({ ...courseForm, nombreDelCurso: e.target.value })}
                  className="mt-1 block w-full rounded-[var(--radius-custom)] border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  placeholder="E.g. Master en Cirugía Guiada"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase">Modalidad</label>
                  <input
                    type="text"
                    value={courseForm.tipoModalidad}
                    onChange={(e) => setCourseForm({ ...courseForm, tipoModalidad: e.target.value })}
                    className="mt-1 block w-full rounded-[var(--radius-custom)] border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                    placeholder="E.g. Presencial / Online"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase">Carga Horaria / Duración</label>
                  <input
                    type="text"
                    value={courseForm.cargaHorariaDuracion}
                    onChange={(e) => setCourseForm({ ...courseForm, cargaHorariaDuracion: e.target.value })}
                    className="mt-1 block w-full rounded-[var(--radius-custom)] border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                    placeholder="E.g. 40 horas (3 meses)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Contenido Resumido</label>
                <textarea
                  value={courseForm.contenidoResumido}
                  onChange={(e) => setCourseForm({ ...courseForm, contenidoResumido: e.target.value })}
                  rows={2}
                  className="mt-1 block w-full rounded-[var(--radius-custom)] border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  placeholder="E.g. Planificación digital de implantes y guías quirúrgicas..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">¿Qué Incluye?</label>
                <textarea
                  value={courseForm.incluye}
                  onChange={(e) => setCourseForm({ ...courseForm, incluye: e.target.value })}
                  rows={2}
                  className="mt-1 block w-full rounded-[var(--radius-custom)] border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  placeholder="E.g. Coffee breaks, materiales clínicos, licencias temporales de software..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase">Formas de Pago</label>
                  <input
                    type="text"
                    value={courseForm.formaDePago}
                    onChange={(e) => setCourseForm({ ...courseForm, formaDePago: e.target.value })}
                    className="mt-1 block w-full rounded-[var(--radius-custom)] border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                    placeholder="E.g. Tarjeta, Transferencia, 3 Cuotas"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase">Contacto de Inscripción</label>
                  <input
                    type="text"
                    value={courseForm.contactoInscripcion}
                    onChange={(e) => setCourseForm({ ...courseForm, contactoInscripcion: e.target.value })}
                    className="mt-1 block w-full rounded-[var(--radius-custom)] border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                    placeholder="E.g. +54 9 11..."
                  />
                </div>
              </div>

              {/* Sección de Ediciones Integrada */}
              <hr className="border-gray-200/60 my-5" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-extrabold text-gray-700 uppercase tracking-wider">
                    Ediciones / Cohortes ({courseForm.ediciones.length})
                  </h4>
                  {!subEditionFormOpen && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSubEditionIndex(null);
                        setSubEditionForm({
                          nombreEdicion: "",
                          dictante: "",
                          fechaInicio: "",
                          fechasEspecificas: "",
                          participantes: "",
                          precio: "",
                          estado: "Programada",
                        });
                        setSubEditionFormOpen(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] hover:text-sky-700 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Agregar Edición
                    </button>
                  )}
                </div>

                {/* Lista de ediciones agregadas */}
                {courseForm.ediciones.length === 0 ? (
                  <p className="text-xs text-gray-400 italic mb-4 bg-gray-50/50 p-3 rounded-lg border border-dashed border-gray-200">
                    No hay ediciones cargadas para este curso. Agrega al menos una.
                  </p>
                ) : (
                  <div className="space-y-2 mb-4">
                    {courseForm.ediciones.map((ed, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/30 text-xs"
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-gray-800">
                            {ed.nombreEdicion} <span className="font-normal text-gray-500">| Dictante: {ed.dictante || "n/a"}</span>
                          </p>
                          <p className="text-gray-500">
                            Inicio: <span className="font-semibold">{ed.fechaInicio || "n/a"}</span> {ed.fechasEspecificas && `(${ed.fechasEspecificas})`}
                          </p>
                          <p className="text-gray-500">
                            Precio: <span className="font-semibold text-gray-700">{ed.precio || "Consultar"}</span> | Participantes: {ed.participantes || "n/a"} | Estado: <span className="capitalize font-semibold">{ed.estado}</span>
                          </p>
                        </div>
                        <div className="flex gap-1.5 ml-2">
                          <button
                            type="button"
                            onClick={() => handleEditSubEdition(idx)}
                            className="p-1 text-gray-400 hover:text-[var(--color-primary)] hover:bg-white rounded border border-transparent hover:border-gray-200 cursor-pointer"
                            title="Editar"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubEdition(idx)}
                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-white rounded border border-transparent hover:border-gray-200 cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sub-formulario colapsable para agregar/editar edición */}
                {subEditionFormOpen && (
                  <div className="p-4 rounded-lg border border-sky-100 bg-sky-50/10 space-y-3 mb-4 transition-all">
                    <h5 className="text-xs font-bold text-[var(--color-primary)] uppercase">
                      {editingSubEditionIndex !== null ? "Editar Edición" : "Nueva Edición"}
                    </h5>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Nombre Edición *</label>
                        <input
                          type="text"
                          required
                          value={subEditionForm.nombreEdicion}
                          onChange={(e) => setSubEditionForm({ ...subEditionForm, nombreEdicion: e.target.value })}
                          className="mt-1 block w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs focus:border-[var(--color-primary)] focus:outline-none"
                          placeholder="E.g. Cohorte 1 / Septiembre"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Dictante / Profesor</label>
                        <input
                          type="text"
                          value={subEditionForm.dictante}
                          onChange={(e) => setSubEditionForm({ ...subEditionForm, dictante: e.target.value })}
                          className="mt-1 block w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs focus:border-[var(--color-primary)] focus:outline-none"
                          placeholder="E.g. Dr. Pérez Giugovaz"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Fecha de Inicio</label>
                        <input
                          type="date"
                          value={subEditionForm.fechaInicio}
                          onChange={(e) => setSubEditionForm({ ...subEditionForm, fechaInicio: e.target.value })}
                          className="mt-1 block w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs focus:border-[var(--color-primary)] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Fechas Específicas / Detalles</label>
                        <input
                          type="text"
                          value={subEditionForm.fechasEspecificas}
                          onChange={(e) => setSubEditionForm({ ...subEditionForm, fechasEspecificas: e.target.value })}
                          className="mt-1 block w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs focus:border-[var(--color-primary)] focus:outline-none"
                          placeholder="E.g. 15 y 16 de Octubre de 9 a 18 hs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Participantes / Cupo</label>
                        <input
                          type="text"
                          value={subEditionForm.participantes}
                          onChange={(e) => setSubEditionForm({ ...subEditionForm, participantes: e.target.value })}
                          className="mt-1 block w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs focus:border-[var(--color-primary)] focus:outline-none"
                          placeholder="E.g. 12 alumnos"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Precio</label>
                        <input
                          type="text"
                          value={subEditionForm.precio}
                          onChange={(e) => setSubEditionForm({ ...subEditionForm, precio: e.target.value })}
                          className="mt-1 block w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs focus:border-[var(--color-primary)] focus:outline-none"
                          placeholder="E.g. 500 USD / $150.000 ARS"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase">Estado</label>
                        <select
                          value={subEditionForm.estado}
                          onChange={(e) => setSubEditionForm({ ...subEditionForm, estado: e.target.value })}
                          className="mt-1 block w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs focus:border-[var(--color-primary)] focus:outline-none"
                        >
                          <option value="Programada">Programada</option>
                          <option value="abierta">Abierta / Inscripciones</option>
                          <option value="cerrada">Cerrada / Cupos llenos</option>
                          <option value="finalizada">Finalizada</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSubEditionFormOpen(false);
                          setEditingSubEditionIndex(null);
                        }}
                        className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveSubEdition}
                        className="rounded-md bg-[var(--color-primary)] text-white px-3 py-1.5 text-xs font-bold hover:bg-opacity-95 cursor-pointer"
                      >
                        {editingSubEditionIndex !== null ? "Guardar Cambios" : "Confirmar Edición"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCourseModalOpen(false)}
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
                  {editingCourse ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}      {/* Delete Confirmation Modal */}
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
              {deleteTarget?.type === "course"
                ? "Si eliminas el curso, se eliminarán también de forma permanente todas sus ediciones programadas."
                : "Se eliminarán permanentemente todos los datos de esta edición seleccionada."}
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
