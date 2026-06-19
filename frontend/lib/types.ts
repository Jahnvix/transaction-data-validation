export type SchemaField = {
  name: string;
  type: string;
  required: boolean;
  allowed_values: string[];
  formats: string[];
};

export type SchemaResponse = {
  required_columns: string[];
  supported_countries: string[];
  date_formats: string[];
  datetime_formats: string[];
  fields: SchemaField[];
};

export type ArtifactLinks = {
  cleaned_csv: string;
  error_csv: string;
  chunks_zip: string | null;
};

export type ChunkFile = {
  name: string;
  url: string;
};

export type ProcessResponse = {
  job_id: string;
  original_filename: string;
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  chunk_size: number;
  generated_chunks: number;
  artifacts: ArtifactLinks;
  chunk_files: ChunkFile[];
};
