
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      client.join(userId);
      console.log(`[Notifications] Client connected to room: ${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log('[Notifications] Client disconnected');
  }

  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(userId).emit('newNotification', notification);
  }
}
