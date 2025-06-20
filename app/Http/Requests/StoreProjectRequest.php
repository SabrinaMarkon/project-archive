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

        return [
            'title' => ['required', 'string', 'max:' . $validation['MAX_TITLE_LENGTH'], 'unique:projects,title'],
            'slug' => ['required', 'string', 'max:' . $validation['MAX_SLUG_LENGTH'], 'unique:projects,slug', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
            'description' => ['nullable', 'string', 'max:' . $validation['MAX_DESCRIPTION_LENGTH']],
        ];
    }
}
