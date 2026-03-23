import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Upload, Loader2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFileUpload } from "@/hooks/useFileUpload";

interface Variant {
  id?: string;
  variant_name: string;
  variant_type: string;
  price: string;
  stock: string;
}

const ProductManagement = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();
  const { uploadFile, uploading, dimensions } = useFileUpload('product-images');

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image_url: ""
  });

  const [variants, setVariants] = useState<Variant[]>([]);

  useEffect(() => { fetchProducts(); }, []);
  useEffect(() => { filterProducts(); }, [products, searchTerm, categoryFilter]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setProducts(data || []);
      const uniqueCategories = [...new Set(data?.map((p) => p.category).filter(Boolean))] as string[];
      setCategories(uniqueCategories);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];
    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (categoryFilter !== "all") {
      filtered = filtered.filter((product) => product.category === categoryFilter);
    }
    setFilteredProducts(filtered);
  };

  const fetchVariants = async (productId: string) => {
    const { data } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('created_at');
    return (data || []).map((v: any) => ({
      id: v.id,
      variant_name: v.variant_name,
      variant_type: v.variant_type,
      price: String(v.price),
      stock: String(v.stock || 0),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = formData.image_url;
    if (imageFile) {
      const uploadedUrl = await uploadFile(imageFile);
      if (!uploadedUrl) {
        toast({ title: "Error", description: "Failed to upload image", variant: "destructive" });
        return;
      }
      imageUrl = uploadedUrl;
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      image_url: imageUrl,
      price: parseFloat(formData.price),
      category: formData.category,
      stock: parseInt(formData.stock)
    };

    let productId = editingProduct?.id;

    if (editingProduct) {
      const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
    } else {
      const { data, error } = await supabase.from('products').insert([productData]).select().single();
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
      productId = data.id;
    }

    // Save variants
    if (productId) {
      // Delete existing variants
      await supabase.from('product_variants').delete().eq('product_id', productId);
      
      // Insert new variants
      if (variants.length > 0) {
        const variantData = variants.map(v => ({
          product_id: productId,
          variant_name: v.variant_name,
          variant_type: v.variant_type,
          price: parseFloat(v.price),
          stock: parseInt(v.stock) || 0,
        }));
        const { error: vError } = await supabase.from('product_variants').insert(variantData);
        if (vError) {
          toast({ title: "Warning", description: "Product saved but variants failed: " + vError.message, variant: "destructive" });
        }
      }
    }

    toast({ title: "Success", description: editingProduct ? "Product updated" : "Product created" });
    fetchProducts();
    resetForm();
  };

  const handleEdit = async (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      category: product.category || "",
      stock: (product.stock || 0).toString(),
      image_url: product.image_url || ""
    });
    const v = await fetchVariants(product.id);
    setVariants(v);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Product deleted" });
      fetchProducts();
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", price: "", category: "", stock: "", image_url: "" });
    setImageFile(null);
    setEditingProduct(null);
    setVariants([]);
    setIsDialogOpen(false);
  };

  const addVariant = () => {
    setVariants([...variants, { variant_name: "", variant_type: "size", price: formData.price || "0", stock: "0" }]);
  };

  const updateVariant = (index: number, field: keyof Variant, value: string) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  return (
    <Card className="my-[109px]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Product Management</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="sacred" onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Base Price (₹)</Label>
                  <Input id="price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="stock">Base Stock</Label>
                  <Input id="stock" type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required />
                </div>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="image">Product Image</Label>
                <div className="flex gap-2 items-center">
                  <Input id="image" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="flex-1" />
                  {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                </div>
                {dimensions && <p className="text-sm text-muted-foreground mt-1">Image: {dimensions.width}x{dimensions.height}px</p>}
                {formData.image_url && !imageFile && <img src={formData.image_url} alt="Current" className="mt-2 h-20 w-20 object-cover rounded" />}
              </div>

              {/* Variants Section */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-semibold">Product Variants</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                    <Plus className="w-3 h-3 mr-1" /> Add Variant
                  </Button>
                </div>
                {variants.length === 0 && <p className="text-sm text-muted-foreground">No variants. Product will use base price only.</p>}
                {variants.map((v, i) => (
                  <div key={i} className="grid grid-cols-5 gap-2 mb-2 items-end">
                    <div>
                      <Label className="text-xs">Type</Label>
                      <Select value={v.variant_type} onValueChange={(val) => updateVariant(i, 'variant_type', val)}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="size">Size</SelectItem>
                          <SelectItem value="color">Color</SelectItem>
                          <SelectItem value="weight">Weight</SelectItem>
                          <SelectItem value="material">Material</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Name</Label>
                      <Input className="h-9" placeholder="e.g. Large" value={v.variant_name} onChange={(e) => updateVariant(i, 'variant_name', e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs">Price (₹)</Label>
                      <Input className="h-9" type="number" step="0.01" value={v.price} onChange={(e) => updateVariant(i, 'price', e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs">Stock</Label>
                      <Input className="h-9" type="number" value={v.stock} onChange={(e) => updateVariant(i, 'stock', e.target.value)} />
                    </div>
                    <Button type="button" variant="destructive" size="sm" className="h-9" onClick={() => removeVariant(i)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button type="submit" variant="sacred" disabled={uploading}>
                  {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</> : <>{editingProduct ? 'Update' : 'Create'} Product</>}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="px-[21px] mx-[12px]">
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Variants</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>₹{product.price}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <VariantCount productId={product.id} />
                </TableCell>
                <TableCell className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(product)}><Edit className="w-4 h-4" /></Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredProducts.length === 0 && <p className="text-center text-muted-foreground py-8">No products found</p>}
      </CardContent>
    </Card>
  );
};

// Small helper to show variant count
const VariantCount = ({ productId }: { productId: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    supabase.from('product_variants').select('id', { count: 'exact', head: true }).eq('product_id', productId).then(({ count: c }) => setCount(c || 0));
  }, [productId]);
  return count > 0 ? <Badge variant="secondary">{count}</Badge> : <span className="text-muted-foreground text-xs">None</span>;
};

export default ProductManagement;
