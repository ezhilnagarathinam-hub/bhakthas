import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ContributionManagement = () => {
  const [contributions, setContributions] = useState<any[]>([]);
  const [selectedContribution, setSelectedContribution] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const { toast } = useToast();

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

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('temple_contributions')
      .update({ status: 'approved' })
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Contribution approved" });
    fetchContributions();
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from('temple_contributions')
      .update({ status: 'rejected' })
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Contribution rejected" });
    fetchContributions();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Temple Contributions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Temple Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contributions.map((contribution) => (
                <TableRow key={contribution.id}>
                  <TableCell className="font-medium">{contribution.temple_name}</TableCell>
                  <TableCell>{contribution.city}</TableCell>
                  <TableCell>{contribution.state}</TableCell>
                  <TableCell>{getStatusBadge(contribution.status)}</TableCell>
                  <TableCell>{new Date(contribution.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedContribution(contribution);
                          setViewDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {contribution.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleApprove(contribution.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleReject(contribution.id)}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedContribution?.temple_name}</DialogTitle>
          </DialogHeader>
          {selectedContribution && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">Description</h4>
                <p className="text-muted-foreground">{selectedContribution.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-1">Address</h4>
                  <p className="text-muted-foreground">{selectedContribution.address || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">City</h4>
                  <p className="text-muted-foreground">{selectedContribution.city}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">State</h4>
                  <p className="text-muted-foreground">{selectedContribution.state}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Status</h4>
                  {getStatusBadge(selectedContribution.status)}
                </div>
              </div>
              {selectedContribution.media_url && (
                <div>
                  <h4 className="font-semibold mb-2">Media</h4>
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
    </>
  );
};

export default ContributionManagement;
