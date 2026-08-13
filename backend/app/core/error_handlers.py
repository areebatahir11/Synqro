import logging

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from postgrest.exceptions import APIError as PostgrestAPIError
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("synqro")

_PG_ERROR_MAP = {
    "23505": (status.HTTP_409_CONFLICT, "This record already exists (duplicate entry)."),
    "23503": (status.HTTP_400_BAD_REQUEST, "This action references a record that doesn't exist."),
    "23502": (status.HTTP_400_BAD_REQUEST, "A required field is missing."),
    "22P02": (status.HTTP_400_BAD_REQUEST, "One of the provided values is in an invalid format."),
    "42501": (status.HTTP_403_FORBIDDEN, "You don't have permission to perform this action."),
}


def _error_response(message: str, status_code: int, code: str = "error") -> JSONResponse:
    return JSONResponse(status_code=status_code, content={"error": {"message": message, "code": code}})


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(request: Request, exc: RequestValidationError):
        # Turn Pydantic's verbose error list into one readable message per field.
        details = []
        for err in exc.errors():
            field = ".".join(str(p) for p in err["loc"] if p != "body")
            details.append(f"{field}: {err['msg']}" if field else err["msg"])
        message = "; ".join(details) if details else "Invalid request data."
        return _error_response(message, status.HTTP_422_UNPROCESSABLE_ENTITY, code="validation_error")

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        # Covers both fastapi.HTTPException and Starlette's own (e.g. 404 on
        # an unknown route). Keeps whatever detail/status the route already set.
        return _error_response(str(exc.detail), exc.status_code, code="http_error")

    @app.exception_handler(PostgrestAPIError)
    async def postgrest_error_handler(request: Request, exc: PostgrestAPIError):
        # exc is raised by supabase-py/postgrest-py for: RLS denials, unique/FK
        # violations, .single()/.maybe_single() finding 0 or >1 rows, etc.
        logger.warning("Postgrest error on %s %s: %s", request.method, request.url.path, exc)

        pg_code = getattr(exc, "code", None)
        if pg_code in _PG_ERROR_MAP:
            status_code, message = _PG_ERROR_MAP[pg_code]
            return _error_response(message, status_code, code="database_error")

        # PGRST116 = "0 rows" from .single()/.maybe_single() -> treat as 404
        if pg_code == "PGRST116":
            return _error_response("The requested resource was not found.", status.HTTP_404_NOT_FOUND, code="not_found")

        # Anything else from the database: don't leak the raw message, but do
        # log it in full so it's debuggable from the server side.
        return _error_response(
            "A database error occurred while processing your request.",
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="database_error",
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.exception("Unhandled error on %s %s", request.method, request.url.path)
        return _error_response(
            "Something went wrong on our end. Please try again.",
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="internal_error",
        )