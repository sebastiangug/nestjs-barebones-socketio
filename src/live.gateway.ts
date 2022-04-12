import { WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Subscription } from 'rxjs';

interface ISocket extends Socket {
  id: string;
  subscription: Subscription;
  channel: string;
}

@WebSocketGateway({ cors: true, pingTimeout: 65000, pingInterval: 60000 })
export class LiveGateway {
  async handleConnection(socket: ISocket) {
    socket.channel = socket.handshake.headers.channel as string;
    socket.id = socket.handshake.headers.id as string;

    socket.emit('TEST', { success: true });
  }
}
