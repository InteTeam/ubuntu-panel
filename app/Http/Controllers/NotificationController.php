<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class NotificationController extends Controller
{
    public function __construct(
        private readonly NotificationService $notificationService,
    ) {}

    public function index(Request $request): Response
    {
        return Inertia::render('Notifications/Index', [
            'notifications' => $this->notificationService->getForUser($request->user(), 50),
            'unreadCount' => $this->notificationService->getUnreadCount($request->user()),
        ]);
    }

    public function unread(Request $request): JsonResponse
    {
        return response()->json([
            'notifications' => $this->notificationService->getForUser($request->user(), 10),
            'unreadCount' => $this->notificationService->getUnreadCount($request->user()),
        ]);
    }

    public function markAsRead(Request $request, Notification $notification): RedirectResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            abort(403);
        }

        $this->notificationService->markAsRead($notification);

        return back();
    }

    public function markAllAsRead(Request $request): RedirectResponse
    {
        $this->notificationService->markAllAsRead($request->user());

        return back()->with(['alert' => 'All notifications marked as read.', 'type' => 'success']);
    }

    public function destroy(Request $request, Notification $notification): RedirectResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            abort(403);
        }

        $this->notificationService->delete($notification);

        return back();
    }

    public function destroyAll(Request $request): RedirectResponse
    {
        $this->notificationService->deleteAllForUser($request->user());

        return back()->with(['alert' => 'All notifications deleted.', 'type' => 'success']);
    }
}
