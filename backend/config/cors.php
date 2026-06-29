<?php

return [

    // Apply CORS to all API routes
    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',    // Vite dev server (frontend)
        'http://127.0.0.1:5173',    // alternate Vite address
        'http://localhost:3000',    // fallback dev port
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Must be false when using JWT (not cookie-based auth)
    'supports_credentials' => false,

];