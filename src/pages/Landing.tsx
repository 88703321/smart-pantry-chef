import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ChefHat, Leaf, ShoppingCart, Sparkles, ArrowRight } from 'lucide-react';

const Landing: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-fresh/5" />
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-fresh/10 blur-3xl" />

        <div className="container relative mx-auto px-4">
          {/* Header */}
          <header className="flex items-center justify-between py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                <ChefHat className="h-7 w-7" />
              </div>
              <span className="font-display text-2xl font-bold text-foreground">FreshKeep</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </header>

          {/* Hero Content */}
          <div className="py-24 text-center lg:py-32">
            <div className="mx-auto max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-fresh/10 px-4 py-2 text-sm font-medium text-fresh">
                <Leaf className="h-4 w-4" />
                Reduce food waste, save money
              </div>
              
              <h1 className="mb-6 font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                Your Smart
                <span className="relative mx-3 inline-block text-primary">
                  Kitchen
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                    <path d="M2 10C50 4 150 4 198 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </span>
                Assistant
              </h1>
              
              <p className="mb-10 text-lg text-muted-foreground sm:text-xl">
                Track your food inventory, never let ingredients expire, discover delicious recipes 
                with what you have, and find the best prices at nearby stores.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" className="gap-2 text-lg" asChild>
                  <Link to="/register">
                    Start Cooking Smarter
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="gap-2 text-lg" asChild>
                  <Link to="/login">
                    I have an account
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="border-t border-border bg-card/50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Leaf className="h-8 w-8" />}
              title="Track Expiry Dates"
              description="Never throw away food again. Get alerts before items expire and use them in time."
              color="fresh"
            />
            <FeatureCard
              icon={<Sparkles className="h-8 w-8" />}
              title="Smart Recipes"
              description="Get personalized recipe suggestions based on ingredients that need to be used soon."
              color="expiring"
            />
            <FeatureCard
              icon={<ShoppingCart className="h-8 w-8" />}
              title="Store Locator"
              description="Find the best prices for groceries at stores near you. Compare and save."
              color="fridge"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 FreshKeep. Reduce waste, eat well.</p>
        </div>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'fresh' | 'expiring' | 'fridge';
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, color }) => {
  const colorClasses = {
    fresh: 'bg-fresh/10 text-fresh',
    expiring: 'bg-expiring/10 text-expiring',
    fridge: 'bg-fridge/10 text-fridge',
  };

  return (
    <div className="magnet-card p-8 text-center">
      <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${colorClasses[color]}`}>
        {icon}
      </div>
      <h3 className="mb-2 font-display text-xl font-semibold text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default Landing;
