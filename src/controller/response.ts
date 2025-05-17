import Rooms from "../model/room";
import { WebsocketRequest, REQUEST_TYPE } from "../types";
import getRegistrationResp from "./registration";
import updateRoom from "./updateRoom";

const getResponse = (request: WebsocketRequest, name?: string) => {
    try {
        const response = {
            [REQUEST_TYPE.reg]: ({ request }: { request: WebsocketRequest }) => getRegistrationResp(request),
            [REQUEST_TYPE.addUserToRoom]: ({ request, name = "" }: { request: WebsocketRequest; name?: string }) => {
                const roomId: string = JSON.parse(request.data).indexRoom;
                const roomUsers = Rooms.addUserToRoom(roomId, name);
                updateRoom();
            },
        };

        return response[request.type]({ request, name });
    } catch (error) {
        if (error instanceof TypeError) console.error(`${request.type} request type is not supported`);
        if (error instanceof Error) console.error(error.message);
    }
};

export default getResponse;
