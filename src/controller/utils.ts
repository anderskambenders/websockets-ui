export const wsConnections: {
  connectionId: string;
  userName: string;
  ws: WebSocket;
}[] = [];

export const getWsEntryIndexByKey = (
  key: 'connectionId' | 'userName',
  value: string
) => {
  return wsConnections.map((entry) => entry[key]).indexOf(value);
};
