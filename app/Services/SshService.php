<?php

declare(strict_types=1);

namespace App\Services;

use phpseclib3\Crypt\EC;
use phpseclib3\Crypt\PublicKeyLoader;
use phpseclib3\Net\SSH2;
use RuntimeException;

final class SshService
{
    /**
     * @return array{private: string, public: string}
     */
    public function generateKeypair(): array
    {
        $key = EC::createKey('Ed25519');

        return [
            'private' => $key->toString('OpenSSH'),
            'public' => $key->getPublicKey()->toString('OpenSSH', ['comment' => 'upanel@panel']),
        ];
    }

    public function connect(string $host, int $port, string $username, string $privateKey): SSH2
    {
        $ssh = new SSH2($host, $port);
        $ssh->setTimeout(30);

        $key = PublicKeyLoader::load($privateKey);

        if (!$ssh->login($username, $key)) {
            throw new RuntimeException('SSH authentication failed');
        }

        return $ssh;
    }

    public function execute(SSH2 $ssh, string $command): string
    {
        $output = $ssh->exec($command);

        if ($output === false) {
            throw new RuntimeException('SSH command execution failed');
        }

        return $output;
    }

    public function testConnection(string $host, int $port, string $username, string $privateKey): bool
    {
        try {
            $ssh = $this->connect($host, $port, $username, $privateKey);
            $output = $this->execute($ssh, 'echo "connected"');
            $ssh->disconnect();

            return trim($output) === 'connected';
        } catch (RuntimeException) {
            return false;
        }
    }

    public function getServerInfo(SSH2 $ssh): array
    {
        $osVersion = trim($this->execute($ssh, 'lsb_release -ds 2>/dev/null || cat /etc/os-release | grep PRETTY_NAME | cut -d= -f2 | tr -d \'"\''));
        $cpuCores = (int) trim($this->execute($ssh, 'nproc'));
        $ramMb = (int) trim($this->execute($ssh, "free -m | awk '/^Mem:/{print \$2}'"));
        $diskGb = (int) trim($this->execute($ssh, "df -BG / | awk 'NR==2{print \$2}' | tr -d 'G'"));

        return [
            'os_version' => $osVersion,
            'cpu_cores' => $cpuCores,
            'ram_mb' => $ramMb,
            'disk_gb' => $diskGb,
        ];
    }
}
