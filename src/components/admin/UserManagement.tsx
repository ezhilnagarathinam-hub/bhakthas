import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
              <TableHead>Status</TableHead>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
