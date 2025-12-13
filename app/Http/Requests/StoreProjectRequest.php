<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     * Slug regex allows lowercase letters, numbers, and hyphens. No underscores, capital letters, spaces, etc. (SEO friendly and clean)
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $validation = json_decode(file_get_contents(resource_path('js/constants/validation.json')), true);

        // Check if we're updating a project or creating a new one. project ID will be null for a new project
        // because it doesn't exist yet.
        $projectId = $this->route('project') ? $this->route('project')->id : null;

        return [
            'title' => [
                'required',
                'string',
                'max:' . $validation['MAX_TITLE_LENGTH'],
                'unique:projects,title,' . $projectId, // unique:<table>,<column>,<ignore_id>. ignore_id is null for a new project
            ],
            'slug' => [
                'required',
                'string',
                'max:' . $validation['MAX_SLUG_LENGTH'],
                'unique:projects,slug,' . $projectId,
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
            ],
            'description' => ['nullable', 'string', 'max:' . $validation['MAX_DESCRIPTION_LENGTH']],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
        ];
    }
}
