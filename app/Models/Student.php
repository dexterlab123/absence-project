<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    protected $fillable = ['full_name', 'student_number', 'birth_date'];

    protected $casts = [
        'birth_date' => 'date',
    ];

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(Group::class, 'enrollments')
            ->withPivot(['academic_year_id', 'joined_at', 'left_at'])
            ->withTimestamps();
    }

    public function absences(): HasMany
    {
        return $this->hasMany(Absence::class);
    }
}
