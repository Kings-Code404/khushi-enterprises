const test = require("node:test");
const assert = require("node:assert/strict");
const { positiveInteger, passwordError } = require("../src/utils/validation");
const { assertConfiguration } = require("../src/utils/config");

test("positiveInteger accepts only safe positive integers", () => {
    assert.equal(positiveInteger("2"), 2);
    assert.equal(positiveInteger(0), null);
    assert.equal(positiveInteger("1.2"), null);
});

test("password policy rejects weak passwords", () => {
    assert.match(passwordError("short"), /10 characters/);
    assert.match(passwordError("alllowercase10"), /uppercase/);
    assert.equal(passwordError("SecurePassword10"), null);
});

test("production configuration rejects placeholder secrets", () => {
    assert.throws(() => assertConfiguration({ NODE_ENV: "production", DB_HOST: "localhost", DB_USER: "root", DB_NAME: "db", JWT_SECRET: "REPLACE_ME", SESSION_SECRET: "ok" }));
    assert.doesNotThrow(() => assertConfiguration({ NODE_ENV: "production", DB_HOST: "localhost", DB_USER: "app", DB_NAME: "db", JWT_SECRET: "a-real-long-secret", SESSION_SECRET: "another-real-secret" }));
});
