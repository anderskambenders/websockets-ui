import { User } from "../types";

class Users {
    static value: User[] = [];

    static add = (user: User) => {
        this.value.push(user);
    };

    static getUserIndex = (userName: string) => {
        return this.value.map((user) => user.name).indexOf(userName);
    };
}

export default Users;