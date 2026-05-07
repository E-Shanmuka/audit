import React, { useState, useEffect } from 'react';
import { useSafety } from '@/contexts/SafetyContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { Loader2, FileText, Download, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

interface Permit {
  _id: string;
  permitNumber: string;
  templateId: any;
  userId: any;
  data: any;
  status: string;
  currentDepartmentIndex: number;
  rejectedBy?: any;
  rejectionReason?: string;
  createdAt: string;
}

interface Approval {
  _id: string;
  departmentId: any;
  userId: any;
  status: string;
  remarks: string;
  approvedAt: string;
}

const PermitDetails: React.FC = () => {
  const { currentUser, setActiveView } = useSafety();
  const [permit, setPermit] = useState<Permit | null>(null);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const permitId = localStorage.getItem('selectedPermit');
    if (permitId) {
      fetchPermit(permitId);
    }
  }, []);

  const fetchPermit = async (permitId: string) => {
    try {
      const response = await fetch(`/api/permits/${permitId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('sms.token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPermit(data.permit);
        setApprovals(data.approvals);
      }
    } catch (error) {
      console.error('Failed to fetch permit:', error);
    }
    setLoading(false);
  };

  const renderFormData = () => {
    if (!permit || !permit.templateId) return null;

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

  const getStatusBadge = (status: string) => {
    if (status === 'approved') return <Badge className="bg-green-500">Approved</Badge>;
    if (status === 'rejected') return <Badge variant="destructive">Rejected</Badge>;
    return <Badge variant="secondary">Pending</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!permit) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Permit not found</h2>
        <Button onClick={() => setActiveView('requested-permits')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Permits
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setActiveView('requested-permits')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <FileText className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold">{permit.permitNumber}</h2>
          {getStatusBadge(permit.status)}
        </div>
        <Button variant="outline" onClick={() => window.open(`/api/permits/${permit._id}/pdf`, '_blank')}>
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Permit Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Permit Number:</span>
              <span>{permit.permitNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Template:</span>
              <span>{permit.templateId?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Submitted By:</span>
              <span>{permit.userId?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Created Date:</span>
              <span>{format(new Date(permit.createdAt), 'PPP')}</span>
            </div>
            {permit.status === 'rejected' && (
              <>
                <div className="flex justify-between">
                  <span className="font-medium">Rejected By:</span>
                  <span>{permit.rejectedBy?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Rejection Reason:</span>
                  <span className="text-red-600">{permit.rejectionReason}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approval Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {approvals.map((approval, index) => (
                <div key={approval._id} className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1 ${
                    approval.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <div className="flex-1">
                    <div className="font-medium">
                      {approval.status === 'approved' ? 'Approved' : 'Rejected'} by {approval.departmentId?.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {approval.userId?.name} • {format(new Date(approval.approvedAt), 'PPP p')}
                    </div>
                    {approval.remarks && (
                      <div className="text-sm mt-1">{approval.remarks}</div>
                    )}
                  </div>
                </div>
              ))}
              {approvals.length === 0 && (
                <p className="text-muted-foreground">No approvals yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permit Form Data</CardTitle>
        </CardHeader>
        <CardContent>
          {renderFormData()}
        </CardContent>
      </Card>
    </div>
  );
};

export default PermitDetails;