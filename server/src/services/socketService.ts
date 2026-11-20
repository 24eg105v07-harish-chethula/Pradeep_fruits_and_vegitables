import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketIOServer | null = null;

export const initSocket = (httpServer: HttpServer, clientUrl: string) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: [clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket: Socket) => {
    // console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join admin room
    socket.on('join_admin_room', () => {
      socket.join('admin_dashboard');
      // console.log(`[Socket.io] Socket ${socket.id} joined admin_dashboard`);
    });

    // Join specific order room for real-time tracking
    socket.on('join_order_room', (orderId: string) => {
      socket.join(`order_${orderId}`);
      // console.log(`[Socket.io] Socket ${socket.id} joined order_${orderId}`);
    });

    socket.on('disconnect', () => {
      // console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io has not been initialized yet!');
  }
  return io;
};

// Emit new order to admin dashboard
export const notifyAdminNewOrder = (orderData: any) => {
  if (io) {
    io.to('admin_dashboard').emit('new_order', {
      message: `New Order Received! #${orderData.orderId}`,
      order: orderData,
      timestamp: new Date().toISOString()
    });
  }
};

// Emit status update to customer tracking room and admin
export const notifyOrderStatusUpdate = (orderId: string, updatedOrder: any) => {
  if (io) {
    // Notify customer on their tracking page
    io.to(`order_${orderId}`).emit('order_status_changed', {
      orderId,
      status: updatedOrder.orderStatus,
      estimatedDeliveryTime: updatedOrder.estimatedDeliveryTime,
      order: updatedOrder,
      timestamp: new Date().toISOString()
    });

    // Also notify admin room for instant sync
    io.to('admin_dashboard').emit('order_updated', {
      orderId,
      order: updatedOrder
    });
  }
};
