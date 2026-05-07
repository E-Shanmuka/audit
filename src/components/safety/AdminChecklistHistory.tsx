import React, { useState, useEffect } from 'react';
import { useSafety } from '@/contexts/SafetyContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Loader2, FileText, Download, Search } from 'lucide-react';
import { format } from 'date-fns';

interface ChecklistRecord {
  _id: string;
  checklistId: any;
  checklistTitle: string;
  machineCode: string;
  userName: string;
  createdAt: string;
  auditDate: string;
  answers: any;
  status: string;
}

const AdminChecklistHistory: React.FC = () => {
  const { currentUser, machines } = useSafety();
  const [records, setRecords] = useState<ChecklistRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<ChecklistRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [machineFilter, setMachineFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');


  useEffect(() => {
    fetchChecklistRecords();
  }, []);

  useEffect(() => {
    let filtered = records;
    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.checklistTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.machineCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (machineFilter) {
      filtered = filtered.filter(r => r.machineCode === machineFilter);
    }
    
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      filtered = filtered.filter(r => new Date(r.auditDate || r.createdAt) >= from);
    }
    
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter(r => new Date(r.auditDate || r.createdAt) <= to);
    }
    
    setFilteredRecords(filtered);
  }, [records, searchTerm, machineFilter, dateFrom, dateTo]);

  const fetchChecklistRecords = async () => {
    try {
      const response = await fetch('/api/checklists/history', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('sms.token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records || []);
        setFilteredRecords(data.records || []);
      }
    } catch (error) {
      console.error('Failed to fetch checklist records:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch checklist history.',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  const downloadChecklistPdf = async (recordId: string, checklistName: string) => {
    try {
      const response = await fetch(`/api/checklists/${recordId}/export-pdf`, {
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
      link.download = `${checklistName}_${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Checklist downloaded successfully.',
      });
    } catch (error) {
      console.error('Failed to download checklist PDF:', error);
      toast({
        title: 'Download failed',
        description: 'Unable to download checklist PDF.',
        variant: 'destructive',
      });
    }
  };

  const downloadAllAsCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (machineFilter) params.append('machineCode', machineFilter);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      
      const response = await fetch(`/api/checklists/history/export-csv?${params}`, {
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
      link.download = `checklist_history_${new Date().getTime()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Checklist history exported successfully.',
      });
    } catch (error) {
      console.error('Failed to export checklist history:', error);
      toast({
        title: 'Export failed',
        description: 'Unable to export checklist history.',
        variant: 'destructive',
      });
    }
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
          <h2 className="text-2xl font-bold">Checklist History</h2>
        </div>
        <Button onClick={downloadAllAsCSV} disabled={filteredRecords.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export All as CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search checklists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No checklists found</h3>
              <p className="text-muted-foreground">No checklist records match your search criteria.</p>
            </CardContent>
          </Card>
        ) : (
          filteredRecords.map(record => (
            <Card key={record._id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <h3 className="text-lg font-semibold">{record.checklistTitle}</h3>
                    <p className="text-sm text-muted-foreground">
                      Machine: {record.machineCode}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Filled by: {record.userName} • {format(new Date(record.auditDate || record.createdAt), 'PPP p')}
                    </p>
                  </div>
                  <Button
                    onClick={() => downloadChecklistPdf(record._id, record.checklistId?.name)}
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

export default AdminChecklistHistory;
