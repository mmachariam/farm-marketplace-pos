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

// ── Auth (public — no token needed) ─────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login',    [AuthController::class, 'login']);

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
    Route::post('orders',        [OrderController::class, 'store']);
    Route::get('orders',         [OrderController::class, 'index']);
    Route::get('orders/{id}',    [OrderController::class, 'show']);

    // Payments
    Route::post('payments/mpesa/initiate',    [MpesaController::class, 'initiate']);
    Route::get('payments/{orderId}/status',   [MpesaController::class, 'status']);

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

});

// ── Admin-only routes ────────────────────────────────────────────────
Route::middleware(['auth:api', 'role:admin'])->prefix('admin')->group(function () {

    // Users management
    Route::get('users',                    [AdminUserController::class, 'index']);
    Route::patch('users/{id}',             [AdminUserController::class, 'updateStatus']);
    Route::patch('users/{id}/verify',      [AdminUserController::class, 'verify']);

    // Zones management
    Route::get('zones',                    [PickupZoneController::class, 'adminIndex']);
    Route::post('zones',                   [PickupZoneController::class, 'store']);

});