
export type GenDoc = {
  docTemplateId: string;
  docTemplateName: string;
  docTemplateDescription: string;
  variables: { name: string; value?: string; }[];
  varHash?: string;
  fileId?: string;
  fileName?: string;
  status?: 'skipped' | 'agreed' | 'pending';
};
