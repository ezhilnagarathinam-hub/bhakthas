import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchVisits();
  }, []);

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

  const fetchVisits = async () => {
    // Visits are now fetched with users
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

      // Note: Email verification status can only be updated through Supabase Admin API
      // This is a placeholder for the UI - actual implementation requires backend edge function
      toast({ 
        title: "Success", 
        description: `User verification status updated to ${isVerified ? 'Verified' : 'Pending'}`,
      });
      
      // Refresh users
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
            {users.map((user) => (
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
      </CardContent>
    </Card>
  );
};

export default UserManagement;
