import { UploadWorkspace } from "@/components/upload-workspace";

const capabilityCards = [
  {
    eyebrow: "Input Coverage",
    title: "Orders, products, and payment mode",
    description:
      "The interface accepts transaction CSV files with the fields needed for order-level, product-level, and payment-level validation.",
  },
  {
    eyebrow: "Validation",
    title: "Config-driven checks",
    description:
      "Country-specific phone rules, date and datetime formats, duplicates, missing values, and numeric data types are validated before export.",
  },
  {
    eyebrow: "Output",
    title: "Clean records and chunk files",
    description:
      "Valid rows become a cleaned CSV, invalid rows become an error CSV, and valid rows can be split into downloadable chunks.",
  },
];

const workflowSteps = [
  "Upload the transaction CSV",
  "Validate phone, date, and data integrity rules",
  "Generate cleaned and error files",
  "Split valid records into chunk files",
  "Download outputs immediately",
];

export default function HomePage() {
  return (
    <main className="page-shell isolate overflow-hidden">
      <div className="hero-orb left-[-6rem] top-20 h-40 w-40 bg-emerald-200/70" />
      <div className="hero-orb right-[-4rem] top-12 h-52 w-52 bg-cyan-100/80" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-8 pb-10 pt-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
          <div className="space-y-6">
            <div className="pill-accent inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold shadow-sm">
              Xeno Assignment • Part 4 • Single Page Interface
            </div>

            <div className="space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate">
                Transaction Validation Platform
              </p>
              <h1 className="display-serif max-w-4xl text-5xl font-semibold leading-[1.02] text-ink sm:text-6xl">
                Make raw transaction files usable without adding unnecessary complexity.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-slate sm:text-lg">
                This interface keeps the assignment workflow focused: upload a CSV, validate the
                dataset against configurable rules, generate clean and error outputs, split valid
                records into chunk files, and download every result from one professional screen.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                className="rounded-full bg-ink px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate"
                href="#workspace"
              >
                Open Upload Workspace
              </a>
              <a
                className="rounded-full border border-slate-300 bg-white/80 px-5 py-3 text-center text-sm font-semibold text-ink transition hover:border-ink"
                href="http://localhost:8000/docs"
                rel="noreferrer"
                target="_blank"
              >
                Open Backend API Docs
              </a>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {capabilityCards.map((card) => (
                <div key={card.title} className="metric-card rounded-[1.75rem] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                    {card.eyebrow}
                  </p>
                  <h2 className="mt-3 text-lg font-bold text-ink">{card.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate">{card.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-stripe relative overflow-hidden rounded-[2.2rem] p-6 text-white sm:p-8">
            <div className="absolute inset-x-0 top-0 h-28 bg-white/10 blur-3xl" />
            <div className="relative flex h-full flex-col justify-between gap-8">
              <div className="space-y-4">
                <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/90">
                  Assignment Workflow
                </div>
                <h2 className="display-serif text-3xl font-semibold leading-tight sm:text-4xl">
                  Upload, validate, clean, chunk, and deliver.
                </h2>
                <p className="max-w-xl text-sm leading-7 text-white/80 sm:text-base">
                  The experience stays minimal while still making the product feel deliberate,
                  trustworthy, and ready for large CSV operations.
                </p>
              </div>

              <div className="grid gap-3">
                {workflowSteps.map((step, index) => (
                  <div
                    key={step}
                    className="flex items-center gap-4 rounded-[1.4rem] border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-sm"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/14 text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    <p className="text-sm font-medium text-white/90">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <UploadWorkspace />
      </div>
    </main>
  );
}
