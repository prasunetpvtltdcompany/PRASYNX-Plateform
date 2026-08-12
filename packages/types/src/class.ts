export interface ClassRow {
  id: string;
  name: string;
  organisation_id: string;
  created_at?: string;
}

export interface ClassDTO {
  id: string;
  name: string;
  organisation_id: string;
  created_at?: string;
}

export interface SectionRow {
  id: string;
  name: string;
  class_id: string;
  organisation_id: string;
}

export interface SectionDTO {
  id: string;
  name: string;
  class_id: string;
  organisation_id: string;
}

export interface ClassWithSectionsDTO extends ClassDTO {
  sections: SectionDTO[];
}