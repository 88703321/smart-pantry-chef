import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getRecommendedRecipes, saveRecipe, getSavedRecipes } from '@/services/firebaseService';
import { RecipeWithScore, SavedRecipe } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  ChefHat, 
  Loader2, 
  Heart, 
  Clock, 
  AlertCircle,
  Check,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Recipes: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<RecipeWithScore[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeWithScore | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      const [recipesData, savedData] = await Promise.all([
        getRecommendedRecipes(user.uid),
        getSavedRecipes(user.uid)
      ]);
      setRecipes(recipesData);
      setSavedRecipes(savedData);
    } catch (error) {
      console.error('Error loading recipes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load recipes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = async (recipeId: string) => {
    if (!user) return;
    
    const isAlreadySaved = savedRecipes.some(sr => sr.recipeId === recipeId);
    if (isAlreadySaved) {
      toast({ title: 'Recipe already saved!' });
      return;
    }

    try {
      await saveRecipe(user.uid, recipeId);
      await loadData();
      toast({ title: 'Recipe saved!' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save recipe.',
        variant: 'destructive',
      });
    }
  };

  const isRecipeSaved = (recipeId: string) => {
    return savedRecipes.some(sr => sr.recipeId === recipeId);
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
        <h1 className="font-display text-3xl font-bold text-foreground">Recipe Ideas</h1>
        <p className="text-muted-foreground">
          Recipes recommended based on your inventory. Uses expiring items first!
        </p>
      </div>

      {/* Info Card */}
      <Card className="magnet-card border-l-4 border-l-fresh bg-fresh/5">
        <CardContent className="flex items-start gap-4 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-fresh/10 text-fresh">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Smart Recipe Matching</h3>
            <p className="text-sm text-muted-foreground">
              Recipes are scored based on ingredients you have. Items expiring soon get priority!
              Only recipes with 1 or fewer missing ingredients are shown.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recipe Grid */}
      {recipes.length === 0 ? (
        <Card className="magnet-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <ChefHat className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mb-2 font-display text-xl font-semibold">No recipes available</h3>
            <p className="text-center text-muted-foreground">
              Add more items to your inventory to get recipe recommendations.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="magnet-card overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-primary/5 to-fresh/5 pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="font-display text-xl">{recipe.name}</CardTitle>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {recipe.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs capitalize">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-display text-lg font-bold text-primary">
                    {recipe.score}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="mb-4 space-y-3">
                  <h4 className="font-semibold text-foreground">Ingredients:</h4>
                  <div className="flex flex-wrap gap-2">
                    {recipe.ingredients.map((ingredient, idx) => {
                      const isExpiring = recipe.expiringIngredients.includes(ingredient);
                      const isMatched = recipe.matchedIngredients.includes(ingredient);
                      const isMissing = recipe.missingIngredients.includes(ingredient);
                      
                      return (
                        <Badge 
                          key={idx}
                          className={cn(
                            'text-xs',
                            isExpiring ? 'status-expiring' :
                            isMatched ? 'status-fresh' :
                            isMissing ? 'bg-muted text-muted-foreground' : ''
                          )}
                        >
                          {isExpiring && <Clock className="mr-1 h-3 w-3" />}
                          {isMatched && !isExpiring && <Check className="mr-1 h-3 w-3" />}
                          {isMissing && <AlertCircle className="mr-1 h-3 w-3" />}
                          {ingredient}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {recipe.aiData && (
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                    {recipe.aiData.description}
                  </p>
                )}

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setSelectedRecipe(recipe)}
                      >
                        View Recipe
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[80vh] overflow-y-auto bg-card sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="font-display text-2xl">
                          {recipe.name}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        {recipe.aiData && (
                          <>
                            <p className="text-muted-foreground">{recipe.aiData.description}</p>
                            
                            <div>
                              <h4 className="mb-3 font-semibold">Ingredients</h4>
                              <div className="flex flex-wrap gap-2">
                                {recipe.ingredients.map((ingredient, idx) => (
                                  <Badge key={idx} variant="outline">{ingredient}</Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="mb-3 font-semibold">Steps</h4>
                              <ol className="space-y-3">
                                {recipe.aiData.steps.map((step, idx) => (
                                  <li key={idx} className="flex gap-3">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                      {idx + 1}
                                    </span>
                                    <span className="text-muted-foreground">{step}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </>
                        )}

                        <Button 
                          onClick={() => handleSaveRecipe(recipe.id!)}
                          className="w-full gap-2"
                          disabled={isRecipeSaved(recipe.id!)}
                        >
                          <Heart className={cn("h-4 w-4", isRecipeSaved(recipe.id!) && "fill-current")} />
                          {isRecipeSaved(recipe.id!) ? 'Saved' : 'Save Recipe'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleSaveRecipe(recipe.id!)}
                    disabled={isRecipeSaved(recipe.id!)}
                  >
                    <Heart className={cn("h-4 w-4", isRecipeSaved(recipe.id!) && "fill-current text-primary")} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recipes;
