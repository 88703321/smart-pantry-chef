import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getStores, searchStoreProducts, parseSearchText } from '@/services/firebaseService';
import { Store, StoreProductWithStore } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Timestamp } from 'firebase/firestore';
import { 
  MapPin, 
  Search, 
  Loader2, 
  Store as StoreIcon,
  Check,
  X,
  ShoppingCart,
  Sparkles
} from 'lucide-react';

const StoreLocator: React.FC = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [results, setResults] = useState<StoreProductWithStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [selectedArea, setSelectedArea] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [areas, setAreas] = useState<string[]>([]);

  // Get initial search from navigation state
  const initialSearch = (location.state as { searchItem?: string })?.searchItem || '';

  useEffect(() => {
    loadStores();
    if (initialSearch) {
      setSearchQuery(initialSearch);
    }
  }, []);

  useEffect(() => {
    if (initialSearch && selectedArea) {
      handleSearch();
    }
  }, [selectedArea]);

  const loadStores = async () => {
    try {
      const storesData = await getStores();
      setStores(storesData);
      
      // Extract unique areas
      const uniqueAreas = [...new Set(storesData.map(s => s.area))];
      setAreas(uniqueAreas);
      
      if (uniqueAreas.length > 0) {
        setSelectedArea(uniqueAreas[0]);
      }
    } catch (error) {
      console.error('Error loading stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!selectedArea || !searchQuery.trim()) {
      toast({
        title: 'Please enter search criteria',
        description: 'Select an area and enter an item to search.',
        variant: 'destructive',
      });
      return;
    }

    setSearching(true);
    try {
      const keywords = searchQuery.split(' ').filter(k => k.length > 0);
      const searchResults = await searchStoreProducts(selectedArea, keywords);
      setResults(searchResults);
      
      if (searchResults.length === 0) {
        toast({
          title: 'No results found',
          description: 'Try a different search term or area.',
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSearching(false);
    }
  };

  const handleAISearch = () => {
    const parsed = parseSearchText(searchQuery);
    if (parsed.area) {
      const matchedArea = areas.find(a => a.toLowerCase() === parsed.area.toLowerCase());
      if (matchedArea) {
        setSelectedArea(matchedArea);
      }
    }
    if (parsed.item) {
      setSearchQuery(parsed.item);
    }
    toast({
      title: 'AI Parse (Demo)',
      description: `Parsed: item="${parsed.item}", area="${parsed.area}"`,
    });
  };

  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
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
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Store Locator</h1>
        <p className="text-muted-foreground">Find the best prices for groceries near you</p>
      </div>

      {/* Search Card */}
      <Card className="magnet-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Search className="h-5 w-5" />
            Search Products
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="area">Area</Label>
              <Select value={selectedArea} onValueChange={setSelectedArea}>
                <SelectTrigger>
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {areas.map(area => (
                    <SelectItem key={area} value={area}>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> {area}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search">Search Item</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="e.g., eggs, milk, broccoli"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={handleSearch} disabled={searching} className="flex-1">
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleAISearch}
                title="Parse natural language search"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Tip: Try natural language search like "cheap eggs near Woodlands" and click the ✨ button
          </p>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display text-xl font-semibold">
            Found {results.length} result{results.length !== 1 ? 's' : ''}
          </h2>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((product, idx) => (
              <Card key={idx} className="magnet-card overflow-hidden">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <StoreIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{product.store.name}</p>
                        <p className="text-xs text-muted-foreground">{product.store.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h4 className="font-semibold text-foreground">{product.productName}</h4>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {product.category}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display text-2xl font-bold text-primary">
                        ${product.price.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Updated: {formatDate(product.lastUpdated)}
                      </p>
                    </div>
                    <Badge 
                      className={product.inStock ? 'status-fresh' : 'status-expired'}
                    >
                      {product.inStock ? (
                        <><Check className="mr-1 h-3 w-3" /> In Stock</>
                      ) : (
                        <><X className="mr-1 h-3 w-3" /> Out of Stock</>
                      )}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {results.length === 0 && !searching && (
        <Card className="magnet-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mb-2 font-display text-xl font-semibold">Search for products</h3>
            <p className="text-center text-muted-foreground">
              Select an area and enter a product name to find the best prices nearby.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StoreLocator;
