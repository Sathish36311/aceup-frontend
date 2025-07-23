import { Role } from "./role.enum";

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    role: Role;
}