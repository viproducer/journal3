"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Edit3,
  Search,
  Filter,
  Star,
  TrendingUp,
  Droplet,
  Award,
  Home,
  Scissors,
  Plus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navigation } from "@/components/Navigation"
import { useAuth } from "@/lib/firebase/auth"
import { useRouter } from "next/navigation"
import { getPublicTemplates } from "@/lib/firebase/templates"
import { MarketplaceTemplate } from "@/lib/firebase/types"

export default function MarketplacePage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const loadedTemplates = await getPublicTemplates();
        console.log('Loaded templates:', loadedTemplates);
        setTemplates(loadedTemplates);
      } catch (err) {
        console.error('Error loading templates:', err);
        setError('Failed to load templates');
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth/signin');
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Edit3 className="h-5 w-5" />
          <span>JournalMind</span>
        </Link>
        <Navigation onLogout={handleLogout} />
      </header>
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold">Journal Marketplace</h1>
              <p className="text-muted-foreground">Discover specialized journals for every aspect of your life</p>
            </div>
            <div className="ml-auto flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search journals..."
                  className="w-full min-w-[200px] pl-8 sm:w-[200px] md:w-[300px]"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6 flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
              <TabsTrigger
                value="all"
                className="rounded-full border bg-background px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="health"
                className="rounded-full border bg-background px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Droplet className="mr-2 h-4 w-4" />
                Health & Wellness
              </TabsTrigger>
              <TabsTrigger
                value="home"
                className="rounded-full border bg-background px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Home className="mr-2 h-4 w-4" />
                Home & Family
              </TabsTrigger>
              <TabsTrigger
                value="beauty"
                className="rounded-full border bg-background px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Scissors className="mr-2 h-4 w-4" />
                Beauty & Self-Care
              </TabsTrigger>
              <TabsTrigger
                value="challenges"
                className="rounded-full border bg-background px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Award className="mr-2 h-4 w-4" />
                Challenges
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-6">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Popular Journals</span>
              </h2>
              <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <Card key={template.id} className="overflow-hidden">
                    <div 
                      className="h-40 p-6"
                      style={{ 
                        backgroundColor: template.color,
                        backgroundImage: `linear-gradient(to bottom right, ${template.color}, ${template.color}dd)`
                      }}
                    >
                      <div className="flex h-full flex-col justify-between text-white">
                        <Badge className="w-fit bg-white/20 text-white hover:bg-white/30">
                          {template.category === 'challenge' ? '30-Day Challenge' : template.category}
                        </Badge>
                        <div>
                          <h3 className="text-xl font-bold">{template.name}</h3>
                          <p className="text-sm opacity-90">{template.description}</p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>4.8 (124 ratings)</span>
                        <span className="mx-2">•</span>
                        <span>2,450 active users</span>
                      </div>
                      <div className="mt-4 space-y-2">
                        {template.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            {index === 0 && <Droplet className="h-4 w-4 text-blue-500" />}
                            {index === 1 && <TrendingUp className="h-4 w-4 text-green-500" />}
                            {index === 2 && <Award className="h-4 w-4 text-amber-500" />}
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t bg-muted/20 px-6 py-4">
                      <Button className="w-full" asChild>
                        <Link href={`/journal/create-entry?template=${template.id}`}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add to My Journals
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

