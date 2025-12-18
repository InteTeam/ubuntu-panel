<?php

declare(strict_types=1);

test('application redirects to dashboard', function () {
    $response = $this->get('/');

    $response->assertRedirect('/login');
});
