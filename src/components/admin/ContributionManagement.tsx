import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Eye, Edit, Trash2, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ContributionManagement = () => {
  const [contributions, setContributions] = useState<any[]>([]);
  const [selectedContribution, setSelectedContribution] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contributionToDelete, setContributionToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const [editFormData, setEditFormData] = useState({
    temple_name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    latitude: "",
    longitude: ""
  });

  useEffect(() => {
    fetchContributions();
  }, []);

  const fetchContributions = async () => {
    const { data, error } = await supabase
      .from('temple_contributions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    setContributions(data || []);
  };

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase
      .from('temple_contributions')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: `Contribution status updated to ${status}` });
    fetchContributions();
  };

  const handleEdit = (contribution: any) => {
    setSelectedContribution(contribution);
    setEditFormData({
      temple_name: contribution.temple_name,
      description: contribution.description,
      address: contribution.address || "",
      city: contribution.city,
      state: contribution.state,
      latitude: contribution.latitude?.toString() || "",
      longitude: contribution.longitude?.toString() || ""
    });
    setEditDialogOpen(true);
  };

  const handleUpdateContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updateData = {
      ...editFormData,
      latitude: editFormData.latitude ? parseFloat(editFormData.latitude) : null,
      longitude: editFormData.longitude ? parseFloat(editFormData.longitude) : null
    };

    const { error } = await supabase
      .from('temple_contributions')
      .update(updateData)
      .eq('id', selectedContribution.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Contribution updated successfully" });
    setEditDialogOpen(false);
    fetchContributions();
  };

  const handleDelete = async () => {
    if (!contributionToDelete) return;

    const { error } = await supabase
      .from('temple_contributions')
      .delete()
      .eq('id', contributionToDelete);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Contribution deleted successfully" });
    setDeleteDialogOpen(false);
    setContributionToDelete(null);
    fetchContributions();
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      contributions.map(c => ({
        'Temple Name': c.temple_name,
        'City': c.city,
        'State': c.state,
        'Status': c.status,
        'Description': c.description,
        'Submitted': new Date(c.created_at).toLocaleDateString()
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contributions');
    XLSX.writeFile(workbook, 'temple_contributions.xlsx');
    toast({ title: "Success", description: "Data exported to Excel" });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Temple Contributions', 14, 15);
    
    autoTable(doc, {
      head: [['Temple Name', 'City', 'State', 'Status', 'Submitted']],
      body: contributions.map(c => [
        c.temple_name,
        c.city,
        c.state,
        c.status,
        new Date(c.created_at).toLocaleDateString()
      ]),
      startY: 20
    });
    
    doc.save('temple_contributions.pdf');
    toast({ title: "Success", description: "Data exported to PDF" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600 text-white">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-600 text-white">Rejected</Badge>;
      case 'waiting':
        return <Badge className="bg-blue-600 text-white">Waiting for User</Badge>;
      default:
        return <Badge className="bg-yellow-600 text-white">Pending</Badge>;
    }
  };

  return (
    <>
      <Card className="bg-white border-admin-border shadow-divine">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-admin-text">Temple Contributions</CardTitle>
          <div className="flex gap-2">
            <Button onClick={exportToExcel} size="sm" variant="outline" className="border-admin-border text-admin-accent-light">
              <Download className="w-4 h-4 mr-2" />
              Excel
            </Button>
            <Button onClick={exportToPDF} size="sm" variant="outline" className="border-admin-border text-admin-accent-light">
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-admin-border">
                <TableHead className="text-admin-text-muted">Temple Name</TableHead>
                <TableHead className="text-admin-text-muted">City</TableHead>
                <TableHead className="text-admin-text-muted">State</TableHead>
                <TableHead className="text-admin-text-muted">Status</TableHead>
                <TableHead className="text-admin-text-muted">Submitted</TableHead>
                <TableHead className="text-admin-text-muted">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contributions.map((contribution) => (
                <TableRow key={contribution.id} className="border-admin-border">
                  <TableCell className="font-medium text-admin-text">{contribution.temple_name}</TableCell>
                  <TableCell className="text-admin-text-muted">{contribution.city}</TableCell>
                  <TableCell className="text-admin-text-muted">{contribution.state}</TableCell>
                  <TableCell>
                    <Select
                      value={contribution.status}
                      onValueChange={(value) => handleStatusChange(contribution.id, value)}
                    >
                      <SelectTrigger className="w-36 bg-admin-bg border-admin-border text-admin-text">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-admin-surface border-admin-border">
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="waiting">Waiting for User</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-admin-text-muted">{new Date(contribution.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedContribution(contribution);
                          setViewDialogOpen(true);
                        }}
                        className="border-admin-border text-admin-accent-light hover:bg-admin-bg"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(contribution)}
                        className="border-admin-border text-blue-400 hover:bg-admin-bg"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setContributionToDelete(contribution.id);
                          setDeleteDialogOpen(true);
                        }}
                        className="border-admin-border text-red-400 hover:bg-admin-bg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl bg-admin-surface border-admin-border">
          <DialogHeader>
            <DialogTitle className="text-admin-text">{selectedContribution?.temple_name}</DialogTitle>
          </DialogHeader>
          {selectedContribution && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1 text-admin-text">Description</h4>
                <p className="text-admin-text-muted">{selectedContribution.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-1 text-admin-text">Address</h4>
                  <p className="text-admin-text-muted">{selectedContribution.address || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-admin-text">City</h4>
                  <p className="text-admin-text-muted">{selectedContribution.city}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-admin-text">State</h4>
                  <p className="text-admin-text-muted">{selectedContribution.state}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-admin-text">Status</h4>
                  {getStatusBadge(selectedContribution.status)}
                </div>
              </div>
              {selectedContribution.media_url && (
                <div>
                  <h4 className="font-semibold mb-2 text-admin-text">Media</h4>
                  {selectedContribution.media_url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                    <img src={selectedContribution.media_url} alt="Temple" className="w-full rounded-lg" />
                  ) : (
                    <video src={selectedContribution.media_url} controls className="w-full rounded-lg" />
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-admin-surface border-admin-border">
          <DialogHeader>
            <DialogTitle className="text-admin-text">Edit Contribution</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateContribution} className="space-y-4">
            <div>
              <Label htmlFor="temple_name" className="text-admin-text">Temple Name</Label>
              <Input
                id="temple_name"
                value={editFormData.temple_name}
                onChange={(e) => setEditFormData({ ...editFormData, temple_name: e.target.value })}
                required
                className="bg-admin-bg border-admin-border text-admin-text"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-admin-text">Description</Label>
              <Textarea
                id="description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                required
                className="bg-admin-bg border-admin-border text-admin-text"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city" className="text-admin-text">City</Label>
                <Input
                  id="city"
                  value={editFormData.city}
                  onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                  required
                  className="bg-admin-bg border-admin-border text-admin-text"
                />
              </div>
              <div>
                <Label htmlFor="state" className="text-admin-text">State</Label>
                <Input
                  id="state"
                  value={editFormData.state}
                  onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                  required
                  className="bg-admin-bg border-admin-border text-admin-text"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address" className="text-admin-text">Address</Label>
              <Input
                id="address"
                value={editFormData.address}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                className="bg-admin-bg border-admin-border text-admin-text"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude" className="text-admin-text">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={editFormData.latitude}
                  onChange={(e) => setEditFormData({ ...editFormData, latitude: e.target.value })}
                  className="bg-admin-bg border-admin-border text-admin-text"
                />
              </div>
              <div>
                <Label htmlFor="longitude" className="text-admin-text">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={editFormData.longitude}
                  onChange={(e) => setEditFormData({ ...editFormData, longitude: e.target.value })}
                  className="bg-admin-bg border-admin-border text-admin-text"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} className="border-admin-border text-admin-text-muted">
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-sacred text-white">
                Update
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-admin-surface border-admin-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-admin-text">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-admin-text-muted">
              Are you sure you want to delete this contribution? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-admin-border text-admin-text-muted">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ContributionManagement;
