# ShopApp — Full-Stack Web Application

A scalable product catalog built with **Django REST Framework** (backend) and **React + Vite** (frontend), deployed on AWS using the companion Terraform infrastructure.

---

## Architecture

```
Internet → WAF → ALB → EC2 ASG (Django/Gunicorn)
                           ↓
                      RDS PostgreSQL
                           ↓
                      S3 (static assets + frontend)
```

---

## Project Structure

```
my-webapp/
├── backend/               # Django REST Framework API
│   ├── core/              # Django project (settings, urls, wsgi)
│   ├── products/          # Products app (models, views, serializers)
│   │   └── fixtures/      # Seed data — 4 categories, 12 products
│   ├── Dockerfile
│   ├── manage.py
│   └── requirements.txt
├── frontend/              # React + Vite SPA
│   ├── src/
│   │   ├── components/    # Navbar, HomePage, ProductCard, ProductDetail
│   │   └── api.js         # Axios API client
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── nginx.conf
├── s3-assets/             # Sample SVG images for S3 upload
│   └── upload-to-s3.sh
├── docker-compose.yml     # Local development
├── Jenkinsfile            # CI/CD pipeline
└── README.md
```

---

## Local Development

### Prerequisites
- Docker Desktop
- Git

### Run locally

```bash
git clone <your-repo-url>
cd my-webapp

# Start all services (DB + backend + frontend)
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api/
- Django Admin: http://localhost:8000/admin/

The backend automatically runs migrations and loads seed data on first start.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health/` | Health check |
| GET | `/api/categories/` | List all categories |
| GET | `/api/products/` | List products (paginated) |
| GET | `/api/products/?search=laptop` | Search products |
| GET | `/api/products/?category=electronics` | Filter by category |
| GET | `/api/products/?ordering=price` | Sort by field |
| GET | `/api/products/<slug>/` | Product detail |

---

## Deploy to AWS

### 1. Backend on EC2 (via Jenkins)

Add these credentials in Jenkins (`Manage Jenkins → Credentials`):

| ID | Type | Value |
|----|------|-------|
| `aws-credentials` | AWS credentials | IAM access key + secret |
| `ec2-ssh-key` | SSH private key | Your EC2 key pair |
| `EC2_HOST` | Secret text | ALB DNS or EC2 IP |
| `S3_FRONTEND_BUCKET` | Secret text | S3 bucket name |
| `DB_PASSWORD` | Secret text | RDS master password (from Secrets Manager) |
| `DB_HOST` | Secret text | RDS endpoint |
| `SECRET_KEY` | Secret text | Django secret key |
| `S3_BUCKET_NAME` | Secret text | Static assets bucket name |

### 2. Frontend on S3

The Jenkinsfile syncs `frontend/dist/` to S3 on every push to `main`.
Set `VITE_API_BASE_URL` to your ALB DNS name before building.

### 3. Upload sample images to S3

```bash
cd s3-assets
./upload-to-s3.sh your-project-name-static-assets-123456789012
```

### 4. Load seed data manually (first deploy)

```bash
ssh ec2-user@<your-ec2-ip>
cd /opt/webapp/backend
source .venv/bin/activate
python manage.py migrate
python manage.py loaddata products/fixtures/categories.json
python manage.py loaddata products/fixtures/products.json
python manage.py createsuperuser
```

---

## Environment Variables

### Backend (`.env`)

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | Django secret key |
| `DEBUG` | True/False |
| `ALLOWED_HOSTS` | Comma-separated hosts |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `DB_HOST` | RDS endpoint or localhost |
| `DB_PORT` | 5432 |
| `S3_BUCKET_NAME` | Static assets S3 bucket |
| `AWS_REGION` | AWS region |
| `CORS_ALLOWED_ORIGINS` | Frontend origins |

### Frontend (`.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API URL |

---

## Running Tests

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py test

# Frontend
cd frontend
npm install
npm test
```
