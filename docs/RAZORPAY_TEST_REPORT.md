# Razorpay Test Report

## Executed locally

| Scenario | Result | Evidence |
| --- | --- | --- |
| Valid checkout callback HMAC | Pass | Unit test generated and verified SHA-256 HMAC. |
| Invalid checkout callback HMAC | Pass | Unit test rejected a mismatched signature. |
| Valid raw webhook HMAC | Pass | Unit test accepted a signature over the exact raw body. |
| Invalid raw webhook HMAC | Pass | Unit test rejected an invalid signature. |
| Existing validation/configuration tests | Pass | Six total `npm test` tests pass. |
| JavaScript syntax | Pass | All `src`, `test`, and checkout JavaScript files passed `node --check`. |

## Not executed

| Scenario | Why |
| --- | --- |
| Razorpay Test Mode order creation and capture | Test Key ID/Secret not supplied. |
| Signature verification against live test API response | Test Key Secret and captured payment ID not supplied. |
| Webhook delivery and event de-duplication | A public test URL and webhook secret were not supplied. |
| Database transaction rollback, stock restore and cross-user authorization | MySQL test database was not supplied. |
| Browser checkout interaction | No logged-in test environment was supplied. |

## Dependency audit

`npm audit --omit=dev` reported 14 transitive dependency findings after installing Razorpay 2.9.8. Do not treat this build as production-ready until these have been evaluated and remediated with compatibility testing.
