<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Support\CommandSanitizer;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

final class CommandSanitizerTest extends TestCase
{
    #[Test]
    public function it_sanitizes_safe_values(): void
    {
        $result = CommandSanitizer::sanitize('hello-world');
        $this->assertEquals("'hello-world'", $result);
    }

    #[Test]
    public function it_rejects_command_chaining(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        CommandSanitizer::sanitize('hello; rm -rf /');
    }

    #[Test]
    public function it_rejects_pipe_operators(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        CommandSanitizer::sanitize('cat file | grep secret');
    }

    #[Test]
    public function it_rejects_backticks(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        CommandSanitizer::sanitize('hello `whoami`');
    }

    #[Test]
    public function it_rejects_dollar_signs(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        CommandSanitizer::sanitize('hello $USER');
    }

    #[Test]
    public function it_sanitizes_valid_paths(): void
    {
        $result = CommandSanitizer::sanitizePath('/var/www/app');
        $this->assertEquals("'/var/www/app'", $result);
    }

    #[Test]
    public function it_rejects_directory_traversal(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        CommandSanitizer::sanitizePath('/var/www/../etc/passwd');
    }

    #[Test]
    public function it_rejects_relative_paths(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        CommandSanitizer::sanitizePath('var/www/app');
    }

    #[Test]
    public function it_allows_home_directory_paths(): void
    {
        $result = CommandSanitizer::sanitizePath('~/app');
        $this->assertEquals("'~/app'", $result);
    }

    #[Test]
    public function it_validates_ip_addresses(): void
    {
        $this->assertTrue(CommandSanitizer::validateHost('192.168.1.1'));
        $this->assertTrue(CommandSanitizer::validateHost('10.0.0.1'));
        $this->assertTrue(CommandSanitizer::validateHost('::1'));
    }

    #[Test]
    public function it_validates_hostnames(): void
    {
        $this->assertTrue(CommandSanitizer::validateHost('example.com'));
        $this->assertTrue(CommandSanitizer::validateHost('sub.example.com'));
    }

    #[Test]
    public function it_rejects_invalid_hosts(): void
    {
        $this->assertFalse(CommandSanitizer::validateHost('not a host!'));
        $this->assertFalse(CommandSanitizer::validateHost(''));
    }

    #[Test]
    public function it_validates_ports(): void
    {
        $this->assertTrue(CommandSanitizer::validatePort(22));
        $this->assertTrue(CommandSanitizer::validatePort(80));
        $this->assertTrue(CommandSanitizer::validatePort(443));
        $this->assertTrue(CommandSanitizer::validatePort(65535));
        $this->assertFalse(CommandSanitizer::validatePort(0));
        $this->assertFalse(CommandSanitizer::validatePort(65536));
        $this->assertFalse(CommandSanitizer::validatePort(-1));
    }

    #[Test]
    public function it_sanitizes_env_vars(): void
    {
        $vars = [
            'APP_NAME' => 'My App',
            'DB_HOST' => 'localhost',
            'invalid-key' => 'value',
            '123start' => 'bad',
        ];

        $result = CommandSanitizer::sanitizeEnvVars($vars);

        $this->assertArrayHasKey('APP_NAME', $result);
        $this->assertArrayHasKey('DB_HOST', $result);
        $this->assertArrayNotHasKey('invalid-key', $result);
        $this->assertArrayNotHasKey('123start', $result);
    }
}
