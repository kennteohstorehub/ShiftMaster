'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { ALLOWED_USERS } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Crown, User, Mail, Plus, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function UserManagement() {
  const { isSuperAdmin } = useAuth();
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'user'>('user');

  // Only super admins can access this component
  if (!isSuperAdmin) {
    return (
      <Alert>
        <Crown className="h-4 w-4" />
        <AlertDescription>
          Only super administrators can manage users.
        </AlertDescription>
      </Alert>
    );
  }

  const handleAddUser = () => {
    // Note: In a real application, this would make an API call to update the database
    // For now, this is just a UI demonstration
    console.log('Would add user:', newUserEmail, 'with role:', newUserRole);
    setNewUserEmail('');
    setNewUserRole('user');
  };

  const handleRemoveUser = (email: string) => {
    // Note: In a real application, this would make an API call to update the database
    console.log('Would remove user:', email);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin':
        return <User className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'default';
      case 'admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Manage authorized users and their access levels. Only super administrators can modify user access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Users List */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Authorized Users</Label>
            <div className="space-y-2">
              {Object.entries(ALLOWED_USERS).map(([email, { role }]) => (
                <div key={email} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getRoleIcon(role)}
                    <div>
                      <p className="text-sm font-medium">{email}</p>
                      <Badge variant={getRoleBadgeVariant(role)} className="text-xs">
                        {role.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  {role !== 'super_admin' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveUser(email)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Add New User */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Add New User</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
              </div>
              <Select value={newUserRole} onValueChange={(value: 'admin' | 'user') => setNewUserRole(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleAddUser}
                disabled={!newUserEmail || !newUserEmail.includes('@')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> This is a demonstration interface. In a production environment, 
              user management would be handled through a secure API with proper database persistence.
              Currently, authorized users are defined in the code configuration.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
} 