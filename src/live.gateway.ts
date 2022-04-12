import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { PublisherService } from './services/publisher/publisher.service';
import { SubscriberService } from './services/subscriber/subscriber.service';
import { Socket } from 'socket.io';
import { Subscription } from 'rxjs';

interface ISocket extends Socket {
  id: string;
  subscription: Subscription;
  channel: string;
}

@WebSocketGateway({ cors: true, pingTimeout: 65000, pingInterval: 60000 })
export class LiveGateway {
  constructor(
    protected readonly publisherService: PublisherService,
    protected readonly subscriberService: SubscriberService,
  ) {}

  @SubscribeMessage('DONATION')
  handleMessage(socket: ISocket, donation: number) {
    this.publisherService.add_donation(socket.channel, donation);
  }

  async handleConnection(socket: ISocket) {
    socket.channel = socket.handshake.headers.channel as string;
    socket.id = socket.handshake.headers.id as string;

    if (!socket.channel || !socket.id) {
      socket.disconnect();
    }

    await this.subscriberService.viewer_joined(socket.channel);
    this.publisherService.add_viewer(socket.channel, socket.id);
    socket.subscription = this.subscriberService
      .get_stream(socket.channel)
      .subscribe((event) => {
        socket.emit('DONATIONS', event);
      });

    socket.conn.on('packet', (packet) => {
      if (packet.type === 'pong') {
        this.publisherService.maintain_connection(socket.id);
      }
    });

    this.subscriberService.get_viewer_count(socket.channel).then((viewers) => {
      socket.emit('VIEWERS', { viewers: viewers + 1 });
    });

    const send_viewers = () => {
      setTimeout(async () => {
        const viewers = await this.subscriberService.get_viewer_count(
          socket.channel,
        );

        socket.emit('VIEWERS', { viewers });

        send_viewers();
      }, 5000);
    };

    send_viewers();
  }

  async handleDisconnect(socket: ISocket) {
    console.log('HANDLE DISCONNECT HAPPENED', socket.channel, socket.id);

    socket.subscription.unsubscribe();
    await this.subscriberService.viewer_left(socket.channel);
    await this.publisherService.remove_viewer(socket.channel, socket.id);
  }
}
