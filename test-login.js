const { loginUser } = require('./src/actions/auth.ts');
// Wait, we can't require TS file easily.
// I will write a simple fetch script to hit the server action directly. But server actions are hard to hit directly.
