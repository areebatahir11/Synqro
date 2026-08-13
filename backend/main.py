from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.error_handlers import register_exception_handlers
from app.routers import auth, dashboard, discussions, notifications, projects, tasks, users

app = FastAPI(
    title="Synqro API",
    description="Backend for the Synqro Project Management & Team Collaboration Platform",
    version="1.0.0",
)

register_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(discussions.router)
app.include_router(notifications.router)
app.include_router(dashboard.router)


@app.get("/", tags=["health"])
def health_check():
    return {"status": "ok", "service": "Synqro API"}