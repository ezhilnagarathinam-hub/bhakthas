import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const PromoCodeManagement = () => {
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState<any>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    code: "",
    discount_percent: "",
    valid_from: "",
    valid_until: "",
    max_uses: "",
    is_active: true
  });

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setPromoCodes(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const promoCodeData = {
      code: formData.code.toUpperCase(),
      discount_percent: parseInt(formData.discount_percent),
      valid_from: formData.valid_from || null,
      valid_until: formData.valid_until || null,
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      is_active: formData.is_active
    };

    if (editingPromoCode) {
      const { error } = await supabase
        .from('promo_codes')
        .update(promoCodeData)
        .eq('id', editingPromoCode.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Promo code updated successfully" });
        fetchPromoCodes();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('promo_codes')
        .insert([promoCodeData]);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Promo code created successfully" });
        fetchPromoCodes();
        resetForm();
      }
    }
  };

  const handleEdit = (promoCode: any) => {
    setEditingPromoCode(promoCode);
    setFormData({
      code: promoCode.code,
      discount_percent: promoCode.discount_percent.toString(),
      valid_from: promoCode.valid_from ? format(new Date(promoCode.valid_from), 'yyyy-MM-dd') : "",
      valid_until: promoCode.valid_until ? format(new Date(promoCode.valid_until), 'yyyy-MM-dd') : "",
      max_uses: promoCode.max_uses?.toString() || "",
      is_active: promoCode.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;

    const { error } = await supabase
      .from('promo_codes')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Promo code deleted successfully" });
      fetchPromoCodes();
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('promo_codes')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ 
        title: "Success", 
        description: `Promo code ${!currentStatus ? 'activated' : 'deactivated'} successfully` 
      });
      fetchPromoCodes();
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      discount_percent: "",
      valid_from: "",
      valid_until: "",
      max_uses: "",
      is_active: true
    });
    setEditingPromoCode(null);
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Promo Code Management</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="sacred" onClick={() => { resetForm(); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Promo Code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPromoCode ? 'Edit Promo Code' : 'Create New Promo Code'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="code">Promo Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., DIWALI25"
                  required
                />
              </div>
              <div>
                <Label htmlFor="discount_percent">Discount Percentage (%)</Label>
                <Input
                  id="discount_percent"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.discount_percent}
                  onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valid_from">Valid From</Label>
                  <Input
                    id="valid_from"
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="valid_until">Valid Until</Label>
                  <Input
                    id="valid_until"
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="max_uses">Max Uses (leave empty for unlimited)</Label>
                <Input
                  id="max_uses"
                  type="number"
                  min="1"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="sacred">
                  {editingPromoCode ? 'Update' : 'Create'} Promo Code
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Valid From</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Uses</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promoCodes.map((promo) => (
              <TableRow key={promo.id}>
                <TableCell className="font-medium">{promo.code}</TableCell>
                <TableCell>{promo.discount_percent}%</TableCell>
                <TableCell>
                  {promo.valid_from ? format(new Date(promo.valid_from), 'dd/MM/yyyy') : 'N/A'}
                </TableCell>
                <TableCell>
                  {promo.valid_until ? format(new Date(promo.valid_until), 'dd/MM/yyyy') : 'N/A'}
                </TableCell>
                <TableCell>
                  {promo.current_uses || 0} / {promo.max_uses || '∞'}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={promo.is_active}
                    onCheckedChange={() => toggleActive(promo.id, promo.is_active)}
                  />
                </TableCell>
                <TableCell className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(promo)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(promo.id)}>
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

export default PromoCodeManagement;
