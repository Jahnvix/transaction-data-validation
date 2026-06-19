import { ProcessResponse } from "@/lib/types";

type ResultsPanelProps = {
  result: ProcessResponse;
};

const numberFormatter = new Intl.NumberFormat("en-US");

export function ResultsPanel({ result }: ResultsPanelProps) {
  const metrics = [
    { label: "Total Rows", value: result.total_rows },
    { label: "Valid Rows", value: result.valid_rows },
    { label: "Invalid Rows", value: result.invalid_rows },
    { label: "Chunk Files", value: result.generated_chunks },
  ];
  const validRatio = result.total_rows > 0 ? (result.valid_rows / result.total_rows) * 100 : 0;
  const invalidRatio = result.total_rows > 0 ? (result.invalid_rows / result.total_rows) * 100 : 0;

  return (
    <section className="panel-surface rounded-[2.2rem] p-6 sm:p-8">
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
            Validation Status
          </p>
          <h2 className="display-serif mt-2 text-3xl font-semibold text-ink">
            Processing complete
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate">
            {result.original_filename} was validated with a chunk size of{" "}
            {numberFormatter.format(result.chunk_size)} rows.
          </p>
        </div>
        <div className="rounded-[1.4rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Outputs are ready to download.
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="metric-card rounded-[1.6rem] p-4">
            <p className="text-sm font-medium text-slate">{metric.label}</p>
            <p className="mt-2 text-3xl font-extrabold text-ink">
              {numberFormatter.format(metric.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <div className="space-y-5">
          <div className="soft-outline rounded-[1.8rem] p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-ink">Validation breakdown</p>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate">
                Job {result.job_id.slice(0, 8)}
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-ink">Valid rows</span>
                  <span className="text-slate">{validRatio.toFixed(1)}%</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill bg-emerald-500"
                    style={{ width: `${validRatio}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-ink">Invalid rows</span>
                  <span className="text-slate">{invalidRatio.toFixed(1)}%</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill bg-rose-400"
                    style={{ width: `${invalidRatio}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="soft-outline rounded-[1.8rem] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">Generated chunk files</p>
                <p className="mt-1 text-sm text-slate">
                  Every valid-data chunk can be downloaded individually.
                </p>
              </div>
              <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate">
                {result.generated_chunks} files
              </div>
            </div>

            {result.chunk_files.length > 0 ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {result.chunk_files.map((chunkFile) => (
                  <a
                    key={chunkFile.name}
                    className="download-card rounded-[1.35rem] px-4 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                    href={chunkFile.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {chunkFile.name}
                  </a>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate">
                No chunk files were generated because no valid rows were available to split.
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-3">
          <a
            className="download-card rounded-[1.8rem] px-5 py-5 transition hover:border-ink"
            href={result.artifacts.cleaned_csv}
            rel="noreferrer"
            target="_blank"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              Download
            </p>
            <p className="mt-2 text-xl font-bold text-ink">Cleaned CSV</p>
            <p className="mt-2 text-sm leading-6 text-slate">
              Contains only valid rows after all configured checks pass.
            </p>
          </a>

          <a
            className="download-card rounded-[1.8rem] px-5 py-5 transition hover:border-ink"
            href={result.artifacts.error_csv}
            rel="noreferrer"
            target="_blank"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              Download
            </p>
            <p className="mt-2 text-xl font-bold text-ink">Error CSV</p>
            <p className="mt-2 text-sm leading-6 text-slate">
              Includes original rows plus the validation failure reason for each invalid record.
            </p>
          </a>

          {result.artifacts.chunks_zip ? (
            <a
              className="hero-stripe rounded-[1.8rem] px-5 py-5 text-white transition hover:opacity-95"
              href={result.artifacts.chunks_zip}
              rel="noreferrer"
              target="_blank"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
                Download
              </p>
              <p className="mt-2 text-xl font-bold">Chunk ZIP</p>
              <p className="mt-2 text-sm leading-6 text-white/80">
                Packages all generated chunk files into one archive for faster delivery.
              </p>
            </a>
          ) : (
            <div className="rounded-[1.8rem] border border-slate-200 bg-slate-100 px-5 py-5 text-slate-500">
              <p className="text-xs font-semibold uppercase tracking-[0.22em]">
                Download
              </p>
              <p className="mt-2 text-xl font-bold">Chunk ZIP</p>
              <p className="mt-2 text-sm leading-6">
                No archive is available because there were no valid rows to package.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
