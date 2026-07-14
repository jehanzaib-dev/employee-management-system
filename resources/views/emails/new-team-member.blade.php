<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; color: #1f2430;">
    <p>Hi {{ $employee->manager->first_name }},</p>

    <p>
        <strong>{{ $employee->first_name }} {{ $employee->last_name }}</strong> has joined your team
        as {{ $employee->job_title }} in {{ $employee->department->name }},
        effective {{ $employee->hire_date->format('F j, Y') }}.
    </p>

    <p>Email: {{ $employee->email }}</p>
</body>
</html>
