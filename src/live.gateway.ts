import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { PublisherService } from './services/publisher/publisher.service';
import { SubscriberService } from './services/subscriber/subscriber.service';
import { Socket } from 'socket.io';
import { Subscription } from 'rxjs';

interface ISocket extends Socket {
  id: string;
  subscription: Subscription;
  channel: string;
  last_views_request: number;
}

@WebSocketGateway({ cors: true })
export class LiveGateway {
  constructor(
    protected readonly publisherService: PublisherService,
    protected readonly subscriberService: SubscriberService,
  ) {}

  @SubscribeMessage('GET_VIEWERS')
  async handleMEssage(socket: ISocket) {
    if (socket.last_views_request + 5000 - Date.now() < 0) {
      socket.emit(
        'VIEWERS',
        this.subscriberService.get_viewer_count(socket.channel),
      );
    }

    socket.last_views_request = Date.now();
  }

  @SubscribeMessage('DONATION')
  handleMessage(socket: ISocket, donation: number) {
    this.publisherService.add_donation(socket.channel, donation);
  }

  async handleConnection(socket: ISocket) {
    socket.channel = socket.handshake.headers.channel as string;
    socket.id = socket.handshake.headers.id as string;
    socket.last_views_request = Date.now();
    await this.subscriberService.viewer_joined(socket.channel);
    this.publisherService.add_viewer(socket.channel, socket.id);
    socket.subscription = this.subscriberService
      .get_stream(socket.channel)
      .subscribe((event) => {
        socket.emit('DONATIONS', event);
      });
  }

  async handleDisconnect(socket: ISocket) {
    socket.subscription.unsubscribe();
    await this.subscriberService.viewer_left(socket.channel);
    this.publisherService.remove_viewer(socket.id);
  }
}
