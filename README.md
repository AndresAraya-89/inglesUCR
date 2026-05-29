# inglesUCR — Plataforma de aprendizaje de inglés (MVP)

Prototipo funcional de plataforma multimedia interactiva para estudiantes UCR.
Stack: **React (Vite) + Django REST + SQL + JWT + JSON**.

> Consulta `../DOCUMENTACION.md` para el contexto completo, requerimientos, arquitectura de datos y mapa de endpoints.

---

## Arranque rápido

### Backend (Django)

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python manage.py makemigrations usuarios conceptos lecciones evaluaciones
python manage.py migrate
python manage.py seed_users          # crea usuarios de prueba (ver tabla abajo)
python manage.py runserver
```
API disponible en: http://localhost:8000/api/v1/

### Frontend (React + Vite)

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```
SPA disponible en: http://localhost:5173

---

## Credenciales de prueba (dev)

Generadas por `python manage.py seed_users`:

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | `admin@ucr.ac.cr` | `Admin1234` |
| Estudiante | `estudiante@ucr.ac.cr` | `Estudiante1234` |

> ⚠️ Solo para desarrollo. Cambiar/eliminar antes de cualquier despliegue.

## Estructura

```
inglesUCR/
├── backend/        ← API Django REST
├── frontend/       ← SPA React + Vite
├── multimedia/     ← recursos fuente (imágenes, audio, video, animaciones)
└── docs/           ← entregables UX/UI (planificación, diseño, evaluación)
```
