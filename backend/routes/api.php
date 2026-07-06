<?php

// ============================================================
//  routes/api.php  —  SokoMoja Chunk 1: Auth + User Management
//
//  Paste this into your existing routes/api.php, replacing
//  whatever Laravel put there by default.
// ============================================================

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\PickupZoneController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SellerProductController;
use App\Http\Controllers\Api\SellerInventoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\SellerOrderController;
use App\Http\Controllers\Api\MpesaController;
use App\Http\Controllers\Api\SellerSalesController;
use App\Http\Controllers\Api\SellerScheduleController;
use App\Http\Controllers\Api\SellerSummaryController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\AdminReportController;
use App\Http\Controllers\Api\AdminProfileController;
use App\Http\Controllers\Api\AdminFarmerController;
use App\Http\Controllers\Api\PasswordResetController;

// ── Auth (public — no token needed) ─────────────────────────────────
Route::prefix('auth')->group(function () {
    // Throttled — unmitigated brute-force/credential-stuffing/reset-spam otherwise
    Route::post('register', [AuthController::class, 'register'])->middleware('throttle:5,1');
    Route::post('login',    [AuthController::class, 'login'])->middleware('throttle:5,1');

    // Forgot / reset password — public
    Route::post('forgot-password', [PasswordResetController::class, 'sendResetLink'])->middleware('throttle:5,1');
    Route::post('reset-password',  [PasswordResetController::class, 'resetPassword'])->middleware('throttle:5,1');

    // These require a valid token
    Route::middleware('auth:api')->group(function () {
        Route::post('logout',  [AuthController::class, 'logout']);
        Route::get('me',       [AuthController::class, 'me']);
        Route::post('refresh', [AuthController::class, 'refresh']);
    });
});

// ── Public endpoints (no token needed) ──────────────────────────────
// Zones dropdown used on Register + Profile pages
Route::get('pickup-zones', [PickupZoneController::class, 'index']);

// M-Pesa callback — must be public (Safaricom hits this directly)
Route::post('payments/mpesa/callback', [MpesaController::class, 'callback']);

// Products + Categories (public browsing)
Route::get('categories',       [ProductController::class, 'categories']);
Route::get('products',         [ProductController::class, 'index']);
Route::get('products/{id}',    [ProductController::class, 'show']);

// ── Authenticated routes (any logged-in user) ────────────────────────
Route::middleware('auth:api')->group(function () {

    // Own profile
    Route::get('profile',            [ProfileController::class, 'show']);
    Route::patch('profile',          [ProfileController::class, 'update']);
    Route::post('profile/avatar',    [ProfileController::class, 'uploadAvatar']);
    Route::delete('profile/avatar',  [ProfileController::class, 'removeAvatar']);

});

// ── Buyer-only routes ────────────────────────────────────────────────
Route::middleware(['auth:api', 'role:buyer'])->group(function () {

    // Orders
    Route::post('orders',            [OrderController::class, 'store']);
    Route::get('orders',             [OrderController::class, 'index']);
    Route::get('orders/{id}',        [OrderController::class, 'show']);
    Route::patch('orders/{id}/cancel', [OrderController::class, 'cancelPending']);

    // Payments
    Route::post('payments/mpesa/initiate',    [MpesaController::class, 'initiate']);
    Route::get('payments/{orderId}/status',   [MpesaController::class, 'status']);

    // Reviews
    Route::post('reviews', [ReviewController::class, 'store']);

});

// ── Seller-only routes ───────────────────────────────────────────────
Route::middleware(['auth:api', 'role:seller'])->prefix('seller')->group(function () {

    // Product CRUD (verified sellers only — enforced in controller)
    Route::get('products',          [SellerProductController::class, 'index']);
    Route::post('products',         [SellerProductController::class, 'store']);
    Route::patch('products/{id}',   [SellerProductController::class, 'update']);

    // Inventory management
    Route::get('inventory',         [SellerInventoryController::class, 'index']);
    Route::patch('inventory/{id}',  [SellerInventoryController::class, 'update']);

    // Orders management
    Route::get('orders',            [SellerOrderController::class, 'index']);
    Route::patch('orders/{id}',     [SellerOrderController::class, 'update']);

    // Dashboard summary
    Route::get('summary',                      [SellerSummaryController::class, 'index']);

    // POS sales
    Route::get('sales',                        [SellerSalesController::class, 'index']);
    Route::post('sales',                       [SellerSalesController::class, 'store']);

    // Collection schedule
    Route::get('schedule',                     [SellerScheduleController::class, 'index']);
    Route::post('schedule',                    [SellerScheduleController::class, 'store']);
    Route::delete('schedule/{id}',             [SellerScheduleController::class, 'destroy']);

});

// ── Admin-only routes ────────────────────────────────────────────────
Route::middleware(['auth:api', 'role:admin'])->prefix('admin')->group(function () {

    // Users management
    Route::get('users',                    [AdminUserController::class, 'index']);
    Route::patch('users/{id}',             [AdminUserController::class, 'updateStatus']);
    Route::patch('users/{id}/verify',      [AdminUserController::class, 'verify']);
    Route::post('users/{id}/reset-password', [AdminUserController::class, 'resetPassword']);

    // Zones management
    Route::get('zones',                    [PickupZoneController::class, 'adminIndex']);
    Route::post('zones',                   [PickupZoneController::class, 'store']);

    // Overview + Reports
    Route::get('overview',                 [AdminReportController::class, 'overview']);
    Route::get('reports',                  [AdminReportController::class, 'index']);
    Route::post('reports',                 [AdminReportController::class, 'store']);

    // Admin profile
    Route::get('profile',                  [AdminProfileController::class, 'show']);
    Route::patch('profile',                [AdminProfileController::class, 'update']);
    Route::post('profile/avatar',          [AdminProfileController::class, 'uploadAvatar']);
    Route::post('profile/password',        [AdminProfileController::class, 'updatePassword']);

    // Create administrator
    Route::post('users/create',            [AdminProfileController::class, 'createAdmin']);

    // Farmer detail
    Route::get('farmers/{id}',             [AdminFarmerController::class, 'show']);
    Route::patch('farmers/{id}/unverify',  [AdminFarmerController::class, 'unverify']);

    // Zones — update/delete
    Route::patch('zones/{id}',             [PickupZoneController::class, 'update']);
    Route::delete('zones/{id}',            [PickupZoneController::class, 'destroy']);

});

// ── Public — no auth needed ──────────────────────────────────────────
Route::get('products/{productId}/reviews', [ReviewController::class, 'productReviews']);