export class RegisterUserRequest {
  username: string;
  name: string;
  password: string;
  role: string;
}

export class UserResponse {
  username: string;
  name: string;
  role?: string;
  token?: string;
}
