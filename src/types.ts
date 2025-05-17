export interface User {
    name: string;
    password: string;
    index?: number;
}

export const REQUEST_TYPE = {
    reg: "reg",
    createRoom: "create_room",
    addUserToRoom: "add_user_to_room",
    addShips: "add_ships",
    attack: "attack",
    randomAttack: "randomAttack",
    singlePlay: "single_play",
};

export const RESPONSE_TYPE = {
    reg: "reg",
    updateRoom: "update_room",
    createGame: "create_game",
    finishGame: "finish",
    updataWinners: "update_winners",
    startGame: "start_game",
    turn: "turn",
    attack: "attack",
};

export interface WebsocketRequest {
    data: string;
    id: 0;
    type: (typeof REQUEST_TYPE)[keyof typeof REQUEST_TYPE];
}

export interface WebsocketResponse {
    data: string;
    id: 0;
    type: (typeof RESPONSE_TYPE)[keyof typeof RESPONSE_TYPE];
}

export type RoomUser = Required<Omit<User, "password">>;

export interface Room {
    roomId: string;
    roomUsers: RoomUser[];
}
