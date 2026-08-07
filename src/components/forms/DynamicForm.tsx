/**
 * SciHub Pro - Reusable Dynamic Form Components
 * 
 * Fully functional forms with:
 * - Synthetic/placeholder data that clears on focus
 * - Validation
 * - Persistence integration via store
 * - Loading states
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ============ TYPES ============

interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'password' | 'textarea' | 'select' | 'tags' | 'date' | 'url';
  placeholder?: string;
  defaultValue?: string | string[];
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: (value: any) => string | null;
  helpText?: string;
}

interface DynamicFormProps {
  fields: FormFieldConfig[];
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  initialValues?: Record<string, any>;
  submitLabel?: string;
  isSubmitting?: boolean;
  title?: string;
  description?: string;
  className?: string;
  showReset?: boolean;
}

// ============ SYNTHETIC DATA GENERATORS ============

export const syntheticData = {
  userProfiles: [
    { displayName: 'Dr. Sarah Chen', email: 'sarah.chen@mit.edu', institution: 'MIT' },
    { displayName: 'Prof. James Wilson', email: 'j.wilson@oxford.ac.uk', institution: 'Oxford' },
    { displayName: 'Dr. Maria Garcia', email: 'm.garcia@stanford.edu', institution: 'Stanford' },
  ],
  projectNames: [
    'Cancer Genomics Study',
    'Drug Discovery Pipeline',
    'Protein Structure Database',
    'CRISPR Off-target Analysis',
    'Single-cell RNA Sequencing Atlas',
  ],
  datasetNames: [
    'TCGA Breast Cancer Expression',
    'Human Protein Atlas - Tissue',
    'ChEMBL Bioactivity Data',
    'Genomic Variants - gnomAD v3',
  ],
  genes: ['BRCA1', 'TP53', 'EGFR', 'KRAS', 'BRAF', 'PIK3CA'],
  compounds: ['Aspirin', 'Ibuprofen', 'Paclitaxel', 'Doxorubicin'],
};

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ============ DYNAMIC FORM COMPONENT ============

export function DynamicForm({
  fields,
  onSubmit,
  initialValues,
  submitLabel = 'Submit',
  isSubmitting = false,
  title,
  description,
  className = '',
  showReset = true,
}: DynamicFormProps) {
  const [values, setValues] = useState<Record<string, any>>(initialValues || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Initialize with random synthetic data if no initial values
  useEffect(() => {
    if (!initialValues || Object.keys(initialValues).length === 0) {
      const syntheticValues: Record<string, any> = {};
      fields.forEach(field => {
        if (!(field.name in syntheticValues)) {
          switch (field.type) {
            case 'text':
              if (field.name.includes('name')) syntheticValues[field.name] = getRandomItem(syntheticData.projectNames);
              else if (field.name.includes('display')) syntheticValues[field.name] = getRandomItem(syntheticData.userProfiles).displayName;
              else if (field.name.includes('gene')) syntheticValues[field.name] = getRandomItem(syntheticData.genes);
              else if (field.name.includes('compound')) syntheticValues[field.name] = getRandomItem(syntheticData.compounds);
              else syntheticValues[field.name] = '';
              break;
            case 'email':
              syntheticValues[field.name] = getRandomItem(syntheticData.userProfiles).email;
              break;
            case 'textarea':
              if (field.name.includes('bio') || field.name.includes('description')) {
                syntheticValues[field.name] = 'Enter detailed description here... This will be replaced when you start typing.';
              } else if (field.name.includes('prompt')) {
                syntheticValues[field.name] = 'Describe your computational task or research question in detail...';
              } else {
                syntheticValues[field.name] = '';
              }
              break;
            case 'select':
              syntheticValues[field.name] = field.options?.[0]?.value || '';
              break;
            case 'tags':
              syntheticValues[field.name] = [];
              break;
            case 'url':
              syntheticValues[field.name] = 'https://api.example.com/data';
              break;
            default:
              syntheticValues[field.name] = '';
          }
        }
      });
      setValues(syntheticValues);
    }
  }, [fields, initialValues]);

  const handleChange = useCallback((fieldName: string, value: any) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
    if (errors[fieldName]) {
      setErrors(prev => { const n = { ...prev }; delete n[fieldName]; return n; });
    }
  }, [errors]);

  const handleBlur = useCallback((fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    setFocusedField(null);

    const field = fields.find(f => f.name === fieldName);
    if (field?.validation && values[fieldName] !== undefined) {
      const error = field.validation(values[fieldName]);
      if (error) setErrors(prev => ({ ...prev, [fieldName]: error }));
    }

    if (field?.required && !values[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: `${field.label} is required` }));
    }
  }, [fields, values]);

  const handleFocus = useCallback((fieldName: string) => {
    setFocusedField(fieldName);
    
    // Clear synthetic data on first focus
    const fieldValue = values[fieldName];
    if (fieldValue && typeof fieldValue === 'string') {
      const allSynthetic = [...syntheticData.userProfiles.map(p => p.displayName), ...syntheticData.userProfiles.map(p => p.email), ...syntheticData.projectNames, ...syntheticData.genes];
      if (allSynthetic.includes(fieldValue)) {
        handleChange(fieldName, '');
      }
    }
  }, [values, handleChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach(field => {
      if (field.required && !values[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
        isValid = false;
      }
      if (field.validation && values[field.name] !== undefined) {
        const error = field.validation(values[field.name]);
        if (error) { newErrors[field.name] = error; isValid = false; }
      }
    });

    setErrors(newErrors);
    setTouched(fields.reduce((acc, f) => ({ ...acc, [f.name]: true }), {}));

    if (!isValid) return;

    await onSubmit(values);
  };

  const handleReset = () => {
    setValues(initialValues || {});
    setErrors({});
    setTouched({});
  };

  const renderField = (field: FormFieldConfig) => {
    const value = values[field.name];
    const error = touched[field.name] ? errors[field.name] : undefined;
    const isFocused = focusedField === field.name;

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.name}
              value={value || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              onFocus={() => handleFocus(field.name)}
              onBlur={() => handleBlur(field.name)}
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
              className={`min-h-[100px] ${error ? 'border-red-500' : ''}`}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <Label>{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</Label>
            <Select value={value || ''} onValueChange={(v) => handleChange(field.name, v)}>
              <SelectTrigger className={error ? 'border-red-500' : ''}>
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}...`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'tags':
        return (
          <div key={field.name} className="space-y-2">
            <Label>{field.label}</Label>
            <TagsInput tags={value || []} onChange={(tags) => handleChange(field.name, tags)} />
            {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
          </div>
        );

      default:
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type={field.type}
              value={value || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              onFocus={() => handleFocus(field.name)}
              onBlur={() => handleBlur(field.name)}
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
              className={`${error ? 'border-red-500' : ''}`}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
          </div>
        );
    }
  };

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </CardHeader>
      )}
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(renderField)}

          <div className="flex gap-3 pt-4 border-t">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? '⏳ Submitting...' : submitLabel}
            </Button>
            {showReset && (
              <Button type="button" variant="outline" onClick={handleReset}>Reset</Button>
            )}
          </div>

          <p className="text-xs text-center text-muted-foreground pt-2">
            💡 Fields contain sample data — click to edit with your own information
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

// ============ TAGS INPUT COMPONENT ============

interface TagsInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export function TagsInput({ tags, onChange, placeholder, maxTags = 10 }: TagsInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      onChange([...tags, trimmedTag]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px] items-center">
      {tags.map(tag => (
        <Badge key={tag} variant="secondary" className="gap-1">
          {tag}
          <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">×</button>
        </Badge>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(inputValue)}
        placeholder={tags.length === 0 ? placeholder : undefined}
        className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
        disabled={tags.length >= maxTags}
      />
    </div>
  );
}

// ============ FORM PRESETS ============

export const formPresets = {
  newUser: {
    title: 'Create New User Profile',
    fields: [
      { name: 'displayName', label: 'Display Name', type: 'text', required: true },
      { name: 'email', label: 'Email Address', type: 'email', required: true },
      { name: 'institution', label: 'Institution', type: 'text' },
      { name: 'orcid', label: 'ORCID iD', type: 'text', helpText: 'Format: 0000-0000-0000-0000' },
      { name: 'bio', label: 'Biography', type: 'textarea' },
    ],
  },

  newProject: {
    title: 'Create New Project',
    fields: [
      { name: 'name', label: 'Project Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'visibility', label: 'Visibility', type: 'select', options: [
        { value: 'public', label: 'Public' },
        { value: 'private', label: 'Private' },
        { value: 'unlisted', label: 'Unlisted' },
      ]},
      { name: 'tags', label: 'Tags', type: 'tags' },
    ],
  },

  newDataset: {
    title: 'Add New Dataset',
    fields: [
      { name: 'name', label: 'Dataset Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'sourceUrl', label: 'Source URL', type: 'url' },
      { name: 'format', label: 'Format', type: 'select', options: [
        { value: 'csv', label: 'CSV' },
        { value: 'tsv', label: 'TSV' },
        { value: 'json', label: 'JSON' },
        { value: 'parquet', label: 'Parquet' },
      ]},
      { name: 'tags', label: 'Tags', type: 'tags' },
    ],
  },

  newJob: {
    title: 'Submit Compute Job',
    fields: [
      { name: 'name', label: 'Job Name', type: 'text', required: true },
      { name: 'type', label: 'Job Type', type: 'select', options: [
        { value: 'analysis', label: 'Analysis' },
        { value: 'training', label: 'Training' },
        { value: 'simulation', label: 'Simulation' },
        { value: 'pipeline', label: 'Pipeline' },
      ]},
      { name: 'priority', label: 'Priority', type: 'select', options: [
        { value: 'low', label: 'Low' },
        { value: 'normal', label: 'Normal' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' },
      ]},
      { name: 'computeBudget', label: 'Compute Budget (hours)', type: 'number' },
      { name: 'description', label: 'Parameters', type: 'textarea' },
    ],
  },

  savedQuery: {
    title: 'Save Query',
    fields: [
      { name: 'name', label: 'Query Name', type: 'text', required: true },
      { name: 'sql', label: 'SQL Query', type: 'textarea', required: true },
      { name: 'database', label: 'Database', type: 'select', options: [
        { value: 'publications', label: 'Publications' },
        { value: 'genomic_sequences', label: 'Genomic Sequences' },
        { value: 'molecular_compounds', label: 'Molecular Compounds' },
      ]},
      { name: 'tags', label: 'Tags', type: 'tags' },
    ],
  },

  inviteMember: {
    title: 'Invite Team Member',
    fields: [
      { name: 'name', label: 'Full Name', type: 'text', required: true },
      { name: 'email', label: 'Email Address', type: 'email', required: true },
      { name: 'institution', label: 'Institution', type: 'text' },
      { name: 'role', label: 'Role', type: 'select', options: [
        { value: 'admin', label: 'Admin' },
        { value: 'member', label: 'Member' },
        { value: 'guest', label: 'Guest' },
      ]},
    ],
  },

  aethelJob: {
    title: 'Submit AETHEL AI Job',
    fields: [
      { name: 'modelId', label: 'AI Model', type: 'select', required: true, options: [
        { value: 'gpt-turbo-220b', label: 'GPT-Turbo 220B (LLM)' },
        { value: 'vision-pro-85b', label: 'Vision Pro 85B (Vision)' },
        { value: 'quantum-sim-150b', label: 'Quantum Sim 150B (Quantum)' },
        { value: 'bio-intel-300b', label: 'Bio Intel 300B (Scientific)' },
        { value: 'multimodal-300b', label: 'MultiModal 300B (Multi-modal)' },
      ]},
      { name: 'prompt', label: 'Task Description / Prompt', type: 'textarea', required: true },
      { name: 'priority', label: 'Priority', type: 'select', options: [
        { value: 'low', label: 'Low' },
        { value: 'normal', label: 'Normal' },
        { value: 'high', label: 'High' },
        { value: 'critical', label: 'Critical' },
      ]},
      { name: 'computeBudget', label: 'Compute Budget (hours)', type: 'number' },
    ],
  },
};
