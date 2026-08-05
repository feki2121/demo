"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebartest";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/useSidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Wrench, 
  Loader2,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MoreVertical
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Service {
  id: string;
  reference: string;
  code: string;
  designation: string;
  prixVente: number;
  prixVenteHT: number;
  tva: number;
  type: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    nom: string;
  } | null;
  unite?: {
    id: string;
    nom: string;
    symbole: string;
  } | null;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ServicesPage() {
  const { sidebarClasses } = useSidebar();
  const router = useRouter();
  const { toast } = useToast();
  
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchServices();
  }, [pagination.page, searchTerm]);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        type: 'SERVICE',
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/products?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        setServices(data.data || []);
        setPagination(data.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 });
      } else {
        throw new Error(data.error || "Erreur lors du chargement");
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les services",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!serviceToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/products/${serviceToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Service supprimé avec succès"
        });
        fetchServices();
      } else {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de supprimer le service",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setServiceToDelete(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="flex min-h-screen bg-background flex-col md:flex-row">
      <Sidebar />
      <div className={cn("flex-1 transition-all duration-300", sidebarClasses)}>
        <Header 
          title="Services" 
          subtitle="Gestion des services et prestations" 
        />
        
        <main className="p-4 md:p-6">
          {/* En-tête avec actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Wrench className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Liste des services</h2>
              <Badge variant="secondary" className="ml-2">
                {pagination.total} service{pagination.total > 1 ? 's' : ''}
              </Badge>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {/* Recherche */}
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un service..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-9"
                />
              </div>
              
              {/* Bouton Nouveau service */}
              <Button onClick={() => router.push('/produits/creer')} className="gap-2">
                <Plus className="h-4 w-4" />
                Nouveau service
              </Button>
            </div>
          </div>

          {/* Tableau des services */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : services.length === 0 ? (
                <div className="text-center py-12">
                  <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Aucun service trouvé</h3>
                  <p className="text-muted-foreground mt-1">
                    {searchTerm ? "Aucun service ne correspond à votre recherche" : "Commencez par créer votre premier service"}
                  </p>
                  {!searchTerm && (
                    <Button 
                      onClick={() => router.push('/produits/creer')} 
                      className="mt-4 gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Créer un service
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Désignation</TableHead>
                          <TableHead>Prix TTC</TableHead>
                          <TableHead>Prix HT</TableHead>
                          <TableHead>TVA</TableHead>
                          <TableHead>Créé le</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {services.map((service) => (
                          <TableRow key={service.id}>
                            <TableCell className="font-medium">
                              <span className="inline-flex items-center gap-1">
                                <Badge variant="outline" className="font-mono">
                                  {service.code || service.reference}
                                </Badge>
                              </span>
                            </TableCell>
                            <TableCell>{service.designation}</TableCell>
                            <TableCell className="font-semibold text-green-600">
                              {formatPrice(service.prixVente)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatPrice(service.prixVenteHT)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {service.tva}%
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(service.createdAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => router.push(`/services/${service.id}`)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Voir
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => router.push(`/produits/${service.id}/modifier`)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => setServiceToDelete(service)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                      <div className="text-sm text-muted-foreground">
                        Affichage de {services.length} service{pagination.total > 1 ? 's' : ''} sur {pagination.total}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                          Page {pagination.page} / {pagination.totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page === pagination.totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Statistiques rapides */}
          {services.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total des services</p>
                      <p className="text-2xl font-bold">{pagination.total}</p>
                    </div>
                    <Wrench className="h-8 w-8 text-primary/60" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Prix moyen (TTC)</p>
                      <p className="text-2xl font-bold">
                        {formatPrice(
                          services.reduce((acc, s) => acc + s.prixVente, 0) / services.length
                        )}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-primary/60" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">TVA la plus utilisée</p>
                      <p className="text-2xl font-bold">
                        {(() => {
                          const tvaCount = services.reduce((acc, s) => {
                            acc[s.tva] = (acc[s.tva] || 0) + 1;
                            return acc;
                          }, {} as Record<number, number>);
                          const maxTVA = Object.entries(tvaCount).sort((a, b) => b[1] - a[1])[0];
                          return maxTVA ? `${maxTVA[0]}%` : '-';
                        })()}
                      </p>
                    </div>
                    <Filter className="h-8 w-8 text-primary/60" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Dialogue de confirmation de suppression */}
      <AlertDialog open={!!serviceToDelete} onOpenChange={() => setServiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le service "{serviceToDelete?.designation}" 
              sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}