import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JoinGameDto } from './dto';
import { CanisterService } from 'src/canister/canister.service';

@WebSocketGateway({
  transports: ['websocket'],
  cors: {
    origin: '*',
  },
  maxHttpBufferSize: 12 * 1024 * 1024,
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server: Server;

  constructor(private readonly canister: CanisterService) {}

  async handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() body: JoinGameDto) {
    console.log({ body });
    this.server.emit('message', body);
  }

  @SubscribeMessage('users')
  async getUsers() {
    const users = await this.canister.callCanisterMethod();
    this.server.emit('users', users);
  }
}
