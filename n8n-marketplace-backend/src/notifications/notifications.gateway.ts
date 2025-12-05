import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // In production, restrict this to your frontend URL
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('NotificationsGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, payload: { userId: string }) {
    client.join(`user_${payload.userId}`);
    this.logger.log(`Client ${client.id} joined room user_${payload.userId}`);
  }

  sendNotificationToUser(userId: string, event: string, payload: any) {
    // In a real app, you'd map userId to socketId(s) or use rooms.
    // For simplicity, we'll broadcast to all for now, or use a room named after userId.
    // Ideally: client joins room `user_${userId}` on connection.
    this.server.to(`user_${userId}`).emit(event, payload);
  }
}
