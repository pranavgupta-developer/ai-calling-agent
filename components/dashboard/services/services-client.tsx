"use client";

import { useState, useMemo } from "react";
import { MergedService } from "@/types/service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
import { Plus, Search, MoreVertical, Edit, Trash2, Clock, DollarSign, Tag, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { toggleService } from "@/lib/actions/services/toggle-service";
import { deleteService } from "@/lib/actions/services/delete-service";
import { CreateServiceModal } from "./create-service-modal";
import { EditServiceModal } from "./edit-service-modal";

interface ServicesClientProps {
  initialServices: MergedService[];
}

export function ServicesClient({ initialServices }: ServicesClientProps) {
  const [services, setServices] = useState<MergedService[]>(initialServices);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPricing, setFilterPricing] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<MergedService | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<MergedService | null>(null);

  // Derive categories for filter
  const categories = useMemo(() => {
    const cats = new Set(services.map(s => s.category).filter(Boolean));
    return Array.from(cats);
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch = 
        service.name.toLowerCase().includes(search.toLowerCase()) || 
        (service.description && service.description.toLowerCase().includes(search.toLowerCase()));
      
      const matchesStatus = filterStatus === "ALL" ? true : filterStatus === "ACTIVE" ? service.active : !service.active;
      const matchesPricing = filterPricing === "ALL" ? true : service.pricing_type === filterPricing;
      const matchesCategory = filterCategory === "ALL" ? true : service.category === filterCategory;

      return matchesSearch && matchesStatus && matchesPricing && matchesCategory;
    });
  }, [services, search, filterStatus, filterPricing, filterCategory]);

  const handleToggleStatus = async (serviceId: string, currentStatus: boolean, source: 'DEFAULT' | 'OVERRIDE' | 'CUSTOM') => {
    // Optimistic update
    setServices(prev => prev.map(s => s.id === serviceId ? { ...s, active: !currentStatus } : s));
    
    const result = await toggleService(serviceId, source, currentStatus);
    
    if (result.error) {
      toast.error(result.error);
      // Revert on error
      setServices(prev => prev.map(s => s.id === serviceId ? { ...s, active: currentStatus } : s));
    } else {
      toast.success(!currentStatus ? "Service activated" : "Service deactivated");
      if (source === 'DEFAULT') {
        // If it was default, it just spawned an override, reload page to sync
        window.location.reload();
      }
    }
  };

  const handleDelete = async () => {
    if (!serviceToDelete) return;
    
    try {
      const result = await deleteService(serviceToDelete.id, serviceToDelete.source);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(serviceToDelete.source === 'OVERRIDE' ? "Template restored" : "Service deleted");
        if (serviceToDelete.source === 'OVERRIDE') {
          window.location.reload(); // Reload to get the base template
        } else {
          setServices(prev => prev.filter(s => s.id !== serviceToDelete.id));
        }
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsDeleteOpen(false);
      setServiceToDelete(null);
    }
  };

  const formatPrice = (service: MergedService) => {
    switch (service.pricing_type) {
      case "FREE":
        return "Free";
      case "FIXED":
      case "HOURLY":
        return `${service.fixed_price} ${service.currency}`;
      case "RANGE":
        return `${service.min_price} - ${service.max_price} ${service.currency}`;
      case "COMMISSION":
      case "PERCENTAGE":
        return "Variable";
      default:
        return "N/A";
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case "DEFAULT":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">Default Template</Badge>;
      case "OVERRIDE":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50 border-purple-200">Customized</Badge>;
      case "CUSTOM":
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">Custom</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Services</h2>
          <p className="text-muted-foreground">
            Manage the services offered by your agency.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Service
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val || "ALL")}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPricing} onValueChange={(val) => setFilterPricing(val || "ALL")}>
          <SelectTrigger>
            <SelectValue placeholder="Pricing Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Pricing Types</SelectItem>
            <SelectItem value="FREE">Free</SelectItem>
            <SelectItem value="FIXED">Fixed</SelectItem>
            <SelectItem value="RANGE">Range</SelectItem>
            <SelectItem value="HOURLY">Hourly</SelectItem>
            <SelectItem value="COMMISSION">Commission</SelectItem>
            <SelectItem value="PERCENTAGE">Percentage</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={(val) => setFilterCategory(val || "ALL")}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {categories.map((cat: any) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Empty State */}
      {filteredServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/20">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No services found</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            {services.length === 0 ? "You haven't added any services yet." : "No services match your filters."}
          </p>
          {services.length === 0 && (
            <Button onClick={() => setIsCreateOpen(true)}>Create Service</Button>
          )}
          {services.length > 0 && (
            <Button variant="outline" onClick={() => {
              setSearch("");
              setFilterStatus("ALL");
              setFilterPricing("ALL");
              setFilterCategory("ALL");
            }}>Clear Filters</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id} className={`flex flex-col transition-all ${!service.active && 'opacity-70 grayscale-[0.3]'}`}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1 pr-4">
                  <CardTitle className="text-xl line-clamp-1">{service.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={service.active ? "default" : "secondary"}>
                      {service.active ? "Active" : "Inactive"}
                    </Badge>
                    {getSourceBadge(service.source)}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0" aria-label="Open menu">
                      <MoreVertical className="h-4 w-4" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {service.editable && (
                      <DropdownMenuItem onClick={() => {
                        setServiceToEdit(service);
                        setIsEditOpen(true);
                      }}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {service.deletable && (
                      <DropdownMenuItem 
                        className={service.source === 'OVERRIDE' ? "text-amber-600 focus:bg-amber-50 focus:text-amber-600" : "text-destructive focus:bg-destructive focus:text-destructive-foreground"}
                        onClick={() => {
                          setServiceToDelete(service);
                          setIsDeleteOpen(true);
                        }}
                      >
                        {service.source === 'OVERRIDE' ? <RefreshCcw className="mr-2 h-4 w-4" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        {service.source === 'OVERRIDE' ? "Restore Default" : "Delete"}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {service.description}
                </p>
                <div className="space-y-2 text-sm">
                  {service.category && (
                    <div className="flex items-center text-muted-foreground">
                      <Tag className="mr-2 h-4 w-4" />
                      {service.category}
                    </div>
                  )}
                  <div className="flex items-center text-muted-foreground">
                    <DollarSign className="mr-2 h-4 w-4" />
                    {service.pricing_type} &middot; {formatPrice(service)}
                  </div>
                  {service.duration_minutes && (
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      {service.duration_minutes} mins
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">
                  Status
                </span>
                <Switch 
                  checked={service.active} 
                  onCheckedChange={() => handleToggleStatus(service.id, service.active, service.source)}
                  aria-label="Toggle active status"
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateServiceModal 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
        onSuccess={() => {
          window.location.reload();
        }}
      />
      
      {isEditOpen && serviceToEdit && (
        <EditServiceModal 
          open={isEditOpen} 
          onOpenChange={setIsEditOpen} 
          service={serviceToEdit}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {serviceToDelete?.source === 'OVERRIDE' 
                ? `This will remove your customizations for "${serviceToDelete?.name}" and restore it back to the global template defaults.`
                : `This action cannot be undone. This will permanently delete the service "${serviceToDelete?.name}" from your agency.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className={serviceToDelete?.source === 'OVERRIDE' ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}
            >
              {serviceToDelete?.source === 'OVERRIDE' ? "Restore" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
