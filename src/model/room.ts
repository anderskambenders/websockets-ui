import { Room, RoomUser } from "../types";
import Users from "./user";
import crypto from "node:crypto";

class Rooms {
    static availableRooms: Room[] = [];

    static createRoom = (name: string) => {
        const roomWithUser = this.availableRooms.find((room) => room.roomUsers.some((user) => user.name === name));

        if (roomWithUser) return false;

        const roomId = crypto.randomUUID();
        const currentUser: RoomUser = { name, index: Users.getUserIndex(name) };
        this.availableRooms.push({ roomId, roomUsers: [currentUser] });

        return true;
    };

    static addUserToRoom = (roomId: string, name: string) => {
        const index = this.getRoomIndexByRoomId(roomId);
        const roomUsers = this.availableRooms[index].roomUsers;

        if (roomUsers.length === 1 && roomUsers[0].name !== name) {
            const currentUser: RoomUser = { name, index: Users.getUserIndex(name) };
            roomUsers.push(currentUser);

            this.availableRooms.splice(index, 1);
            this.removeUserFromRooms(name);

            return roomUsers;
        }

        return null;
    };

    static removeUserFromRooms = (name: string) => {
        const rooms = this.availableRooms.filter((room) => room.roomUsers.some((user) => user.name === name));
        if (rooms.length === 0) return false;

        const index = this.getRoomIndexByRoomId(rooms[0].roomId);

        if (this.availableRooms[index].roomUsers.length === 1) {
            this.availableRooms.splice(index, 1);

            return true;
        }

        return false;
    };

    private static getRoomIndexByRoomId = (roomId: string) => {
        return this.availableRooms.map((room) => room.roomId).indexOf(roomId);
    };
}

export default Rooms;
