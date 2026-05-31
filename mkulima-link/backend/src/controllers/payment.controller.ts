import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { initiateSTKPush, checkSTKStatus, parseMpesaCallback } from '../services/mpesa.service';
import { createNotification } from '../services/notification.service';
import { io } from '../index';

export const initiateMpesaPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, phoneNumber } = req.body;
    const userId = req.user!.userId;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { buyer: { select: { firstName: true } } },
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (order.buyerId !== userId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    if (order.paymentStatus === 'COMPLETED') {
      res.status(400).json({ success: false, message: 'Order already paid' });
      return;
    }

    const stkResult = await initiateSTKPush(
      phoneNumber,
      order.totalAmount,
      `MLK-${orderId.slice(0, 8).toUpperCase()}`,
      `MkulimaLink Order Payment`
    );

    const payment = await prisma.payment.create({
      data: {
        orderId,
        userId,
        amount: order.totalAmount,
        method: 'MPESA_STK',
        status: 'PENDING',
        phoneNumber,
        mpesaCheckoutRequestId: stkResult.CheckoutRequestID,
        merchantRequestId: stkResult.MerchantRequestID,
      },
    });

    res.json({
      success: true,
      message: 'STK Push sent. Please complete payment on your phone.',
      data: {
        paymentId: payment.id,
        checkoutRequestId: stkResult.CheckoutRequestID,
        customerMessage: stkResult.CustomerMessage,
      },
    });
  } catch (err) {
    logger.error('Initiate payment error', err);
    res.status(500).json({ success: false, message: 'Failed to initiate payment' });
  }
};

export const mpesaCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = parseMpesaCallback(req.body);
    logger.info('M-Pesa callback received', parsed);

    const payment = await prisma.payment.findFirst({
      where: { mpesaCheckoutRequestId: parsed.checkoutRequestId },
      include: { order: { include: { farmer: { select: { phone: true } } } } },
    });

    if (!payment) {
      logger.warn('Payment not found for callback', { checkoutRequestId: parsed.checkoutRequestId });
      res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
      return;
    }

    if (parsed.resultCode === 0) {
      // Payment successful
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            mpesaReceiptNumber: parsed.mpesaReceiptNumber,
            mpesaTransactionId: parsed.mpesaReceiptNumber,
            resultCode: parsed.resultCode,
            resultDesc: parsed.resultDesc,
          },
        }),
        prisma.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: 'COMPLETED', status: 'CONFIRMED' },
        }),
      ]);

      // Notify buyer and farmer
      await createNotification(payment.userId, 'Payment Successful', `Payment of KES ${parsed.amount} received. Receipt: ${parsed.mpesaReceiptNumber}`, 'PAYMENT', { orderId: payment.orderId });
      await createNotification(payment.order.farmerId, 'Payment Received', `Payment of KES ${parsed.amount} for your order has been received.`, 'PAYMENT', { orderId: payment.orderId });

      io.to(`user-${payment.userId}`).emit('payment-success', { orderId: payment.orderId, receiptNumber: parsed.mpesaReceiptNumber });
      io.to(`user-${payment.order.farmerId}`).emit('payment-received', { orderId: payment.orderId });
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          resultCode: parsed.resultCode,
          resultDesc: parsed.resultDesc,
          failureReason: parsed.resultDesc,
        },
      });

      await createNotification(payment.userId, 'Payment Failed', `Payment failed: ${parsed.resultDesc}`, 'PAYMENT', { orderId: payment.orderId });
      io.to(`user-${payment.userId}`).emit('payment-failed', { orderId: payment.orderId, reason: parsed.resultDesc });
    }

    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (err) {
    logger.error('M-Pesa callback error', err);
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' }); // Always return 200 to M-Pesa
  }
};

export const mpesaB2CResult = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('B2C result received', req.body);
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (err) {
    logger.error('B2C result error', err);
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
};

export const checkPaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { checkoutRequestId } = req.params;
    const statusResult = await checkSTKStatus(checkoutRequestId);
    res.json({ success: true, data: statusResult });
  } catch (err) {
    logger.error('Check payment status error', err);
    res.status(500).json({ success: false, message: 'Failed to check payment status' });
  }
};

export const getOrderPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const payments = await prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: payments });
  } catch (err) {
    logger.error('Get order payments error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
};
