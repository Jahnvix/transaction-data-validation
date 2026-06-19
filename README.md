
# Transaction Validator Platform

A production-ready web platform for validating transaction CSV files, generating cleaned and error outputs, and splitting valid records into downloadable chunks.

## Stack

- Frontend: Next.js 15, TypeScript, Tailwind CSS
- Backend: FastAPI, Pandas, Pydantic

## Project Structure


transaction-validator-platform/
├── backend/
│   ├── .env.example
│   ├── requirements.txt
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes.py
│   │   ├── config/
│   │   │   └── validation_rules.json
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   └── settings.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── config.py
│   │   │   └── responses.py
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── csv_processing.py
│   │       ├── file_storage.py
│   │       └── validation_service.py
│   └── storage/
│       └── jobs/
│           └── .gitkeep
└── frontend/
    ├── .env.local.example
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── postcss.config.mjs
    ├── tailwind.config.ts
    ├── eslint.config.mjs
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/
    │   ├── results-panel.tsx
    │   └── upload-workspace.tsx
    └── lib/
        ├── api.ts
        └── types.ts
```

## Installation

### Backend

1. Create a virtual environment.
2. Install dependencies from `backend/requirements.txt`.
3. Copy `backend/.env.example` to `backend/.env` if you want custom settings.

### Frontend

1. Install dependencies from `frontend/package.json`.
2. Copy `frontend/.env.local.example` to `frontend/.env.local`.

## Local Run

### Backend

```bash
cd backend
py -3.14 -m venv .venv
python -m pip --python .\.venv\Scripts\python.exe install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Frontend Windows Setup Note

If `npm install` is interrupted on Windows, npm can leave a partial `node_modules` folder behind and then print `EPERM` cleanup warnings while exiting. In that case:

```bash
cd frontend
Remove-Item -LiteralPath .\node_modules -Recurse -Force
Remove-Item -LiteralPath .\package-lock.json -Force -ErrorAction SilentlyContinue
npm install
npm run dev
```

If Windows still reports `EPERM`, close any Explorer or editor window opened inside `node_modules`, pause OneDrive sync briefly, and run the same commands again.

## Windows Setup Note

If `python` points to Miniconda on your machine, `python -m venv .venv` can stall during `ensurepip` and leave a partial virtual environment without `pip`. The commands above avoid activation issues and install packages into the virtual environment directly.

If `.venv` already exists but `pip` is missing, run:

```bash
python -m pip --python .\.venv\Scripts\python.exe install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

If you want the fastest path without a virtual environment, run:

```bash
py -3.14 -m pip install -r backend\requirements.txt
py -3.14 -m uvicorn app.main:app --app-dir backend --reload --host 0.0.0.0 --port 8000
```

## Deployment

### Frontend on Vercel

1. Import the `frontend` directory as a Vercel project.
2. Add `NEXT_PUBLIC_API_BASE_URL` pointing to the deployed FastAPI backend.
3. Deploy using the default Next.js build settings.

### Backend on Render

1. Create a new Web Service from the `backend` directory.
2. Set the build command to `pip install -r requirements.txt`.
3. Set the start command to `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
4. Add `BACKEND_CORS_ORIGINS` with your Vercel frontend URL.
5. Deploy the service and use its public URL in the frontend environment variables.

## Assignment Submission Checklist

### Parts 1–3 (single PDF)

1. Add a cover page with your name, college, and course.
2. Run the SQL files in `sql/` against MySQL after loading `data/customers.csv` into a table named `customers`.
3. For each query, paste the SQL text and add a screenshot of the executed result.
4. Export everything as one PDF (max 100 MB).

### Part 4 (submission form)

1. Deploy backend to Render and frontend to Vercel (see Deployment above).
2. Set `NEXT_PUBLIC_API_BASE_URL` on Vercel to your Render backend URL.
3. Set `BACKEND_CORS_ORIGINS` on Render to your Vercel frontend URL.
4. Record a 2-minute public walkthrough video (upload to YouTube/Loom).
5. Paste the hosted URL, video link, and the text from `part4_approach.txt` into the Google Form.

### Local test files

- `data/customers.csv` — customer dataset for MySQL (Parts 1–3)
- `data/sample_transactions.csv` — sample transaction CSV for Part 4 validation testing
