<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Billet extends Model
{
    protected $fillable = [
        'date',
        'motif',
        'issued_by',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function absences(): HasMany
    {
        return $this->hasMany(Absence::class);
    }

    public function issuedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }
}
