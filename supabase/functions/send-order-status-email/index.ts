import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderStatusEmailRequest {
  customerEmail: string;
  customerName: string;
  orderId: string;
  productName: string;
  status: string;
  totalPrice: number;
}

const getStatusMessage = (status: string): { subject: string; message: string; color: string } => {
  switch (status) {
    case 'processing':
      return {
        subject: 'Your Order is Being Processed',
        message: 'Great news! Your order is now being processed. We are preparing your items for shipment.',
        color: '#3b82f6'
      };
    case 'completed':
      return {
        subject: 'Your Order Has Been Delivered',
        message: 'Your order has been successfully delivered. Thank you for shopping with Bhakthas!',
        color: '#22c55e'
      };
    case 'cancelled':
      return {
        subject: 'Your Order Has Been Cancelled',
        message: 'We regret to inform you that your order has been cancelled. If you have any questions, please contact our support.',
        color: '#ef4444'
      };
    default:
      return {
        subject: 'Order Status Update',
        message: `Your order status has been updated to: ${status}`,
        color: '#f59e0b'
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerEmail, customerName, orderId, productName, status, totalPrice }: OrderStatusEmailRequest = await req.json();

    console.log(`Sending order status email to ${customerEmail} for order ${orderId}`);

    const statusInfo = getStatusMessage(status);

    const emailResponse = await resend.emails.send({
      from: "Bhakthas <onboarding@resend.dev>",
      to: [customerEmail],
      subject: `${statusInfo.subject} - Order #${orderId.slice(0, 8)}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #c45d2c; margin: 0; font-size: 28px;">🕉️ Bhakthas</h1>
              <p style="color: #666; margin-top: 5px;">Divine Shopping Experience</p>
            </div>
            
            <div style="background-color: ${statusInfo.color}; color: white; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h2 style="margin: 0; font-size: 22px;">${statusInfo.subject}</h2>
            </div>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Dear ${customerName},</p>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">${statusInfo.message}</p>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin: 30px 0;">
              <h3 style="color: #333; margin-top: 0;">Order Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Order ID:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333; text-align: right; font-family: monospace;">#${orderId.slice(0, 8)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Product:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333; text-align: right;">${productName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Status:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">
                    <span style="background-color: ${statusInfo.color}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px;">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #666; font-weight: bold;">Total:</td>
                  <td style="padding: 10px 0; color: #c45d2c; text-align: right; font-weight: bold; font-size: 18px;">₹${totalPrice}</td>
                </tr>
              </table>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              If you have any questions about your order, please don't hesitate to contact us.
            </p>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                Thank you for choosing Bhakthas for your spiritual needs.
              </p>
              <p style="color: #c45d2c; font-size: 14px; margin-top: 10px;">
                🙏 Om Namah Shivaya 🙏
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-order-status-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
