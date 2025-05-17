import { WebsocketRequest, REQUEST_TYPE } from "../types";
import getRegistrationResp from "./registration";

const getResponse = (request: WebsocketRequest, name?: string) => {
    try {
        const response = {
            [REQUEST_TYPE.reg]: ({ request }: { request: WebsocketRequest }) => getRegistrationResp(request),
        };

        return response[request.type]({ request, name });
    } catch (error) {
        if (error instanceof TypeError) console.error(`${request.type} request type is not supported`);
        if (error instanceof Error) console.error(error.message);
    }
};

export default getResponse;
