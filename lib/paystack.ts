/**
 * Paystack Payment Configuration
 *
 * The API key is loaded from environment variables (.env file)
 * Get your keys from: https://dashboard.paystack.com/#/settings/developer
 */

// Load Paystack public key from environment variables
export const PAYSTACK_PUBLIC_KEY =
  process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_live_your_public_key_here";

/**
 * Paystack Transaction Configuration
 */
export interface PaystackTransactionParams {
  /** User's email address */
  email: string;

  /** Amount in pesewas (multiply cedis amount by 100) */
  amount: number;

  /** Customer's full name */
  firstName?: string;
  lastName?: string;

  /** Customer's phone number */
  phone?: string;

  /** Transaction reference (auto-generated if not provided) */
  reference?: string;

  /** Additional metadata for the transaction */
  metadata?: {
    cart_items?: any[];
    user_id?: string;
    custom_fields?: any[];
  };

  /** Payment channels to allow (default: mobile_money only for Ghana) */
  channels?: ("card" | "bank" | "ussd" | "qr" | "mobile_money")[];
}

/**
 * Generate a unique transaction reference
 */
export function generateTransactionRef(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `PS_${timestamp}_${random}`;
}

/**
 * Convert amount from Cedis to Pesewas (Paystack uses pesewas for Ghana)
 */
export function convertToPesewas(amountInCedis: number): number {
  return Math.round(amountInCedis * 100);
}

/**
 * Convert amount from Pesewas to Cedis
 */
export function convertToCedis(amountInPesewas: number): number {
  return amountInPesewas / 100;
}

/**
 * Format currency for display in Cedis
 */
export function formatCurrency(amount: number): string {
  return `₵${amount.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Prepare transaction parameters for Paystack
 */
export function preparePaystackParams(
  email: string,
  amountInCedis: number,
  options?: Partial<PaystackTransactionParams>,
): PaystackTransactionParams {
  return {
    email,
    amount: convertToPesewas(amountInCedis),
    reference: options?.reference || generateTransactionRef(),
    firstName: options?.firstName,
    lastName: options?.lastName,
    phone: options?.phone,
    metadata: options?.metadata,
    channels: options?.channels || ["mobile_money"], // Default to Mobile Money only (MTN, Telecel, AirtelTigo)
  };
}

/**
 * Payment response type
 */
export interface PaystackPaymentResponse {
  status: "success" | "cancelled" | "failed";
  transactionRef?: string;
  reference?: string;
  message?: string;
  data?: any;
}

/**
 * Verify payment status
 * Note: You should verify payments on your backend for security
 * This is just a helper for the client-side flow
 */
export async function verifyPayment(reference: string): Promise<boolean> {
  try {
    // TODO: Implement backend verification
    // Call your backend API to verify the payment with Paystack
    // Example: const response = await fetch(`${YOUR_API_URL}/verify-payment/${reference}`);

    console.log(
      "⚠️ Payment verification should be done on the backend for security",
    );
    console.log("Reference to verify:", reference);

    // For now, return true for successful payments
    // Replace this with actual backend verification
    return true;
  } catch (error) {
    console.error("Payment verification error:", error);
    return false;
  }
}
