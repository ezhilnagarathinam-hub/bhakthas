import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Trophy, Plus, Edit, Trash2, Check, X, Clock } from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: string | null;
  deadline: string | null;
  is_active: boolean;
  created_at: string;
}

interface ChallengeSubmission {
  id: string;
  challenge_id: string;
  name: string;
  email: string;
  phone: string;
  message: string | null;
  status: string;
  created_at: string;
  challenges?: Challenge;
}

const ChallengeManagement = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [submissions, setSubmissions] = useState<ChallengeSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reward: "",
    deadline: "",
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [challengesRes, submissionsRes] = await Promise.all([
      supabase.from('challenges').select('*').order('created_at', { ascending: false }),
      supabase.from('challenge_submissions').select('*, challenges(*)').order('created_at', { ascending: false })
    ]);

    if (challengesRes.data) setChallenges(challengesRes.data);
    if (submissionsRes.data) setSubmissions(submissionsRes.data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      title: formData.title,
      description: formData.description,
      reward: formData.reward || null,
      deadline: formData.deadline || null,
      is_active: formData.is_active
    };

    let error;
    if (editingChallenge) {
      ({ error } = await supabase.from('challenges').update(payload).eq('id', editingChallenge.id));
    } else {
      ({ error } = await supabase.from('challenges').insert(payload));
    }

    if (error) {
      toast({ title: "Error", description: "Failed to save challenge", variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Challenge ${editingChallenge ? 'updated' : 'created'} successfully` });
      setDialogOpen(false);
      resetForm();
      fetchData();
    }
  };

  const deleteChallenge = async (id: string) => {
    const { error } = await supabase.from('challenges').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete challenge", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Challenge deleted" });
      fetchData();
    }
  };

  const updateSubmissionStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('challenge_submissions').update({ status }).eq('id', id);
    if (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Status updated to ${status}` });
      fetchData();
    }
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", reward: "", deadline: "", is_active: true });
    setEditingChallenge(null);
  };

  const openEdit = (challenge: Challenge) => {
    setEditingChallenge(challenge);
    setFormData({
      title: challenge.title,
      description: challenge.description,
      reward: challenge.reward || "",
      deadline: challenge.deadline || "",
      is_active: challenge.is_active
    });
    setDialogOpen(true);
  };

  const filteredSubmissions = submissions.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-500"><Check className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'rejected': return <Badge className="bg-red-500"><X className="w-3 h-3 mr-1" />Rejected</Badge>;
      default: return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <Tabs defaultValue="challenges" className="space-y-6">
      <TabsList>
        <TabsTrigger value="challenges">Challenges ({challenges.length})</TabsTrigger>
        <TabsTrigger value="submissions">Submissions ({submissions.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="challenges">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Manage Challenges
            </CardTitle>
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" />Add Challenge</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingChallenge ? 'Edit' : 'Create'} Challenge</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Description *</Label>
                    <Textarea required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label>Reward</Label>
                    <Input value={formData.reward} onChange={(e) => setFormData({ ...formData, reward: e.target.value })} placeholder="e.g., 500 Bhakthi Points" />
                  </div>
                  <div className="space-y-2">
                    <Label>Deadline</Label>
                    <Input type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                  <Button type="submit" className="w-full">{editingChallenge ? 'Update' : 'Create'} Challenge</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {challenges.map((challenge) => (
                    <TableRow key={challenge.id}>
                      <TableCell className="font-medium">{challenge.title}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{challenge.description}</TableCell>
                      <TableCell>{challenge.reward || '-'}</TableCell>
                      <TableCell>{challenge.deadline ? new Date(challenge.deadline).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>
                        <Badge variant={challenge.is_active ? "default" : "secondary"}>
                          {challenge.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEdit(challenge)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600" onClick={() => deleteChallenge(challenge.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="submissions">
        <Card>
          <CardHeader>
            <CardTitle>Challenge Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by name, email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Challenge</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">{submission.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{submission.email}</div>
                          <div className="text-muted-foreground">{submission.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>{submission.challenges?.title || '-'}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{submission.message || '-'}</TableCell>
                      <TableCell>{getStatusBadge(submission.status)}</TableCell>
                      <TableCell>{new Date(submission.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="text-green-600" onClick={() => updateSubmissionStatus(submission.id, 'completed')}>
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600" onClick={() => updateSubmissionStatus(submission.id, 'rejected')}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredSubmissions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No submissions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ChallengeManagement;
