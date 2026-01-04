import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, verificationFilter]);

  const fetchUsers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({ title: "Error", description: "Authentication required", variant: "destructive" });
        return;
      }

      const { data, error } = await supabase.functions.invoke('admin-list-users', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setUsers(data.users || []);
      setVisits(data.visits || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to fetch users", variant: "destructive" });
    }
  };

  const filterUsers = () => {
    let filtered = [...users];
    
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (verificationFilter !== "all") {
      filtered = filtered.filter(user => {
        if (verificationFilter === "verified") return user.email_confirmed_at;
        return !user.email_confirmed_at;
      });
    }
    
    setFilteredUsers(filtered);
  };

  const getUserPoints = (userId: string) => {
    return visits
      .filter(v => v.user_id === userId)
      .reduce((sum, v) => sum + (v.points_earned || 0), 0);
  };

  const updateVerificationStatus = async (userId: string, isVerified: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({ title: "Error", description: "Authentication required", variant: "destructive" });
        return;
      }

      toast({ 
        title: "Success", 
        description: `User verification status updated to ${isVerified ? 'Verified' : 'Pending'}`,
      });
      
      fetchUsers();
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update verification status", 
        variant: "destructive" 
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <div className="flex gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={verificationFilter} onValueChange={setVerificationFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Bhakthi Points</TableHead>
              <TableHead>Verification Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{getUserPoints(user.id)} points</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={user.email_confirmed_at ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {user.email_confirmed_at ? 'Verified' : 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Select 
                    value={user.email_confirmed_at ? 'verified' : 'pending'}
                    onValueChange={(value) => updateVerificationStatus(user.id, value === 'verified')}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredUsers.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No users found</p>
        )}
      </CardContent>
    </Card>
  );
};

export default UserManagement;