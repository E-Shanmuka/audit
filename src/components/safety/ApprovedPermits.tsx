import React, { useState, useEffect } from 'react';
import { useSafety } from '@/contexts/SafetyContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Loader2, FileText, Eye, Download } from 'lucide-react';
import { format } from 'date-fns';

interface Permit {
  _id: string;
  permitNumber: string;
  templateId: any;
  status: string;
  currentDepartmentIndex: number;
  createdAt: string;
}

const ApprovedPermits: React.FC = () => {
  const { currentUser, setActiveView } = useSafety();
  const [permits, setPermits] = useState<Permit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPermits();
  }, []);

  const fetchPermits = async () => {
    try {
      const response = await fetch('/api/permits/user', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('sms.token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const approved = data.permits.filter((p: Permit) => p.status === 'approved');
        setPermits(approved);
      }
    } catch (error) {
      console.error('Failed to fetch permits:', error);
    }
    setLoading(false);
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
      <div className="flex items-center gap-3">
        <FileText className="w-6 h-6 text-orange-500" />
        <h2 className="text-2xl font-bold">Approved Permits</h2>
      </div>

      <div className="grid gap-4">
        {permits.map(permit => (
          <Card key={permit._id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{permit.permitNumber}</h3>
                    <Badge className="bg-green-500">Approved</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Template: {permit.templateId?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Created: {format(new Date(permit.createdAt), 'PPP')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      localStorage.setItem('selectedPermit', permit._id);
                      setActiveView('permit-details');
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.open(`/api/permits/${permit._id}/pdf`, '_blank')}>
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {permits.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No approved permits</h3>
              <p className="text-muted-foreground">You don't have any approved permits yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ApprovedPermits;