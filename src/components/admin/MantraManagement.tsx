import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFileUpload } from "@/hooks/useFileUpload";

const MantraManagement = () => {
  const [mantras, setMantras] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMantra, setEditingMantra] = useState<any>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const { toast } = useToast();
  const { uploadFile, uploading } = useFileUpload('mantra-audio');

  const [formData, setFormData] = useState({
    title: "",
    sanskrit_text: "",
    transliteration: "",
    translation: "",
    benefits: "",
    deity: "",
    category: "",
    audio_url: ""
  });

  useEffect(() => {
    fetchMantras();
  }, []);

  const fetchMantras = async () => {
    const { data, error } = await supabase
      .from('mantras')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setMantras(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let audioUrl = formData.audio_url;

    // Upload new audio if selected
    if (audioFile) {
      const uploadedUrl = await uploadFile(audioFile);
      if (!uploadedUrl) {
        toast({ title: "Error", description: "Failed to upload audio", variant: "destructive" });
        return;
      }
      audioUrl = uploadedUrl;
    }

    const mantraData = {
      ...formData,
      audio_url: audioUrl
    };

    if (editingMantra) {
      const { error } = await supabase
        .from('mantras')
        .update(mantraData)
        .eq('id', editingMantra.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Mantra updated successfully" });
        fetchMantras();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('mantras')
        .insert([mantraData]);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Mantra created successfully" });
        fetchMantras();
        resetForm();
      }
    }
  };

  const handleEdit = (mantra: any) => {
    setEditingMantra(mantra);
    setFormData({
      title: mantra.title,
      sanskrit_text: mantra.sanskrit_text,
      transliteration: mantra.transliteration || "",
      translation: mantra.translation || "",
      benefits: mantra.benefits || "",
      deity: mantra.deity || "",
      category: mantra.category || "",
      audio_url: mantra.audio_url || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mantra?')) return;

    const { error } = await supabase
      .from('mantras')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Mantra deleted successfully" });
      fetchMantras();
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      sanskrit_text: "",
      transliteration: "",
      translation: "",
      benefits: "",
      deity: "",
      category: "",
      audio_url: ""
    });
    setAudioFile(null);
    setEditingMantra(null);
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Mantra Management</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="sacred" onClick={() => { resetForm(); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Mantra
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingMantra ? 'Edit Mantra' : 'Add New Mantra'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Mantra Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="sanskrit_text">Sanskrit Text</Label>
                <Textarea
                  id="sanskrit_text"
                  value={formData.sanskrit_text}
                  onChange={(e) => setFormData({ ...formData, sanskrit_text: e.target.value })}
                  required
                  className="font-sanskrit"
                />
              </div>
              <div>
                <Label htmlFor="transliteration">Transliteration</Label>
                <Textarea
                  id="transliteration"
                  value={formData.transliteration}
                  onChange={(e) => setFormData({ ...formData, transliteration: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="translation">Translation</Label>
                <Textarea
                  id="translation"
                  value={formData.translation}
                  onChange={(e) => setFormData({ ...formData, translation: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="benefits">Benefits</Label>
                <Textarea
                  id="benefits"
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deity">Deity</Label>
                  <Input
                    id="deity"
                    value={formData.deity}
                    onChange={(e) => setFormData({ ...formData, deity: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="audio">Audio File</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="audio"
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                </div>
                {formData.audio_url && !audioFile && (
                  <audio controls src={formData.audio_url} className="mt-2 w-full" />
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="sacred" disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>{editingMantra ? 'Update' : 'Create'} Mantra</>
                  )}
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
              <TableHead>Title</TableHead>
              <TableHead>Deity</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mantras.map((mantra) => (
              <TableRow key={mantra.id}>
                <TableCell className="font-medium">{mantra.title}</TableCell>
                <TableCell>{mantra.deity}</TableCell>
                <TableCell>{mantra.category}</TableCell>
                <TableCell className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(mantra)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(mantra.id)}>
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

export default MantraManagement;
