# SkillBaseHire — Deployment Guide

## Environments

| Environment | Purpose            | Branch   | Database          | Debug | Auto-Deploy      |
|-------------|--------------------|----------|-------------------|-------|------------------|
| Development | Local coding / QA  | (local)  | SQLite (local)    | On    | N/A              |
| Staging     | Testing / QA       | staging  | PostgreSQL (staging DB) | Off | On push to `staging` |
| Production  | Live users         | main     | PostgreSQL (prod DB)    | Off | **MANUAL ONLY**  |

---

## Deployment Rules

1. All code changes start in **local development** only.
2. Push to **`staging` branch** only when you want to test on the staging server.
3. Push to **`main` branch** only after staging approval and explicit manual confirmation.
4. **Production never auto-deploys** — always requires a manual trigger in DigitalOcean.
5. Dev, Staging, and Production use **completely separate databases** — never cross-connect them.
6. Never run migrations or data scripts from Staging against the Production database.
7. Never copy or restore a Production database backup into Staging without sanitising it first.

---

## Git Branch Strategy

```
feature work  →  local dev
                    │
                    ▼  (manual: when ready to test)
               staging branch  →  DigitalOcean Staging App (auto-deploys)
                    │
                    ▼  (manual: after staging sign-off)
               main branch  →  DigitalOcean Production App (MANUAL deploy only)
```

**Never push directly to `main`** without completing staging testing first.

---

## Environment Variables

Each environment has its own set of variables. Real values are set in the DigitalOcean
app dashboard and are never committed to git.

Use the example files as templates:

| File                        | Committed | Purpose                      |
|-----------------------------|-----------|------------------------------|
| `.env.development.example`  | Yes       | Template for local dev setup |
| `.env.staging.example`      | Yes       | Template for staging config  |
| `.env.production.example`   | Yes       | Template for prod config     |
| `.env.development`          | **No**    | Your actual local secrets    |
| `.env.staging`              | **No**    | Managed in DigitalOcean      |
| `.env.production`           | **No**    | Managed in DigitalOcean      |

### Required variables per environment

#### Development (`.env.development`)
```
APP_ENV=development
DEBUG=True
SECRET_KEY=<any random hex string>
# DATABASE_URL optional — SQLite is used by default
```

#### Staging (set in DigitalOcean staging app)
```
APP_ENV=staging
DEBUG=False
SECRET_KEY=<random, different from prod>
DATABASE_URL=<staging PostgreSQL connection string>
```

#### Production (set in DigitalOcean production app)
```
APP_ENV=production
DEBUG=False
SECRET_KEY=<strong random secret, never shared>
DATABASE_URL=<production PostgreSQL connection string>
SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS
```

---

## DigitalOcean Setup

### Two separate apps are required

#### 1. Staging App — `skillbasehire-staging`

| Setting             | Value                                  |
|---------------------|----------------------------------------|
| Branch              | `staging`                              |
| Auto-deploy         | **Enabled** (deploys on every push)    |
| Database            | Attach a **separate staging DB**       |
| `APP_ENV`           | `staging`                              |

Steps to create:
1. DigitalOcean → App Platform → Create App
2. Source: GitHub → repo → branch: `staging`
3. Enable "Autodeploy on push"
4. Add a new PostgreSQL database component → name it `staging-db`
5. Under App-level environment variables, set `APP_ENV=staging`, `SECRET_KEY=<key>`
6. `DATABASE_URL` will be injected automatically from the attached DB component

#### 2. Production App — `skillbasehire-production`

| Setting             | Value                                           |
|---------------------|-------------------------------------------------|
| Branch              | `main`                                          |
| Auto-deploy         | **DISABLED** — deploy only when manually triggered |
| Database            | Attach the **production DB** (separate from staging) |
| `APP_ENV`           | `production`                                    |

