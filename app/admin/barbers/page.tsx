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
import { motion } from "framer-motion";

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
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Title Header */}
      <div className="space-y-0.5 border-b border-border pb-5">
        <span className="text-[8px] font-mono tracking-[0.2em] text-primary uppercase font-bold">
          CONSOLA DE CONTROL
        </span>
        <h2 className="text-xl font-light tracking-wide text-foreground font-serif uppercase mt-0.5">
          Gestión de Peluqueros
        </h2>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-destructive/10 border border-destructive/20 text-xs text-destructive uppercase tracking-widest font-bold flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Add Barber Form */}
        <div className="bg-card border border-border lg:col-span-4 p-6 relative">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-primary" />
          <div className="pb-3 space-y-1 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
              Nuevo Profesional
            </h3>
            <p className="text-[10px] text-muted-foreground uppercase font-light leading-snug">
              Registra un nuevo miembro del equipo.
            </p>
          </div>
          <form onSubmit={handleAddBarber} className="space-y-5">
            <div className="space-y-1">
              <Input
                type="text"
                placeholder="Nombre del peluquero"
                value={newBarberName}
                onChange={(e) => setNewBarberName(e.target.value)}
                required
                className="border-0 border-b border-border hover:border-foreground focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent rounded-none px-0 py-4 text-xs tracking-wider transition-all w-full uppercase font-bold"
              />
            </div>
            <Button
              type="submit"
              disabled={isAdding || !newBarberName.trim()}
              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-5 rounded-none flex items-center justify-center gap-1.5 text-xs uppercase tracking-widest cursor-pointer transition-all border border-primary hover:shadow-lg active:scale-[0.99]"
            >
              {isAdding ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Registrar Barbero
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Barbers List */}
        <div className="bg-card border border-border lg:col-span-8 flex flex-col min-h-[300px]">
          <div className="border-b border-border py-4 px-6 bg-secondary/15">
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
              Equipo de Barberos
            </h3>
          </div>
          
          <div className="p-6 flex-1 flex flex-col justify-start overflow-y-auto apple-scrollbar">
            {isLoading ? (
              <div className="h-44 flex flex-col items-center justify-center text-muted-foreground gap-2 flex-1">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-[10px] tracking-widest uppercase">Cargando barberos...</span>
              </div>
            ) : barbers.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border bg-secondary/5 gap-3 text-center px-4 flex-1">
                <Users className="w-6 h-6 text-muted-foreground/35" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground">Sin Peluqueros</p>
                  <p className="text-[10px] text-muted-foreground mt-1 max-w-[200px] leading-normal uppercase">
                    Registra tu primer barbero en el formulario de la izquierda.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-1 max-h-[340px] overflow-y-auto pr-1 apple-scrollbar">
                {barbers.map((barber, index) => {
                  const initial = barber.nombre.substring(0, 2).toUpperCase();
                  const isUpdating = updatingId === barber.id;
                  const isDeleting = deletingId === barber.id;

                  return (
                    <div
                      key={barber.id}
                      className="flex items-center justify-between py-4 border-b border-border/60 hover:pl-2 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        {/* Serif Number */}
                        <span className="font-serif text-sm font-light text-primary/40 min-w-[20px]">
                          0{index + 1}
                        </span>
                        
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">{barber.nombre}</h4>
                          <span className={`inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase mt-0.5 tracking-widest ${
                            barber.activo 
                              ? "text-emerald-600 dark:text-emerald-400" 
                              : "text-muted-foreground/70"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${barber.activo ? "bg-emerald-500" : "bg-muted-foreground/45"}`} />
                            {barber.activo ? "Disponible" : "Fuera de Servicio"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Toggle Active Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => handleToggleActive(barber.id, barber.activo)}
                          className={`rounded-none border-border px-3 text-[9px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 cursor-pointer transition-all duration-300 ${
                            barber.activo 
                              ? "hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/30 text-amber-500" 
                              : "hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 text-emerald-500"
                          }`}
                        >
                          {isUpdating ? (
                            <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                          ) : barber.activo ? (
                            <>
                              <UserMinus className="w-3 h-3" />
                              Pausar
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3 h-3" />
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
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent rounded-none cursor-pointer transition-all"
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
          </div>
        </div>
      </div>
    </div>
  );
}
