<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        $users = User::withCount('enrollments', 'purchases')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
        ]);
    }

    public function show(User $user): Response
    {
        $user->load(['enrollments.course', 'purchases.course']);

        $availableCourses = Course::whereNotIn('id', $user->enrolledCourses->pluck('id'))
            ->orderBy('title')
            ->get();

        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
            'enrollments' => $user->enrollments,
            'purchases' => $user->purchases,
            'availableCourses' => $availableCourses,
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'is_admin' => 'required|boolean',
        ]);

        $user->update($validated);

        return redirect()->route('admin.users.index')
            ->with('success', 'User updated successfully.');
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === Auth::id()) {
            abort(403, 'You cannot delete yourself.');
        }

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'User deleted successfully.');
    }

    public function addEnrollment(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
        ]);

        if ($user->isEnrolledIn(Course::find($validated['course_id']))) {
            return back()->with('error', 'User is already enrolled in this course.');
        }

        $user->enrollments()->create([
            'course_id' => $validated['course_id'],
            'enrolled_at' => now(),
        ]);

        return redirect()->route('admin.users.show', $user)
            ->with('success', 'User enrolled successfully.');
    }

    public function removeEnrollment(User $user, $enrollmentId): RedirectResponse
    {
        $enrollment = $user->enrollments()->findOrFail($enrollmentId);
        $enrollment->delete();

        return redirect()->route('admin.users.show', $user)
            ->with('success', 'Enrollment removed successfully.');
    }
}
