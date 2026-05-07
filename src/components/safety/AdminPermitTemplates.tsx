import React, { useState, useEffect } from 'react';
import { useSafety } from '@/contexts/SafetyContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Loader2, FileText, Plus, Edit, Copy, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Template {
  _id: string;
  name: string;
  sections: any[];
  approvalFlow: string[];
  createdBy: any;
  createdAt: string;
}

interface Department {
  _id: string;
  name: string;
}

const AdminPermitTemplates: React.FC = () => {
  const { currentUser } = useSafety();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sections: [] as Array<{ title: string; questions: any[] }> ,
    approvalFlow: [] as string[],
  });

  useEffect(() => {
    fetchTemplates();
    fetchDepartments();
  }, []);

  const fetchTemplates = async () => {
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

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('sms.token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.departments);
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const addSection = () => {
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, { title: '', questions: [] }],
    }));
  };

  const removeSection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  };

  const updateSectionTitle = (index: number, title: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => i === index ? { ...section, title } : section),
    }));
  };

  const addQuestion = (sectionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => i === sectionIndex ? {
        ...section,
        questions: [...section.questions, { type: 'text', question: '', options: [], required: false }],
      } : section),
    }));
  };

  const updateQuestion = (sectionIndex: number, questionIndex: number, changes: Partial<any>) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => {
        if (i !== sectionIndex) return section;
        return {
          ...section,
          questions: section.questions.map((question, j) => j === questionIndex ? { ...question, ...changes } : question),
        };
      }),
    }));
  };

  const removeQuestion = (sectionIndex: number, questionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => {
        if (i !== sectionIndex) return section;
        return {
          ...section,
          questions: section.questions.filter((_, j) => j !== questionIndex),
        };
      }),
    }));
  };

  const addDropdownOption = (sectionIndex: number, questionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => {
        if (i !== sectionIndex) return section;
        return {
          ...section,
          questions: section.questions.map((question, j) => {
            if (j !== questionIndex) return question;
            return {
              ...question,
              options: [...(question.options || []), ''],
            };
          }),
        };
      }),
    }));
  };

  const updateDropdownOption = (sectionIndex: number, questionIndex: number, optionIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => {
        if (i !== sectionIndex) return section;
        return {
          ...section,
          questions: section.questions.map((question, j) => {
            if (j !== questionIndex) return question;
            return {
              ...question,
              options: question.options.map((opt: string, k: number) => k === optionIndex ? value : opt),
            };
          }),
        };
      }),
    }));
  };

  const removeDropdownOption = (sectionIndex: number, questionIndex: number, optionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => {
        if (i !== sectionIndex) return section;
        return {
          ...section,
          questions: section.questions.map((question, j) => {
            if (j !== questionIndex) return question;
            return {
              ...question,
              options: question.options.filter((_: string, k: number) => k !== optionIndex),
            };
          }),
        };
      }),
    }));
  };


  const handleSubmit = async () => {
    try {
      // Validation
      if (!formData.name.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Template name is required.',
          variant: 'destructive',
        });
        return;
      }

      if (formData.sections.length === 0) {
        toast({
          title: 'Validation Error',
          description: 'At least one section is required.',
          variant: 'destructive',
        });
        return;
      }

      if (formData.sections.some(s => !s.title.trim())) {
        toast({
          title: 'Validation Error',
          description: 'All section titles must be filled in.',
          variant: 'destructive',
        });
        return;
      }

      if (formData.sections.some(s => s.questions.length === 0)) {
        toast({
          title: 'Validation Error',
          description: 'Each section must include at least one question.',
          variant: 'destructive',
        });
        return;
      }

      if (formData.sections.some(section => section.questions.some(q => !q.question.trim()))) {
        toast({
          title: 'Validation Error',
          description: 'All questions must have text.',
          variant: 'destructive',
        });
        return;
      }

      if (formData.sections.some(section => section.questions.some(q => q.type === 'dropdown' && (!q.options || q.options.length === 0 || q.options.some((opt: string) => !opt.trim()))))) {
        toast({
          title: 'Validation Error',
          description: 'Dropdown questions must include at least one valid option.',
          variant: 'destructive',
        });
        return;
      }

      if (formData.approvalFlow.length === 0) {
        toast({
          title: 'Validation Error',
          description: 'At least one department must be added to the approval flow.',
          variant: 'destructive',
        });
        return;
      }

      const url = editingTemplate ? `/api/permit-templates/${editingTemplate._id}` : '/api/permit-templates';
      const method = editingTemplate ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('sms.token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Template ${editingTemplate ? 'updated' : 'created'} successfully.`,
        });
        setDialogOpen(false);
        setEditingTemplate(null);
        setFormData({ name: '', sections: [], approvalFlow: [] });
        fetchTemplates();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.message || 'Failed to save template.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to save template:', error);
      toast({
        title: 'Error',
        description: 'Failed to save template.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      sections: template.sections,
      approvalFlow: template.approvalFlow,
    });
    setDialogOpen(true);
  };

  const handleDuplicate = async (template: Template) => {
    try {
      const response = await fetch(`/api/permit-templates/${template._id}/duplicate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('sms.token')}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Template duplicated successfully.',
        });
        fetchTemplates();
      }
    } catch (error) {
      console.error('Failed to duplicate template:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate template.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (template: Template) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await fetch(`/api/permit-templates/${template._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('sms.token')}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Template deleted successfully.',
        });
        fetchTemplates();
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete template.',
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
          <h2 className="text-2xl font-bold">Permit Templates</h2>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingTemplate(null);
              setFormData({ name: '', sections: [], approvalFlow: [] });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create Template'}</DialogTitle>
              <DialogDescription>
                {editingTemplate ? 'Modify the permit template details and approval flow.' : 'Create a new permit template with sections and approval workflow.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter template name"
                />
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Label>Sections</Label>
                    <p className="text-sm text-slate-500">Add sections and questions for this permit template.</p>
                  </div>
                  <Button variant="outline" size="sm" type="button" onClick={addSection}>
                    Add Section
                  </Button>
                </div>

                {formData.sections.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 mt-4">
                    No sections yet. Add a section to start building your permit template.
                  </div>
                ) : (
                  <div className="space-y-4 mt-4">
                    {formData.sections.map((section, sectionIndex) => (
                      <div key={sectionIndex} className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1 space-y-2">
                            <Label>Section Title</Label>
                            <Input
                              value={section.title}
                              onChange={(e) => updateSectionTitle(sectionIndex, e.target.value)}
                              placeholder="Section title"
                            />
                          </div>
                          <Button variant="ghost" size="sm" type="button" onClick={() => removeSection(sectionIndex)}>
                            Remove Section
                          </Button>
                        </div>

                        <div className="mt-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold">Questions</p>
                              <p className="text-xs text-slate-500">Add questions for this section.</p>
                            </div>
                            <Button variant="outline" size="sm" type="button" onClick={() => addQuestion(sectionIndex)}>
                              Add Question
                            </Button>
                          </div>

                          {section.questions.length === 0 && (
                            <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                              No questions yet. Add a question to this section.
                            </div>
                          )}

                          <div className="space-y-3">
                            {section.questions.map((question, questionIndex) => (
                              <div key={questionIndex} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                                  <Input
                                    value={question.question}
                                    onChange={(e) => updateQuestion(sectionIndex, questionIndex, { question: e.target.value })}
                                    placeholder="Question text"
                                  />
                                  <Button variant="ghost" size="sm" type="button" onClick={() => removeQuestion(sectionIndex, questionIndex)}>
                                    Remove
                                  </Button>
                                </div>

                                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                                  <Select
                                    value={question.type}
                                    onValueChange={(value) => updateQuestion(sectionIndex, questionIndex, {
                                      type: value,
                                      options: value === 'dropdown' ? (question.options?.length ? question.options : ['']) : [],
                                    })}
                                  >
                                    <SelectTrigger className="min-w-[200px]">
                                      <SelectValue placeholder="Question type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="text">Text field</SelectItem>
                                      <SelectItem value="checkbox">Yes / No</SelectItem>
                                      <SelectItem value="dropdown">Dropdown</SelectItem>
                                    </SelectContent>
                                  </Select>

                                  <label className="inline-flex items-center gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={question.required}
                                      onChange={(e) => updateQuestion(sectionIndex, questionIndex, { required: e.target.checked })}
                                      className="form-checkbox h-4 w-4"
                                    />
                                    Required
                                  </label>
                                </div>

                                {question.type === 'dropdown' && (
                                  <div className="mt-3 space-y-3">
                                    {(question.options || []).map((option: string, optionIndex: number) => (
                                      <div key={optionIndex} className="flex gap-2 items-center">
                                        <Input
                                          value={option}
                                          onChange={(e) => updateDropdownOption(sectionIndex, questionIndex, optionIndex, e.target.value)}
                                          placeholder={`Option ${optionIndex + 1}`}
                                          className="flex-1"
                                        />
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          type="button"
                                          onClick={() => removeDropdownOption(sectionIndex, questionIndex, optionIndex)}
                                        >
                                          <X className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    ))}
                                    <Button variant="outline" size="sm" type="button" onClick={() => addDropdownOption(sectionIndex, questionIndex)}>
                                      Add Option
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label>Approval Flow</Label>
                <Select
                  value=""
                  onValueChange={(deptId) => {
                    if (!formData.approvalFlow.includes(deptId)) {
                      setFormData(prev => ({
                        ...prev,
                        approvalFlow: [...prev.approvalFlow, deptId]
                      }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Add department to approval flow" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.filter(d => !formData.approvalFlow.includes(d._id)).map(dept => (
                      <SelectItem key={dept._id} value={dept._id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.approvalFlow.map((deptId, index) => {
                    const dept = departments.find(d => d._id === deptId);
                    return (
                      <Badge key={deptId} variant="secondary" className="cursor-pointer"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          approvalFlow: prev.approvalFlow.filter((_, i) => i !== index)
                        }))}
                      >
                        {dept?.name} ×
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingTemplate ? 'Update' : 'Create'} Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {templates.map(template => (
          <Card key={template._id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Created by {template.createdBy?.name} • {format(new Date(template.createdAt), 'PPP')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Approval Flow: {template.approvalFlow.map(id => departments.find(d => d._id === id)?.name).join(' → ')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDuplicate(template)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(template)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {templates.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No templates found</h3>
              <p className="text-muted-foreground mb-4">Create your first permit template to get started.</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminPermitTemplates;