export interface UsuarioAdmin {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
}

export interface LoginResposta {
  token: string;
  usuario: UsuarioAdmin;
}