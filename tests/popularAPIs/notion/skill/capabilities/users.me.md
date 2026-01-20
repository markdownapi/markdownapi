# Capability: Retrieve Bot User

~~~meta
id: users.me
transport: HTTP GET /v1/users/me
auth: required
idempotent: true
~~~

## Intention

Retrieve the bot user associated with the current integration token. Use this to verify the integration is working and to get the bot's user ID.