Steps to create / configure:
1. DigitalOcean → App Platform → Create App (or edit existing)
2. Source: GitHub → repo → branch: `main`
3. **Disable "Autodeploy on push"** — uncheck the checkbox
4. Add / keep the existing production PostgreSQL database component
5. Set `APP_ENV=production`, `SECRET_KEY=<strong key>`, SMTP variables
6. `DATABASE_URL` injected automatically from the attached DB component

To disable auto-deploy on an existing app:
- App Platform → your production app → Settings → App Spec
- Set `github.deploy_on_push: false`

Or via the DigitalOcean UI:
- App → Settings → Source → uncheck "Autodeploy"

---

## Step-by-Step Deployment Workflow

### Step 1 — Develop locally

```bash
# Work on feature branch or directly
py app.py            # starts local dev server at localhost:5000
# APP_ENV=development is read from .env.development
# SQLite DB used — changes only affect your machine
```

### Step 2 — Push to Staging for testing

```bash
# Commit your changes
git add <files>
git commit -m "describe the change"

# Push to staging branch (auto-deploys to DigitalOcean staging app)
git push origin staging
```

- Wait for DigitalOcean staging build to complete (~2-3 min)
- Test at your staging URL (e.g. `https://skillbasehire-staging.ondigitalocean.app`)
- Check logs: App Platform → staging app → Runtime Logs

### Step 3 — Staging sign-off checklist

Before promoting to production, verify on staging:
- [ ] Core flows work: signup, login, job search, apply, recruiter dashboard
- [ ] Resume upload and import work correctly
- [ ] No 500 errors in the runtime logs
- [ ] Database migrations applied cleanly
- [ ] Email sending works (if changed)

### Step 4 — Promote to Production (manual)

Only after staging sign-off:

```bash
# Merge staging into main
git checkout main
git merge staging
git push origin main
```

Then **manually trigger** the deployment in DigitalOcean:
1. App Platform → `skillbasehire-production`
2. Click **"Deploy"** → confirm
3. Monitor the build log for errors
4. Verify the live site after deploy completes

> **Never run `git push origin main` and assume it auto-deploys.**
> Auto-deploy is disabled on production. You must click Deploy in the dashboard.

---

## Database Safety Rules

- **Staging DB** and **Production DB** are separate DigitalOcean Managed Databases.
  They have different hostnames, credentials, and cluster IDs.
- The app reads `DATABASE_URL` from the environment — it will always connect to
  the correct DB for its environment as long as `APP_ENV` is set correctly.
- Never paste a production `DATABASE_URL` into the staging app config or vice versa.
- If you need to test with production-like data, create an **anonymised export**
  from production and restore it to the staging DB manually.

---

## Local Development Quick-Start

```bash
# 1. Clone the repo
git clone https://github.com/Anishkvs/SkillbaseHire.git
cd SkillbaseHire

# 2. Create virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up local environment file
copy .env.development.example .env.development
# Edit .env.development — set SECRET_KEY to any random string

# 5. Run the app (SQLite DB created automatically)
py app.py
# Open http://127.0.0.1:5000
```

---

## Rollback

If a production deployment breaks the site:

1. Identify the last good commit on `main`:
   ```bash
   git log --oneline main
   ```
2. In DigitalOcean → production app → Activity → find the previous successful deploy → click **"Rollback"**
   — or —
   Hard-reset `main` to the last good commit and trigger a manual deploy:
   ```bash
   git checkout main
   git reset --hard <good-commit-sha>
   git push --force-with-lease origin main
   # Then manually deploy in DigitalOcean
   ```

---

## Summary

| Action                              | Who triggers          | How                              |
|-------------------------------------|-----------------------|----------------------------------|
| Run code locally                    | Developer             | `py app.py`                      |
| Deploy to Staging                   | Developer             | `git push origin staging`        |
| Approve Staging                     | Developer / QA        | Manual checklist above           |
| Deploy to Production                | Developer (explicit)  | Merge to `main` + manual trigger |
| Rollback Production                 | Developer             | DigitalOcean rollback button     |
