"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Edit3,
  ArrowLeft,
  Plus,
  Scissors,
  Tag,
  Camera,
  Droplet,
  Wind,
  Sun,
  Thermometer,
  Save,
  X,
  Search,
} from "lucide-react"
import { useAuth } from "@/lib/firebase/auth"
import { Navigation } from "@/components/Navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Product {
  id: number;
  name: string;
  brand: string;
  type: string;
  ingredients: string;
  keyIngredients: string[];
  notes: string;
}

export default function CurlyHairJournalSetupPage() {
  const { logout } = useAuth()
  const [activeTab, setActiveTab] = useState("products")
  const [products, setProducts] = useState<Product[]>([])
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: "",
    brand: "",
    type: "",
    ingredients: "",
    keyIngredients: [],
    notes: "",
  })
  const [newIngredient, setNewIngredient] = useState("")

  // Product types for curly hair
  const productTypes = [
    "Shampoo",
    "Conditioner",
    "Leave-in Conditioner",
    "Deep Conditioner",
    "Protein Treatment",
    "Gel",
    "Mousse",
    "Cream",
    "Oil",
    "Serum",
    "Spray",
    "Clarifying Treatment",
    "Co-wash",
    "Other",
  ]

  // Common ingredients for suggestion
  const commonIngredients = [
    "Sodium Lauryl Sulfate",
    "Sodium Laureth Sulfate",
    "Ammonium Lauryl Sulfate",
    "Ammonium Laureth Sulfate",
  ]

  const findCommonIngredients = (ingredients: string): string[] => {
    return commonIngredients.filter((ingredient: string) => 
      ingredients.toLowerCase().includes(ingredient.toLowerCase())
    );
  };

  // At the beginning of the component, add this check
  const isBrowser = typeof window !== "undefined"

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.brand && newProduct.type) {
      // Safely use browser APIs
      setProducts([...products, { ...newProduct, id: isBrowser ? Date.now() : Math.random() }])
      setNewProduct({
        name: "",
        brand: "",
        type: "",
        ingredients: "",
        keyIngredients: [],
        notes: "",
      })
      setShowAddProduct(false)
    }
  }

  const handleAddIngredient = () => {
    if (newIngredient && !newProduct.keyIngredients.includes(newIngredient)) {
      setNewProduct({
        ...newProduct,
        keyIngredients: [...newProduct.keyIngredients, newIngredient],
      })
      setNewIngredient("")
    }
  }

  const handleRemoveIngredient = (ingredient: string) => {
    setNewProduct({
      ...newProduct,
      keyIngredients: newProduct.keyIngredients.filter((item) => item !== ingredient),
    })
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
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div>
              <Button variant="outline" size="sm" className="mb-4" asChild>
                <Link href="/marketplace/curly-hair" className="flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Marketplace Details
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">Wavy & Curly Hair Journal Setup</h1>
              <p className="text-muted-foreground">Set up your personalized hair care tracking journal</p>
            </div>
            <div className="ml-auto">
              <Button asChild>
                <Link href="/journal/create-entry?template=curly-hair">
                  <Save className="mr-2 h-4 w-4" />
                  Save & Create Journal Entry
                </Link>
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="products">
                <Scissors className="mr-2 h-4 w-4" />
                Product Library
              </TabsTrigger>
              <TabsTrigger value="routines">
                <Tag className="mr-2 h-4 w-4" />
                Routines
              </TabsTrigger>
              <TabsTrigger value="goals">
                <Camera className="mr-2 h-4 w-4" />
                Goals & Tracking
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Your Product Library</CardTitle>
                      <CardDescription>Add all your hair care products to your personal library</CardDescription>
                    </div>
                    <Button onClick={() => setShowAddProduct(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Product
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                      <Scissors className="h-10 w-10 text-muted-foreground/60" />
                      <h3 className="mt-4 text-lg font-medium">No products yet</h3>
                      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                        Start building your product library by adding the hair products you currently use.
                      </p>
                      <Button className="mt-4" onClick={() => setShowAddProduct(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Product
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {products.map((product) => (
                        <Card key={product.id} className="overflow-hidden">
                          <div className="h-2 bg-gradient-to-r from-purple-400 to-purple-600"></div>
                          <CardContent className="p-4">
                            <div className="mb-2 flex items-start justify-between">
                              <div>
                                <h3 className="font-medium">{product.name}</h3>
                                <p className="text-sm text-muted-foreground">{product.brand}</p>
                              </div>
                              <Badge variant="outline">{product.type}</Badge>
                            </div>
                            {product.keyIngredients.length > 0 && (
                              <div className="mt-3">
                                <h4 className="text-xs font-medium text-muted-foreground">Key Ingredients:</h4>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {product.keyIngredients.map((ingredient) => (
                                    <Badge key={ingredient} variant="secondary" className="text-xs">
                                      {ingredient}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {product.notes && (
                              <div className="mt-3">
                                <h4 className="text-xs font-medium text-muted-foreground">Notes:</h4>
                                <p className="text-xs">{product.notes}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>Add details about your hair care product</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="product-name">Product Name</Label>
                        <Input
                          id="product-name"
                          placeholder="e.g., Curl Enhancing Smoothie"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="product-brand">Brand</Label>
                        <Input
                          id="product-brand"
                          placeholder="e.g., SheaMoisture"
                          value={newProduct.brand}
                          onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product-type">Product Type</Label>
                      <Select
                        value={newProduct.type}
                        onValueChange={(value) => setNewProduct({ ...newProduct, type: value })}
                      >
                        <SelectTrigger id="product-type">
                          <SelectValue placeholder="Select product type" />
                        </SelectTrigger>
                        <SelectContent>
                          {productTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product-ingredients">Full Ingredients List (Optional)</Label>
                      <Textarea
                        id="product-ingredients"
                        placeholder="Paste the full ingredients list here..."
                        value={newProduct.ingredients}
                        onChange={(e) => setNewProduct({ ...newProduct, ingredients: e.target.value })}
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Key Ingredients</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Add important ingredients..."
                            value={newIngredient}
                            onChange={(e) => setNewIngredient(e.target.value)}
                            className="pl-8"
                            list="ingredients-list"
                          />
                          <datalist id="ingredients-list">
                            {commonIngredients.map((ingredient) => (
                              <option key={ingredient} value={ingredient} />
                            ))}
                          </datalist>
                        </div>
                        <Button type="button" onClick={handleAddIngredient}>
                          Add
                        </Button>
                      </div>
                      {newProduct.keyIngredients.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {newProduct.keyIngredients.map((ingredient) => (
                            <Badge key={ingredient} variant="secondary" className="flex items-center gap-1">
                              {ingredient}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => handleRemoveIngredient(ingredient)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product-notes">Notes (Optional)</Label>
                      <Textarea
                        id="product-notes"
                        placeholder="Add any notes about this product..."
                        value={newProduct.notes}
                        onChange={(e) => setNewProduct({ ...newProduct, notes: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddProduct(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddProduct}>Add Product</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="routines" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Hair Routines</CardTitle>
                  <CardDescription>Create and save your hair care routines</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                    <Tag className="h-10 w-10 text-muted-foreground/60" />
                    <h3 className="mt-4 text-lg font-medium">No routines yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                      Create your first hair care routine by selecting products from your library and specifying how you
                      use them.
                    </p>
                    <Button className="mt-4" disabled={products.length === 0}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Routine
                    </Button>
                    {products.length === 0 && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        You need to add products to your library first
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="goals" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hair Goals & Tracking</CardTitle>
                  <CardDescription>Set your hair goals and tracking preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>What are your main hair goals?</Label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="goal-definition"
                          className="h-4 w-4 rounded border-gray-300"
                          defaultChecked={false}
                          onChange={() => {}}
                        />
                        <Label htmlFor="goal-definition" className="text-sm font-normal">
                          More curl definition
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="goal-frizz"
                          className="h-4 w-4 rounded border-gray-300"
                          defaultChecked={false}
                          onChange={() => {}}
                        />
                        <Label htmlFor="goal-frizz" className="text-sm font-normal">
                          Reduce frizz
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="goal-moisture"
                          className="h-4 w-4 rounded border-gray-300"
                          defaultChecked={false}
                          onChange={() => {}}
                        />
                        <Label htmlFor="goal-moisture" className="text-sm font-normal">
                          Better moisture balance
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="goal-volume"
                          className="h-4 w-4 rounded border-gray-300"
                          defaultChecked={false}
                          onChange={() => {}}
                        />
                        <Label htmlFor="goal-volume" className="text-sm font-normal">
                          More volume
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="goal-growth"
                          className="h-4 w-4 rounded border-gray-300"
                          defaultChecked={false}
                          onChange={() => {}}
                        />
                        <Label htmlFor="goal-growth" className="text-sm font-normal">
                          Hair growth
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="goal-damage"
                          className="h-4 w-4 rounded border-gray-300"
                          defaultChecked={false}
                          onChange={() => {}}
                        />
                        <Label htmlFor="goal-damage" className="text-sm font-normal">
                          Repair damage
                        </Label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>Environmental factors to track</Label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="track-humidity"
                          className="h-4 w-4 rounded border-gray-300"
                          defaultChecked={true}
                          onChange={() => {}}
                        />
                        <Label htmlFor="track-humidity" className="flex items-center gap-1 text-sm font-normal">
                          <Droplet className="h-4 w-4 text-blue-500" />
                          Humidity
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="track-weather"
                          className="h-4 w-4 rounded border-gray-300"
                          defaultChecked={true}
                          onChange={() => {}}
                        />
                        <Label htmlFor="track-weather" className="flex items-center gap-1 text-sm font-normal">
                          <Wind className="h-4 w-4 text-gray-500" />
                          Weather
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="track-sun"
                          className="h-4 w-4 rounded border-gray-300"
                          defaultChecked={true}
                          onChange={() => {}}
                        />
                        <Label htmlFor="track-sun" className="flex items-center gap-1 text-sm font-normal">
                          <Sun className="h-4 w-4 text-yellow-500" />
                          Sun exposure
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="track-heat"
                          className="h-4 w-4 rounded border-gray-300"
                          defaultChecked={true}
                          onChange={() => {}}
                        />
                        <Label htmlFor="track-heat" className="flex items-center gap-1 text-sm font-normal">
                          <Thermometer className="h-4 w-4 text-red-500" />
                          Heat styling
                        </Label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>Photo tracking preferences</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="photo-before"
                          className="h-4 w-4 rounded border-gray-300"
                          defaultChecked={true}
                          onChange={() => {}}
                        />
                        <Label htmlFor="photo-before" className="text-sm font-normal">
                          Before photos (wet hair)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="photo-after"
                          className="h-4 w-4 rounded border-gray-300"
                          defaultChecked={true}
                          onChange={() => {}}
                        />
                        <Label htmlFor="photo-after" className="text-sm font-normal">
                          After photos (dry hair)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="photo-day2"
                          className="h-4 w-4 rounded border-gray-300"
                          defaultChecked={true}
                          onChange={() => {}}
                        />
                        <Label htmlFor="photo-day2" className="text-sm font-normal">
                          Day 2+ photos (refresh results)
                        </Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/20 px-6 py-4">
                  <Button className="w-full" asChild>
                    <Link href="/journal">
                      <Save className="mr-2 h-4 w-4" />
                      Save & Finish Setup
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

