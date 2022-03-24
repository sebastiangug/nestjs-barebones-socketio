import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { PublisherService } from './services/publisher/publisher.service';
import { SubscriberService } from './services/subscriber/subscriber.service';
import { Socket } from 'socket.io';
import { Subscription } from 'rxjs';

interface ISocket extends Socket {
  subscription: Subscription;
  channel: string;
}

@WebSocketGateway({ cors: true })
export class LiveGateway {
  constructor(
    protected readonly publisherService: PublisherService,
    protected readonly subscriberService: SubscriberService,
  ) {}

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }

  async handleConnection(socket: ISocket) {
    socket.channel = socket.handshake.headers.channel as string;
    await this.subscriberService.viewer_joined(socket.channel);
    this.publisherService.add_viewer(socket.channel);
    socket.subscription = this.subscriberService
      .get_stream(socket.channel)
      .subscribe((event) => {
        socket.emit('VIEWERS', JSON.parse(event));
      });
  }

  async handleDisconnect(socket: ISocket) {
    socket.subscription.unsubscribe();
    await this.subscriberService.viewer_left(socket.channel);
    this.publisherService.remove_viewer(socket.channel);
  }
}
