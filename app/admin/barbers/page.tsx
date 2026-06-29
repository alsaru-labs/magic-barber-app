"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Plus, 
  Trash2, 
  Loader2, 
  UserCheck, 
  UserMinus, 
  AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  fetchAdminBarbers, 
  createBarber, 
  updateBarber, 
  deleteBarber, 
  Barber 
} from "@/lib/services/barbers";

export default function AdminBarbersPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [newBarberName, setNewBarberName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadBarbers = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchAdminBarbers();
      setBarbers(data);
    } catch (err: any) {
      console.error("Error loading barbers:", err);
      setErrorMsg("No se pudieron cargar los peluqueros.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBarbers();
  }, []);

  const handleAddBarber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBarberName.trim()) return;

    setIsAdding(true);
    setErrorMsg(null);
    try {
      const newBarber = await createBarber(newBarberName.trim());
      setBarbers((prev) => [newBarber, ...prev]);
      setNewBarberName("");
    } catch (err: any) {
      console.error("Error creating barber:", err);
      setErrorMsg("No se pudo añadir el peluquero.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setUpdatingId(id);
    setErrorMsg(null);
    try {
      const updated = await updateBarber(id, { activo: !currentStatus });
      setBarbers((prev) =>
        prev.map((b) => (b.id === id ? updated : b))
      );
    } catch (err: any) {
      console.error("Error updating barber status:", err);
      setErrorMsg("No se pudo actualizar el estado del peluquero.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteBarber = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar a este peluquero?")) return;

    setDeletingId(id);
    setErrorMsg(null);
    try {
      await deleteBarber(id);
      setBarbers((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      console.error("Error deleting barber:", err);
      setErrorMsg("No se pudo eliminar al peluquero. Es posible que tenga citas asociadas en el sistema.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground font-heading">Gestión de Peluqueros</h2>
        <p className="text-muted-foreground text-xs md:text-sm">Añade nuevos profesionales y gestiona su disponibilidad en el salón.</p>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Add Barber Form */}
        <Card className="bg-card border-border lg:col-span-4 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground font-heading">Nuevo Peluquero</CardTitle>
            <CardDescription className="text-xs">Registra un nuevo miembro del equipo.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddBarber} className="space-y-4">
              <div className="space-y-1.5">
                <Input
                  type="text"
                  placeholder="Nombre del profesional"
                  value={newBarberName}
                  onChange={(e) => setNewBarberName(e.target.value)}
                  required
                  className="bg-card border-border text-foreground placeholder-muted-foreground/60 focus-visible:ring-primary/30 focus-visible:border-primary py-5 rounded-xl text-sm"
                />
              </div>
              <Button
                type="submit"
                disabled={isAdding || !newBarberName.trim()}
                className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-5 rounded-xl flex items-center justify-center gap-1.5 text-xs cursor-pointer"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Añadir Profesional
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Barbers List */}
        <Card className="bg-card border-border lg:col-span-8 rounded-2xl shadow-sm overflow-hidden min-h-[300px]">
          <CardHeader className="border-b border-border/80 py-4 px-6">
            <CardTitle className="text-sm font-bold text-foreground font-heading">Equipo de Barberos</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="h-44 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
                <span className="text-xs">Cargando barberos...</span>
              </div>
            ) : barbers.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border rounded-2xl bg-secondary/10 gap-3 text-center px-4">
                <Users className="w-8 h-8 text-muted-foreground/60" />
                <div>
                  <p className="font-bold text-foreground text-sm font-heading">Sin Peluqueros</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-normal">
                    Registra tu primer peluquero en el formulario de la izquierda.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {barbers.map((barber) => {
                  const initial = barber.nombre.charAt(0).toUpperCase();
                  const isUpdating = updatingId === barber.id;
                  const isDeleting = deletingId === barber.id;

                  return (
                    <div
                      key={barber.id}
                      className="flex items-center justify-between p-4 rounded-2xl border border-border/70 bg-secondary/10 hover:border-primary/30 transition-all duration-150"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center font-bold text-sm">
                          {initial}
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground text-sm font-heading">{barber.nombre}</h4>
                          <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold uppercase mt-0.5 tracking-wider ${
                            barber.activo 
                              ? "text-emerald-600 dark:text-emerald-400" 
                              : "text-muted-foreground"
                          }`}>
                            {barber.activo ? "Activo (Disponible)" : "Inactivo"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Toggle Active Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => handleToggleActive(barber.id, barber.activo)}
                          className={`rounded-xl border-border px-3.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                            barber.activo 
                              ? "hover:bg-amber-50 hover:text-amber-700 hover:border-amber-400/40" 
                              : "hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-400/40"
                          }`}
                        >
                          {isUpdating ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                          ) : barber.activo ? (
                            <>
                              <UserMinus className="w-3.5 h-3.5" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              Activar
                            </>
                          )}
                        </Button>

                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isDeleting}
                          onClick={() => handleDeleteBarber(barber.id)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer"
                        >
                          {isDeleting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
