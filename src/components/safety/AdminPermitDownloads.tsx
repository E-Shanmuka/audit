import React, { useState, useEffect } from 'react';
import { useSafety } from '@/contexts/SafetyContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Loader2, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';

interface Permit {
  _id: string;
  permitNumber: string;
  templateId: any;
  userId: any;
  status: string;
  createdAt: string;
}

const AdminPermitDownloads: React.FC = () => {
  const { currentUser } = useSafety();
  const [permits, setPermits] = useState<Permit[]>([]);
  const [filteredPermits, setFilteredPermits] = useState<Permit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchPermits();
  }, []);

  useEffect(() => {
    let filtered = permits;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.permitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.templateId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.userId?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    setFilteredPermits(filtered);
  }, [permits, searchTerm, statusFilter]);

  const fetchPermits = async () => {
    try {
      const response = await fetch('/api/permits/admin/all', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('sms.token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPermits(data.permits);
        setFilteredPermits(data.permits);
      }
    } catch (error) {
      console.error('Failed to fetch permits:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch permits.',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  const downloadPermitPdf = async (permitId: string, permitNumber: string) => {
    try {
      const response = await fetch(`/api/permits/${permitId}/pdf`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('sms.token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${permitNumber}_${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Permit downloaded successfully.',
      });
    } catch (error) {
      console.error('Failed to download permit PDF:', error);
      toast({
        title: 'Download failed',
        description: 'Unable to download permit PDF.',
        variant: 'destructive',
      });
    }
  };

  const downloadAllByStatus = async () => {
    try {
      const status = statusFilter === 'all' ? '' : statusFilter;
      const response = await fetch(`/api/permits/admin/export-zip${status ? `?status=${status}` : ''}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('sms.token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `permits_${status || 'all'}_${new Date().getTime()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Permits exported successfully.',
      });
    } catch (error) {
      console.error('Failed to export permits:', error);
      toast({
        title: 'Export failed',
        description: 'Unable to export permits.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'approved') return <Badge className="bg-green-500">Approved</Badge>;
    if (status === 'rejected') return <Badge variant="destructive">Rejected</Badge>;
    if (status === 'pending') return <Badge variant="secondary">Pending</Badge>;
    return <Badge variant="secondary">{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold">Permit Forms Download</h2>
        </div>
        <Button onClick={downloadAllByStatus} disabled={filteredPermits.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Download All as ZIP
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <Input
                placeholder="Search permits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredPermits.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No permits found</h3>
              <p className="text-muted-foreground">No permits match your search criteria.</p>
            </CardContent>
          </Card>
        ) : (
          filteredPermits.map(permit => (
            <Card key={permit._id}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{permit.permitNumber}</h3>
                      {getStatusBadge(permit.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Template: {permit.templateId?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Submitted by: {permit.userId?.name} • {format(new Date(permit.createdAt), 'PPP p')}
                    </p>
                  </div>
                  <Button
                    onClick={() => downloadPermitPdf(permit._id, permit.permitNumber)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPermitDownloads;
