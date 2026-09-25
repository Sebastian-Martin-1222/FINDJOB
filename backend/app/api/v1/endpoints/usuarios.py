"""Endpoints de perfil de usuario actual y direcciones reutilizables."""

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import CurrentUser, get_current_user, require_cliente
from app.schemas.common import MessageResponse
from app.schemas.usuario import (
    DireccionCreate,
    DireccionOut,
    DireccionUpdate,
    UsuarioOut,
    UsuarioUpdate,
)
from app.services.usuarios_service import usuarios_service

router = APIRouter(tags=["Usuarios y Direcciones"])


@router.get("/me", response_model=UsuarioOut)
def consultar_mi_perfil(
    current_user: CurrentUser = Depends(get_current_user),
) -> UsuarioOut:
    """Consultar identidad, datos de negocio y roles del usuario autenticado."""
    return usuarios_service.get_usuario_por_id(current_user.usuario_id)


@router.patch("/me", response_model=UsuarioOut)
def actualizar_mi_perfil(
    data: UsuarioUpdate,
    current_user: CurrentUser = Depends(get_current_user),
) -> UsuarioOut:
    """Actualizar datos básicos permitidos del usuario autenticado."""
    return usuarios_service.actualizar_usuario(current_user.usuario_id, data)


@router.get("/me/roles", response_model=list[str])
def consultar_mis_roles(
    current_user: CurrentUser = Depends(get_current_user),
) -> list[str]:
    """Consultar los roles asignados al usuario actual."""
    return current_user.roles


@router.get("/me/direcciones", response_model=list[DireccionOut])
def listar_mis_direcciones(
    limit: int = Query(
        20, ge=1, le=100, description="Límite máximo de resultados (OWASP API4)"
    ),
    offset: int = Query(0, ge=0, description="Desplazamiento para paginación"),
    current_user: CurrentUser = Depends(get_current_user),
) -> list[DireccionOut]:
    """Listar las direcciones reutilizables del usuario autenticado."""
    return usuarios_service.get_direcciones_usuario(
        current_user.usuario_id, limit=limit, offset=offset
    )


@router.post(
    "/me/direcciones", response_model=DireccionOut, status_code=status.HTTP_201_CREATED
)
def crear_direccion(
    data: DireccionCreate,
    current_user: CurrentUser = Depends(require_cliente),
) -> DireccionOut:
    """Crear una dirección propia para servicios presenciales (Rol CLIENTE)."""
    return usuarios_service.crear_direccion(current_user.usuario_id, data)


@router.patch("/me/direcciones/{direccion_id}", response_model=DireccionOut)
def actualizar_direccion(
    direccion_id: int,
    data: DireccionUpdate,
    current_user: CurrentUser = Depends(get_current_user),
) -> DireccionOut:
    """Actualizar una dirección propia."""
    return usuarios_service.actualizar_direccion(
        current_user.usuario_id, direccion_id, data
    )


@router.delete("/me/direcciones/{direccion_id}", response_model=MessageResponse)
def eliminar_direccion(
    direccion_id: int,
    current_user: CurrentUser = Depends(get_current_user),
) -> MessageResponse:
    """Desactivar lógicamente una dirección propia preservando el historial."""
    usuarios_service.eliminar_direccion(current_user.usuario_id, direccion_id)
    return MessageResponse(message="Dirección desactivada correctamente.")
