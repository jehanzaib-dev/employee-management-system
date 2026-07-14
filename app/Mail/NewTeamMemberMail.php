<?php

namespace App\Mail;

use App\Models\Employee;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewTeamMemberMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Employee $employee)
    {
        //
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "New team member: {$this->employee->first_name} {$this->employee->last_name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.new-team-member',
        );
    }
}
