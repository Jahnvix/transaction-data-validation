"use client";

import { FormEvent, useEffect, useState } from "react";

import { ResultsPanel } from "@/components/results-panel";
import { fetchSchema, processCsvUpload } from "@/lib/api";
import { ProcessResponse, SchemaResponse } from "@/lib/types";

const DEFAULT_CHUNK_SIZE = 5000;
const numberFormatter = new Intl.NumberFormat("en-US");

function formatFileSize(file: File | null) {
  if (!file) {
    return "No file selected";
  }

  if (file.size >= 1024 * 1024) {
    return `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
  }

  if (file.size >= 1024) {
    return `${(file.size / 1024).toFixed(1)} KB`;
  }

  return `${file.size} B`;
}

export function UploadWorkspace() {
  const [schema, setSchema] = useState<SchemaResponse | null>(null);
  const [schemaError, setSchemaError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [chunkSize, setChunkSize] = useState(DEFAULT_CHUNK_SIZE);
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState<ProcessResponse | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSchema = async () => {
      try {
        const response = await fetchSchema();
        if (isMounted) {
          setSchema(response);
          setSchemaError("");
        }
      } catch (error) {
        if (isMounted) {
          setSchemaError(
            error instanceof Error ? error.message : "Unable to load validation schema.",
          );
        }
      }
    };

    void loadSchema();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      setSubmitError("Choose a CSV file before starting validation.");
      return;
    }

    setIsProcessing(true);
    setSubmitError("");
    setResult(null);

    try {
      const response = await processCsvUpload(selectedFile, chunkSize);
      setResult(response);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Processing failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const readinessCards = [
    {
      label: "Schema",
      value: schema ? "Connected" : schemaError ? "Offline" : "Loading",
      accent: schema ? "text-emerald-700" : schemaError ? "text-amber-700" : "text-slate",
    },
    {
      label: "File",
      value: selectedFile ? "Ready" : "Waiting",
      accent: selectedFile ? "text-emerald-700" : "text-slate",
    },
    {
      label: "Chunk Size",
      value: numberFormatter.format(chunkSize),
      accent: "text-ink",
    },
  ];

  const schemaMetricCards = schema
    ? [
        {
          label: "Required Fields",
          value: numberFormatter.format(schema.required_columns.length),
        },
        {
          label: "Country Rules",
          value: numberFormatter.format(schema.supported_countries.length),
        },
        {
          label: "Accepted Formats",
          value: numberFormatter.format(schema.date_formats.length + schema.datetime_formats.length),
        },
      ]
    : [];

  return (
    <section className="grid gap-6 pb-8 xl:grid-cols-[1.03fr_0.97fr]" id="workspace">
      <div className="panel-surface rounded-[2.2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-5 border-b border-slate-200/80 pb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
                Upload Control
              </p>
              <h2 className="display-serif mt-2 text-3xl font-semibold text-ink">
                Process a transaction CSV
              </h2>
            </div>
            <div className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate">
              Single file workflow
            </div>
          </div>

          <p className="max-w-2xl text-sm leading-7 text-slate">
            The backend validates required fields, country-specific phone rules, date formats,
            duplicates, missing values, and numeric types before generating clean, error, and
            chunked outputs.
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            {readinessCards.map((card) => (
              <div key={card.label} className="metric-card rounded-[1.4rem] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate">
                  {card.label}
                </p>
                <p className={`mt-2 text-lg font-bold ${card.accent}`}>{card.value}</p>
              </div>
            ))}
          </div>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="soft-outline rounded-[1.8rem] p-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink" htmlFor="csv-file">
                Transaction CSV
              </label>
              <input
                accept=".csv,text/csv"
                className="block w-full rounded-[1.2rem] border border-slate-300 bg-white px-4 py-3 text-sm text-ink file:mr-4 file:rounded-xl file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white focus:border-accent focus:outline-none"
                id="csv-file"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                type="file"
              />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="text-sm font-semibold text-ink">
                  {selectedFile ? selectedFile.name : "No file selected yet"}
                </p>
                <p className="mt-1 text-sm text-slate">
                  {selectedFile
                    ? `File size: ${formatFileSize(selectedFile)}`
                    : "Upload a CSV file that contains order, product, and payment fields."}
                </p>
              </div>
              <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate">
                CSV only
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_0.84fr]">
            <div className="soft-outline rounded-[1.8rem] p-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-ink" htmlFor="chunk-size">
                  Chunk size
                </label>
                <input
                  className="w-full rounded-[1.2rem] border border-slate-300 bg-white px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none"
                  id="chunk-size"
                  min={1}
                  onChange={(event) => setChunkSize(Number(event.target.value) || DEFAULT_CHUNK_SIZE)}
                  type="number"
                  value={chunkSize}
                />
                <p className="text-sm text-slate">
                  Valid rows will be split into chunk files using this row count.
                </p>
              </div>
            </div>

            <div className="hero-stripe rounded-[1.8rem] p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
                Chunking Example
              </p>
              <p className="mt-3 text-2xl font-bold">
                50,000 rows to {Math.ceil(50000 / chunkSize)} chunk files
              </p>
              <p className="mt-2 text-sm leading-6 text-white/80">
                With the current size of {numberFormatter.format(chunkSize)}, large valid datasets
                stay easy to process and download.
              </p>
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate">
            Workflow: Upload CSV to validate rows, generate cleaned and error files, create
            chunk files, and download the outputs immediately.
          </div>

          {submitError ? (
            <div className="rounded-[1.4rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {submitError}
            </div>
          ) : null}

          <button
            className="w-full rounded-full bg-ink px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate disabled:cursor-not-allowed disabled:bg-slate/60"
            disabled={isProcessing}
            type="submit"
          >
            {isProcessing ? "Validating and generating outputs..." : "Validate and process CSV"}
          </button>
        </form>
      </div>

      <div className="space-y-6">
        <div className="panel-surface rounded-[2.2rem] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
                Validation Schema
              </p>
              <h2 className="display-serif mt-2 text-3xl font-semibold text-ink">
                Expected structure
              </h2>
            </div>
            <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate">
              Live from API
            </div>
          </div>

          {schemaError ? (
            <div className="mt-6 rounded-[1.4rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {schemaError}
            </div>
          ) : null}

          {schema ? (
            <div className="mt-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                {schemaMetricCards.map((card) => (
                  <div key={card.label} className="metric-card rounded-[1.6rem] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate">
                      {card.label}
                    </p>
                    <p className="mt-3 text-3xl font-extrabold text-ink">{card.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-ink">Required columns</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {schema.required_columns.map((column) => (
                    <span
                      key={column}
                      className="rounded-full border border-teal-200 bg-glow px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent"
                    >
                      {column}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="metric-card rounded-[1.6rem] p-4">
                  <p className="text-sm font-medium text-slate">Supported countries</p>
                  <p className="mt-2 text-base font-bold capitalize text-ink">
                    {schema.supported_countries.join(", ")}
                  </p>
                </div>
                <div className="metric-card rounded-[1.6rem] p-4">
                  <p className="text-sm font-medium text-slate">Accepted date formats</p>
                  <p className="mt-2 text-base font-bold text-ink">
                    {schema.date_formats.join(", ")}
                  </p>
                </div>
              </div>

              <div className="metric-card rounded-[1.6rem] p-4">
                <p className="text-sm font-medium text-slate">Accepted datetime formats</p>
                <p className="mt-2 text-base font-bold text-ink">
                  {schema.datetime_formats.join(", ")}
                </p>
              </div>

              <div className="overflow-hidden rounded-[1.8rem] border border-slate-200">
                <div className="grid grid-cols-[1.2fr_0.75fr_0.6fr] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate">
                  <span>Field</span>
                  <span>Type</span>
                  <span>Required</span>
                </div>
                <div className="divide-y divide-slate-200">
                  {schema.fields.map((field) => (
                    <div
                      key={field.name}
                      className="grid grid-cols-[1.2fr_0.75fr_0.6fr] gap-4 bg-white/90 px-4 py-3 text-sm text-ink"
                    >
                      <span className="font-semibold">{field.name}</span>
                      <span className="text-slate">{field.type}</span>
                      <span>{field.required ? "Yes" : "No"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : !schemaError ? (
            <div className="mt-6 rounded-[1.6rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate">
              Loading validation schema...
            </div>
          ) : (
            <div className="mt-6 rounded-[1.6rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate">
              The upload form still works. Schema details will appear once the backend is reachable.
            </div>
          )}
        </div>

        {result ? (
          <ResultsPanel result={result} />
        ) : (
          <div className="panel-surface rounded-[2.2rem] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
              Validation Status
            </p>
            <h2 className="display-serif mt-2 text-3xl font-semibold text-ink">
              Outputs will appear here after processing
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate">
              Once a CSV is processed, this section will show row counts, validation totals,
              download buttons for cleaned and error files, and individual chunk file links.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
