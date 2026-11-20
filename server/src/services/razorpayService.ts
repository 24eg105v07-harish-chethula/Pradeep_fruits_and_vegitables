import crypto from 'crypto';
import Razorpay from 'razorpay';

let razorpayInstance: Razorpay | null = null;

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret || key_id.includes('placeholder')) {
    return null;
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id,
      key_secret
    });
  }
  return razorpayInstance;
};

export const createRazorpayOrder = async (amountInINR: number, receiptId: string) => {
  const rzp = getRazorpayInstance();
  const amountInPaise = Math.round(amountInINR * 100);

  if (!rzp) {
    // If Razorpay keys are not yet configured with real credentials, provide simulated test order
    return {
      id: `order_test_${Date.now()}`,
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
      status: 'created',
      isSimulated: true
    };
  }

  const options = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: receiptId,
    payment_capture: 1
  };

  return await rzp.orders.create(options);
};

export const verifyRazorpaySignature = (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean => {
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  // In test / simulation mode
  if (!key_secret || key_secret.includes('placeholder')) {
    return true;
  }

  const generatedSignature = crypto
    .createHmac('sha256', key_secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return generatedSignature === razorpaySignature;
};
