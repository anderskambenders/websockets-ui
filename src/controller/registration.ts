
import { RESPONSE_TYPE, User, WebsocketRequest, WebsocketResponse } from "../types";
import Users from "../model/user";

const getRegistrationResp: (request: WebsocketRequest) => WebsocketResponse | undefined = (request) => {
    try {
        const { name, password }: { name: User["name"]; password: User["password"] } = JSON.parse(request.data);

        Users.add({ name, password });
        const index = Users.getUserIndex(name);

        const response: WebsocketRequest = {
            type: RESPONSE_TYPE.reg,
            data: JSON.stringify({ name, index, error: false, errorText: "" }),
            id: 0,
        };

        return response;
    } catch (error) {
        if (error instanceof Error) console.error(error.message);
    }
};

export default getRegistrationResp;
