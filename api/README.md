# Deadlines API

## Important dates (alerts)

Create an alert through `POST /api/threads/{threadId}/deadlines` with `kind: "ALERT"`.
Omitting `kind` creates a `DEADLINE`, preserving existing clients and records.
The response includes `kind`; it cannot be changed after creation.

Alerts share permissions, attachments, subscriptions, date editing and scheduled
reminders with deadlines. They have no completion status and do not count toward
thread completion progress. Marking an alert completed returns HTTP 400 with
`deadline.alert-completion-not-allowed`. After its date, an alert remains available
as a past event. Notification payloads include `deadline.kind`; bots should be
updated before the API to render alerts with event wording.

## Notifications

`NotificationService` queues deliveries in the database outbox. Deadline due-date
changes join the deadline update transaction; scheduled reminders are queued by
`NotificationPublishingTask`. Both use the `deadline_notification_recipients`
view to resolve context and deduplicate chats subscribed through deadline, thread,
or organization scopes.

The outbox publisher sends both types to `private.integration.notifications`:

- `DEADLINE_REMINDER`: existing reminder fields, including `timeRemaining`.
- `DEADLINE_DUE_CHANGED`: deadline context plus `oldDue` and `newDue`.

The JSON `type` field identifies the notification. Existing outbox payloads
without it are treated as reminders. `notification_outbox.notification_id` is an
optional reference to a scheduled reminder; due-date changes leave it null.

## OpenAPI contract

[`openapi.json`](openapi.json) is the generated, version-controlled HTTP contract.
The source of truth is the application's controllers, DTOs, OpenAPI annotations,
and Springdoc customizers. Change those sources and regenerate the snapshot;
do not edit the JSON by hand.

Run these commands from `api/` with JDK 25 and Docker available:

```sh
# Export a fresh candidate to build/openapi/openapi.json.
./gradlew exportOpenApi

# Regenerate openapi.json after changing the API.
./gradlew updateOpenApi
git diff -- openapi.json

# Verify the snapshot without modifying it.
./gradlew checkOpenApi
```

Commit the reviewed snapshot together with the corresponding backend changes.
Frontend generators such as Orval can read `../api/openapi.json` without starting
the backend.
