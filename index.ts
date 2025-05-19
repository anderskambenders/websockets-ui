import { httpServer } from './src/http_server/index';
import startWebsocketServer from './src/websocket/wsServer';

const HTTP_PORT = 8181;
const WEBSOCKET_PORT = 3000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

startWebsocketServer(WEBSOCKET_PORT);

process.on('uncaughtException', (error) => {
  if (error instanceof Error) console.error(error.message);
});
