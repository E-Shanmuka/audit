import React, { useState, useEffect } from 'react';
import { useSafety } from '@/contexts/SafetyContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { Loader2, FileText } from 'lucide-react';

interface Template {
  _id: string;
  name: string;
  sections: any[];
  approvalFlow: string[];
}

interface FormData {
  [key: string]: any;
}

const CreatePermit: React.FC = () => {
  const { currentUser } = useSafety();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/permit-templates', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('sms.token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
    setLoading(false);
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t._id === templateId);
    setSelectedTemplate(template || null);
    setFormData({});
  };

  const handleInputChange = (sectionIndex: number, questionIndex: number, value: any) => {
    const key = `${sectionIndex}-${questionIndex}`;
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedTemplate) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/permits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('sms.token')}`,
        },
        body: JSON.stringify({
          templateId: selectedTemplate._id,
          data: formData,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Permit submitted successfully.',
        });
        setSelectedTemplate(null);
        setFormData({});
      } else {
        toast({
          title: 'Error',
          description: 'Failed to submit permit.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to submit permit:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit permit.',
        variant: 'destructive',
      });
    }
    setSubmitting(false);
  };

  const renderQuestion = (sectionIndex: number, question: any, questionIndex: number) => {
    const key = `${sectionIndex}-${questionIndex}`;
    const value = formData[key] || '';

    switch (question.type) {
      case 'text':
        return (
          <div key={questionIndex} className="space-y-2">
            <Label>{question.question}</Label>
            <Input
              value={value}
              onChange={(e) => handleInputChange(sectionIndex, questionIndex, e.target.value)}
              placeholder="Enter text"
            />
          </div>
        );
      case 'checkbox':
        return (
          <div key={questionIndex} className="space-y-2">
            <Label>{question.question}</Label>
            <div className="grid grid-cols-3 gap-2">
              {['yes', 'no', 'not_required'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleInputChange(sectionIndex, questionIndex, option)}
                  className={`rounded-lg border px-3 py-2 text-sm ${value === option ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'}`}
                >
                  {option === 'yes' ? 'Yes' : option === 'no' ? 'No' : 'Not Required'}
                </button>
              ))}
            </div>
          </div>
        );
      case 'dropdown':
        return (
          <div key={questionIndex} className="space-y-2">
            <Label>{question.question}</Label>
            <Select value={value} onValueChange={(val) => handleInputChange(sectionIndex, questionIndex, val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                {question.options?.filter((option: string) => option.trim()).map((option: string, i: number) => (
                  <SelectItem key={i} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      default:
        return null;
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
      <div className="flex items-center gap-3">
        <FileText className="w-6 h-6 text-orange-500" />
        <h2 className="text-2xl font-bold">Create Permit</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Permit Template</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleTemplateSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a permit template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map(template => (
                <SelectItem key={template._id} value={template._id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedTemplate.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedTemplate.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">{section.title}</h3>
                <div className="grid gap-4">
                  {section.questions.map((question, questionIndex) =>
                    renderQuestion(sectionIndex, question, questionIndex)
                  )}
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-4 pt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedTemplate(null);
                  setFormData({});
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Submit Permit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreatePermit;