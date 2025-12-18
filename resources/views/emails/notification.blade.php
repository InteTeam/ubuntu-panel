<x-mail::message>
# {{ $notification->title }}

{{ $notification->message }}

@if($notification->type === 'deployment')
<x-mail::button :url="$url">
View Deployments
</x-mail::button>
@elseif($notification->type === 'backup')
<x-mail::button :url="$url">
View Backups
</x-mail::button>
@elseif($notification->type === 'server')
<x-mail::button :url="$url">
View Servers
</x-mail::button>
@else
<x-mail::button :url="$url">
View Notifications
</x-mail::button>
@endif

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
