import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const TempleManagement = () => {
  const [temples, setTemples] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemple, setEditingTemple] = useState<any>(null);
  const [darshanPackages, setDarshanPackages] = useState<any[]>([]);
  const [showDarshanConfig, setShowDarshanConfig] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    latitude: "",
    longitude: "",
    quick_info: "",
    image_url: "",
    rating: "4.5",
    points: "100",
    darshan_enabled: false
  });

  const [packageFormData, setPackageFormData] = useState({
    package_name: "",
    package_type: "",
    price: "",
    description: "",
    duration_minutes: "30"
  });

  useEffect(() => {
    fetchTemples();
  }, []);

  const fetchTemples = async () => {
    const { data, error } = await supabase
      .from('temples')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setTemples(data || []);
    }
  };

  const fetchDarshanPackages = async (templeId: string) => {
    const { data, error } = await supabase
      .from('darshan_packages')
      .select('*')
      .eq('temple_id', templeId);

    if (!error && data) {
      setDarshanPackages(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const templeData = {
      ...formData,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      rating: parseFloat(formData.rating),
      points: parseInt(formData.points)
    };

    if (editingTemple) {
      const { error } = await supabase
        .from('temples')
        .update(templeData)
        .eq('id', editingTemple.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Temple updated successfully" });
        fetchTemples();
        if (!formData.darshan_enabled) {
          resetForm();
        }
      }
    } else {
      const { data, error } = await supabase
        .from('temples')
        .insert([templeData])
        .select();

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Temple created successfully" });
        if (formData.darshan_enabled && data && data[0]) {
          setEditingTemple(data[0]);
          setShowDarshanConfig(true);
        } else {
          fetchTemples();
          resetForm();
        }
      }
    }
  };

  const handleAddDarshanPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTemple) return;

    const packageData = {
      temple_id: editingTemple.id,
      ...packageFormData,
      price: parseFloat(packageFormData.price),
      duration_minutes: parseInt(packageFormData.duration_minutes)
    };

    const { error } = await supabase
      .from('darshan_packages')
      .insert([packageData]);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Darshan package added" });
      fetchDarshanPackages(editingTemple.id);
      setPackageFormData({
        package_name: "",
        package_type: "",
        price: "",
        description: "",
        duration_minutes: "30"
      });
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    const { error } = await supabase
      .from('darshan_packages')
      .delete()
      .eq('id', packageId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Package deleted" });
      if (editingTemple) {
        fetchDarshanPackages(editingTemple.id);
      }
    }
  };

  const handleEdit = (temple: any) => {
    setEditingTemple(temple);
    setFormData({
      name: temple.name,
      description: temple.description || "",
      address: temple.address || "",
      city: temple.city || "",
      state: temple.state || "",
      country: temple.country || "India",
      latitude: temple.latitude.toString(),
      longitude: temple.longitude.toString(),
      quick_info: temple.quick_info || "",
      image_url: temple.image_url || "",
      rating: temple.rating?.toString() || "4.5",
      points: temple.points?.toString() || "100",
      darshan_enabled: temple.darshan_enabled || false
    });
    if (temple.darshan_enabled) {
      fetchDarshanPackages(temple.id);
    }
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this temple?')) return;

    const { error } = await supabase
      .from('temples')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Temple deleted successfully" });
      fetchTemples();
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      address: "",
      city: "",
      state: "",
      country: "India",
      latitude: "",
      longitude: "",
      quick_info: "",
      image_url: "",
      rating: "4.5",
      points: "100",
      darshan_enabled: false
    });
    setEditingTemple(null);
    setIsDialogOpen(false);
    setShowDarshanConfig(false);
    setDarshanPackages([]);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Temple Management</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="sacred" onClick={() => { resetForm(); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Temple
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTemple ? 'Edit Temple' : 'Add New Temple'}</DialogTitle>
            </DialogHeader>

            {!showDarshanConfig ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Temple Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="quick_info">Quick Info (1-liner)</Label>
                  <Input
                    id="quick_info"
                    value={formData.quick_info}
                    onChange={(e) => setFormData({ ...formData, quick_info: e.target.value })}
                    placeholder="A brief one-liner about this temple"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rating">Rating</Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="points">Points</Label>
                    <Input
                      id="points"
                      type="number"
                      value={formData.points}
                      onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                    />
                  </div>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="darshan_enabled">Enable Darshan Services</Label>
                      <p className="text-sm text-muted-foreground">Allow users to book darshan at this temple</p>
                    </div>
                    <Switch
                      id="darshan_enabled"
                      checked={formData.darshan_enabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, darshan_enabled: checked })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" variant="sacred">
                    {editingTemple ? 'Update' : 'Create'} Temple
                  </Button>
                  {formData.darshan_enabled && editingTemple && (
                    <Button type="button" variant="outline" onClick={() => {
                      setShowDarshanConfig(true);
                      fetchDarshanPackages(editingTemple.id);
                    }}>
                      <Package className="w-4 h-4 mr-2" />
                      Manage Packages
                    </Button>
                  )}
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Darshan Packages for {editingTemple?.name}</h3>
                  
                  <form onSubmit={handleAddDarshanPackage} className="space-y-4 border rounded-lg p-4 mb-4">
                    <h4 className="font-medium">Add New Package</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="package_name">Package Name</Label>
                        <Input
                          id="package_name"
                          value={packageFormData.package_name}
                          onChange={(e) => setPackageFormData({ ...packageFormData, package_name: e.target.value })}
                          placeholder="e.g., VIP Darshan"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="package_type">Package Type</Label>
                        <Input
                          id="package_type"
                          value={packageFormData.package_type}
                          onChange={(e) => setPackageFormData({ ...packageFormData, package_type: e.target.value })}
                          placeholder="e.g., vip_darshan"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={packageFormData.price}
                          onChange={(e) => setPackageFormData({ ...packageFormData, price: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={packageFormData.duration_minutes}
                          onChange={(e) => setPackageFormData({ ...packageFormData, duration_minutes: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="package_description">Description</Label>
                      <Textarea
                        id="package_description"
                        value={packageFormData.description}
                        onChange={(e) => setPackageFormData({ ...packageFormData, description: e.target.value })}
                        placeholder="Describe what's included in this package"
                      />
                    </div>
                    <Button type="submit" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Package
                    </Button>
                  </form>

                  <div className="space-y-2">
                    <h4 className="font-medium">Existing Packages</h4>
                    {darshanPackages.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No packages added yet</p>
                    ) : (
                      <div className="space-y-2">
                        {darshanPackages.map((pkg) => (
                          <Card key={pkg.id}>
                            <CardContent className="p-4 flex items-center justify-between">
                              <div>
                                <h5 className="font-medium">{pkg.package_name}</h5>
                                <p className="text-sm text-muted-foreground">{pkg.description}</p>
                                <div className="flex gap-2 mt-2">
                                  <Badge>₹{pkg.price}</Badge>
                                  <Badge variant="outline">{pkg.duration_minutes} mins</Badge>
                                </div>
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeletePackage(pkg.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => setShowDarshanConfig(false)} variant="outline">
                    Back to Temple Details
                  </Button>
                  <Button onClick={resetForm}>
                    Done
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>City</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Darshan</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {temples.map((temple) => (
              <TableRow key={temple.id}>
                <TableCell className="font-medium">{temple.name}</TableCell>
                <TableCell>{temple.city}</TableCell>
                <TableCell>{temple.state}</TableCell>
                <TableCell>{temple.rating}</TableCell>
                <TableCell>
                  {temple.darshan_enabled ? (
                    <Badge variant="secondary">Enabled</Badge>
                  ) : (
                    <Badge variant="outline">Disabled</Badge>
                  )}
                </TableCell>
                <TableCell className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(temple)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(temple.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TempleManagement;
