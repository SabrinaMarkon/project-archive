<?php

namespace Tests\Unit;

use Illuminate\Support\Facades\File;
use Tests\TestCase;

class ValidationConstantsTest extends TestCase
{
    /**
     * Constants should have only one source of truth for both backend and frontend.
     */
    public function test_frontend_and_backend_constants_are_in_sync()
    {
        $json = json_decode(File::get(resource_path('js/constants/validation.json')), true);

        $this->assertSame(255, $json['MAX_TITLE_LENGTH']);
        $this->assertSame(100, $json['MAX_SLUG_LENGTH']);
        $this->assertSame(2000, $json['MAX_DESCRIPTION_LENGTH']);
    }
}