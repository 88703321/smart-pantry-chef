import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getInventory, 
  addInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem 
} from '@/services/firebaseService';
import { InventoryItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Timestamp } from 'firebase/firestore';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2,
  Refrigerator,
  Snowflake,
  Archive,
  Package,
  Search,
  ScanBarcode
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Inventory: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'fridge' | 'freezer' | 'pantry'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 1,
    quantityUnit: 'pcs',
    expiryDate: '',
    storage: 'fridge' as 'fridge' | 'freezer' | 'pantry',
    reorderThreshold: 2,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadInventory();
  }, [user]);

  const loadInventory = async () => {
    if (!user) return;
    try {
      const items = await getInventory(user.uid);
      setInventory(items);
    } catch (error) {
      console.error('Error loading inventory:', error);
      toast({
        title: 'Error',
        description: 'Failed to load inventory.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      quantity: 1,
      quantityUnit: 'pcs',
      expiryDate: '',
      storage: 'fridge',
      reorderThreshold: 2,
    });
    setEditingItem(null);
  };

  const handleOpenDialog = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      const expiryDate = item.expiryDate instanceof Timestamp 
        ? item.expiryDate.toDate() 
        : item.expiryDate;
      setFormData({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        quantityUnit: item.quantityUnit,
        expiryDate: expiryDate.toISOString().split('T')[0],
        storage: item.storage,
        reorderThreshold: item.reorderThreshold,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      const itemData = {
        userId: user.uid,
        name: formData.name,
        category: formData.category,
        quantity: formData.quantity,
        quantityUnit: formData.quantityUnit,
        expiryDate: Timestamp.fromDate(new Date(formData.expiryDate)),
        storage: formData.storage,
        reorderThreshold: formData.reorderThreshold,
      };

      if (editingItem) {
        await updateInventoryItem(editingItem.id!, itemData);
        toast({ title: 'Item updated!' });
      } else {
        await addInventoryItem(itemData);
        toast({ title: 'Item added!' });
      }

      await loadInventory();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save item.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await deleteInventoryItem(id);
      await loadInventory();
      toast({ title: 'Item deleted!' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete item.',
        variant: 'destructive',
      });
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesFilter = filter === 'all' || item.storage === filter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (date: Date | Timestamp) => {
    const d = date instanceof Timestamp ? date.toDate() : date;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getDaysUntilExpiry = (date: Date | Timestamp) => {
    const d = date instanceof Timestamp ? date.toDate() : date;
    return Math.ceil((d.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStorageIcon = (storage: string) => {
    switch (storage) {
      case 'fridge': return <Refrigerator className="h-4 w-4" />;
      case 'freezer': return <Snowflake className="h-4 w-4" />;
      case 'pantry': return <Archive className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'fresh':
        return <Badge className="status-fresh">Fresh</Badge>;
      case 'expiringSoon':
        return <Badge className="status-expiring">Expiring Soon</Badge>;
      case 'almostExpired':
        return <Badge className="status-expired">Use Now!</Badge>;
      default:
        return null;
    }
  };

  const getStorageStyle = (storage: string) => {
    switch (storage) {
      case 'fridge': return 'border-l-4 border-l-fridge';
      case 'freezer': return 'border-l-4 border-l-freezer';
      case 'pantry': return 'border-l-4 border-l-pantry';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground">Manage your kitchen inventory</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Milk, Eggs, Broccoli"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="Dairy">Dairy</SelectItem>
                    <SelectItem value="Vegetables">Vegetables</SelectItem>
                    <SelectItem value="Fruits">Fruits</SelectItem>
                    <SelectItem value="Meat">Meat</SelectItem>
                    <SelectItem value="Seafood">Seafood</SelectItem>
                    <SelectItem value="Grains">Grains</SelectItem>
                    <SelectItem value="Beverages">Beverages</SelectItem>
                    <SelectItem value="Condiments">Condiments</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select
                    value={formData.quantityUnit}
                    onValueChange={(value) => setFormData({ ...formData, quantityUnit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="pcs">pcs</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="pack">pack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storage">Storage Location</Label>
                <Select
                  value={formData.storage}
                  onValueChange={(value: 'fridge' | 'freezer' | 'pantry') => 
                    setFormData({ ...formData, storage: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="fridge">
                      <div className="flex items-center gap-2">
                        <Refrigerator className="h-4 w-4 text-fridge" /> Fridge
                      </div>
                    </SelectItem>
                    <SelectItem value="freezer">
                      <div className="flex items-center gap-2">
                        <Snowflake className="h-4 w-4 text-freezer" /> Freezer
                      </div>
                    </SelectItem>
                    <SelectItem value="pantry">
                      <div className="flex items-center gap-2">
                        <Archive className="h-4 w-4 text-pantry" /> Pantry
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reorderThreshold">Low Stock Threshold</Label>
                <Input
                  id="reorderThreshold"
                  type="number"
                  min="0"
                  value={formData.reorderThreshold}
                  onChange={(e) => setFormData({ ...formData, reorderThreshold: parseInt(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">
                  You'll be notified when quantity falls below this number
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingItem ? 'Update' : 'Add Item'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="magnet-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Storage Filter Tabs */}
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'fridge' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('fridge')}
                className={filter === 'fridge' ? '' : 'border-fridge/50 text-fridge hover:bg-fridge/10'}
              >
                <Refrigerator className="mr-1 h-4 w-4" /> Fridge
              </Button>
              <Button
                variant={filter === 'freezer' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('freezer')}
                className={filter === 'freezer' ? '' : 'border-freezer/50 text-freezer hover:bg-freezer/10'}
              >
                <Snowflake className="mr-1 h-4 w-4" /> Freezer
              </Button>
              <Button
                variant={filter === 'pantry' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('pantry')}
                className={filter === 'pantry' ? '' : 'border-pantry/50 text-pantry hover:bg-pantry/10'}
              >
                <Archive className="mr-1 h-4 w-4" /> Pantry
              </Button>
            </div>

            {/* Barcode Button */}
            <Button variant="outline" size="sm" className="gap-2" disabled>
              <ScanBarcode className="h-4 w-4" />
              Scan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory List */}
      {filteredInventory.length === 0 ? (
        <Card className="magnet-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mb-2 font-display text-xl font-semibold">No items found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try a different search term' : 'Add your first item to get started'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredInventory.map((item) => (
            <Card 
              key={item.id} 
              className={cn('magnet-card overflow-hidden', getStorageStyle(item.storage))}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      {getStorageIcon(item.storage)}
                      <h3 className="font-display text-lg font-semibold">{item.name}</h3>
                    </div>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {getStatusBadge(item.status)}
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                      {item.isLowStock && (
                        <Badge className="status-expiring text-xs">Low Stock</Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Quantity: <span className="font-medium text-foreground">{item.quantity} {item.quantityUnit}</span></p>
                      <p>Expires: <span className={cn(
                        'font-medium',
                        getDaysUntilExpiry(item.expiryDate) <= 2 ? 'text-expired' :
                        getDaysUntilExpiry(item.expiryDate) <= 5 ? 'text-expiring' : 'text-fresh'
                      )}>{formatDate(item.expiryDate)}</span></p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleOpenDialog(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(item.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inventory;
