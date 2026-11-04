<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Absence extends Model
{
    protected $fillable = [
        'student_id',
        'session_id',
        'marked_by',
        'marked_at',
        'category',
        'billet_id',
        'justification_note',
    ];

    protected $casts = [
        'marked_at' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(Session::class);
    }

    public function markedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'marked_by');
    }

    public function billet(): BelongsTo
    {
        return $this->belongsTo(Billet::class);
    }
}
