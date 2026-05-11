import type { IUser } from "../app/module/auth/model.ts";

declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}
