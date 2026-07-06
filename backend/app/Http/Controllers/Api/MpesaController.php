<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class MpesaController extends Controller
{
    // ── POST /api/payments/mpesa/initiate ────────────────────────────
    public function initiate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id'     => 'required|integer|exists:orders,order_id',
            'phone_number' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $order = Order::where('buyer_id', auth()->id())
            ->with('payment')
            ->find($request->order_id);

        if (!$order) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        if (!$order->payment) {
            return response()->json(['message' => 'Payment record not found.'], 404);
        }

        $phone = $this->formatPhone($request->phone_number);

        if (!$phone) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => ['phone_number' => ['Enter a valid Kenyan phone number (e.g. 0712345678).']],
            ], 422);
        }

        $token = $this->getOAuthToken();

        if (!$token) {
            return response()->json(['message' => 'Could not authenticate with M-Pesa. Please try again.'], 502);
        }

        $shortcode   = config('mpesa.shortcode');
        $passkey     = config('mpesa.passkey');
        $timestamp   = now()->format('YmdHis');
        $password    = base64_encode($shortcode . $passkey . $timestamp);
        $amount      = (int) ceil((float) $order->payment->amount);
        $callbackUrl = config('mpesa.callback_url');

        $response = Http::withToken($token)
            ->post(config('mpesa.stk_push_url'), [
                'BusinessShortCode' => $shortcode,
                'Password'          => $password,
                'Timestamp'         => $timestamp,
                'TransactionType'   => 'CustomerPayBillOnline',
                'Amount'            => $amount,
                'PartyA'            => $phone,
                'PartyB'            => $shortcode,
                'PhoneNumber'       => $phone,
                'CallBackURL'       => $callbackUrl,
                'AccountReference'  => 'SokoMoja-' . $order->order_id,
                'TransactionDesc'   => 'SokoMoja Order #' . $order->order_id,
            ]);

        if (!$response->successful()) {
            Log::error('M-Pesa STK push failed', [
                'order_id' => $order->order_id,
                'response' => $response->json(),
            ]);
            return response()->json(['message' => 'STK push failed. Please try again.'], 502);
        }

        $result = $response->json();

        $order->payment->update([
            'mpesa_checkout_request_id' => $result['CheckoutRequestID'] ?? null,
            'phone_number'              => $phone,
        ]);

        return response()->json([
            'message' => 'STK push sent. Check your phone to complete payment.',
            'data'    => [
                'checkout_request_id' => $result['CheckoutRequestID'] ?? null,
            ],
        ]);
    }

    // ── POST /api/payments/mpesa/callback (public, no auth) ──────────
    public function callback(Request $request)
    {
        Log::info('M-Pesa callback received', $request->all());

        $body = $request->input('Body.stkCallback');

        if (!$body) {
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        $checkoutRequestId = $body['CheckoutRequestID'] ?? null;
        $resultCode        = $body['ResultCode'] ?? 1;

        // mpesa_checkout_request_id is NULL for every Cash/Card order and for
        // M-Pesa orders whose STK push hasn't been sent yet. Matching on a
        // null id would resolve to whereNull() and hit an unrelated payment,
        // so a callback missing this field is rejected outright.
        if (!$checkoutRequestId) {
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        $payment = Payment::where('mpesa_checkout_request_id', $checkoutRequestId)->first();

        if ($payment) {
            if ($resultCode === 0) {
                $items   = collect($body['CallbackMetadata']['Item'] ?? []);
                $receipt = $items->firstWhere('Name', 'MpesaReceiptNumber')['Value'] ?? null;

                $payment->update([
                    'payment_status'       => 'Completed',
                    'mpesa_receipt_number' => $receipt,
                ]);

                $payment->order?->update(['order_status' => 'Confirmed']);
            } else {
                $payment->update(['payment_status' => 'Failed']);
            }
        }

        return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
    }

    // ── GET /api/payments/{orderId}/status ───────────────────────────
    public function status($orderId)
    {
        $order = Order::where('buyer_id', auth()->id())
            ->with('payment')
            ->findOrFail($orderId);

        return response()->json([
            'data' => [
                'order_id'       => $order->order_id,
                'order_status'   => $order->order_status,
                'payment_status' => $order->payment?->payment_status,
            ],
        ]);
    }

    // ── Private helpers ──────────────────────────────────────────────

    private function formatPhone(string $phone): ?string
    {
        $phone = preg_replace('/\s+/', '', $phone);

        // 07XXXXXXXX or 01XXXXXXXX → 2547XXXXXXXX / 2541XXXXXXXX
        if (preg_match('/^0([71]\d{8})$/', $phone, $m)) {
            return '254' . $m[1];
        }
        // Already in 254 format
        if (preg_match('/^254[71]\d{8}$/', $phone)) {
            return $phone;
        }

        return null;
    }

    private function getOAuthToken(): ?string
    {
        $response = Http::withBasicAuth(
            config('mpesa.consumer_key'),
            config('mpesa.consumer_secret')
        )->get(config('mpesa.oauth_url'));

        if ($response->successful()) {
            return $response->json('access_token');
        }

        Log::error('M-Pesa OAuth failed', ['response' => $response->json()]);
        return null;
    }
}
