import React, { useState, useEffect } from 'react';
import { useSafety } from '@/contexts/SafetyContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Loader2, FileText, Eye, Check, X } from 'lucide-react';
import { format } from 'date-fns';

interface Permit {
  _id: string;
  permitNumber: string;
  templateId: any;
  userId: any;
  data: any;
  status: string;
  currentDepartmentIndex: number;
  createdAt: string;
}

const DepartmentPermits: React.FC = () => {
  const { currentUser, setActiveView } = useSafety();
  const [permits, setPermits] = useState<Permit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPermits();
  }, []);

  const fetchPermits = async () => {
    try {
      const response = await fetch('/api/permits/department/pending', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('sms.token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPermits(data.permits);
      }
    } catch (error) {
      console.error('Failed to fetch permits:', error);
    }
    setLoading(false);
  };

  const handleApprove = async (permitId: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/permits/${permitId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('sms.token')}`,
        },
        body: JSON.stringify({ remarks }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Permit approved successfully.',
        });
        setSelectedPermit(null);
        setRemarks('');
        fetchPermits();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to approve permit.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to approve permit:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve permit.',
        variant: 'destructive',
      });
    }
    setActionLoading(false);
  };

  const handleReject = async (permitId: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/permits/${permitId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('sms.token')}`,
        },
        body: JSON.stringify({ remarks }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Permit rejected successfully.',
        });
        setSelectedPermit(null);
        setRemarks('');
        fetchPermits();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to reject permit.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to reject permit:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject permit.',
        variant: 'destructive',
      });
    }
    setActionLoading(false);
  };

  const renderFormData = (permit: Permit) => {
    if (!permit.templateId) return null;

    return permit.templateId.sections.map((section: any, sectionIndex: number) => (
      <div key={sectionIndex} className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">{section.title}</h3>
        <div className="grid gap-4">
          {section.questions.map((question: any, questionIndex: number) => {
            const key = `${sectionIndex}-${questionIndex}`;
            const value = permit.data[key];

            return (
              <div key={questionIndex} className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">{question.question}</span>
                <span className="text-right">
                  {question.type === 'checkbox' ? (
                    value === 'yes' ? 'Yes' : value === 'no' ? 'No' : 'Not Required'
                  ) : (
                    value || 'N/A'
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    ));
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
        <h2 className="text-2xl font-bold">Pending Permits</h2>
      </div>

      <div className="grid gap-4">
        {permits.map(permit => (
          <Card key={permit._id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{permit.permitNumber}</h3>
                    <Badge variant="secondary">Pending Approval</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Template: {permit.templateId?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Submitted by: {permit.userId?.name} • Created: {format(new Date(permit.createdAt), 'PPP')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" onClick={() => setSelectedPermit(permit)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{permit.permitNumber} - Review</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h4 className="font-semibold mb-2">Permit Information</h4>
                            <p><strong>Template:</strong> {permit.templateId?.name}</p>
                            <p><strong>Submitted by:</strong> {permit.userId?.name}</p>
                            <p><strong>Created:</strong> {format(new Date(permit.createdAt), 'PPP')}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-4">Form Data</h4>
                          {renderFormData(permit)}
                        </div>

                        <div>
                          <Label htmlFor="remarks">Remarks</Label>
                          <Textarea
                            id="remarks"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Add your remarks..."
                            className="mt-2"
                          />
                        </div>

                        <div className="flex justify-end gap-4">
                          <Button
                            variant="destructive"
                            onClick={() => handleReject(permit._id)}
                            disabled={actionLoading}
                          >
                            {actionLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                          <Button
                            onClick={() => handleApprove(permit._id)}
                            disabled={actionLoading}
                          >
                            {actionLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {permits.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No pending permits</h3>
              <p className="text-muted-foreground">There are no permits waiting for your department's approval.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DepartmentPermits;