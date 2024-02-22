import { httpServer } from './src/http_server/index';
import startWebsocketServer from './src/websocket/wsServer';

const HTTP_PORT = 8181;
const WEBSOCKET_PORT = 3000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const wsServer = startWebsocketServer();
wsServer.listen(WEBSOCKET_PORT, () => {
  const serverInfo = wsServer.address();
  if (serverInfo && typeof serverInfo !== 'string') {
    console.log(
      `WS server info:
      Address - ${serverInfo.address}
      Port - ${serverInfo.port}
      Protocol version - ${serverInfo.family}`
    );
  }
});
