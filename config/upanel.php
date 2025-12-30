<?php

declare(strict_types=1);

return [
    /*
    |--------------------------------------------------------------------------
    | Agent Configuration
    |--------------------------------------------------------------------------
    |
    | Configure the UPanel agent that runs on managed servers.
    |
    */

    'agent_image' => env('UPANEL_AGENT_IMAGE', 'ghcr.io/inteteam/upanel-agent:latest'),

    /*
    |--------------------------------------------------------------------------
    | Server Offline Threshold
    |--------------------------------------------------------------------------
    |
    | Number of minutes without a heartbeat before marking a server as offline.
    |
    */

    'offline_threshold_minutes' => env('UPANEL_OFFLINE_THRESHOLD', 5),
];
