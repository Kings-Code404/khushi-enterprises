# Functionality Test Report

| Test | Expected result | Actual result | Status | Evidence |
| --- | --- | --- | --- | --- |
| JavaScript syntax | Every server and test JavaScript file parses | `node --check` completed successfully for `src` and `test` | Pass | 2026-10-13 local check |
| Validation utility | Safe positive integers accepted; invalid values rejected | 3 assertions passed | Pass | `npm test` |
| Password policy | Weak passwords rejected; strong passwords accepted | 3 assertions passed | Pass | `npm test` |
| Production configuration | Placeholder secrets rejected | Assertions passed | Pass | `npm test` |
| MySQL startup and migrations | App creates/updates schema with configured database | Not run; no MySQL service or credentials supplied | Not tested | Requires separate test database |
| Registration/login/reset | Cookie, mail and database flows work end-to-end | Not run; requires MySQL and test SMTP | Not tested | Static review performed |
| Checkout transaction | Cart, stock, order and payment record roll back together | Not run; requires MySQL transaction test | Not tested | Source review performed |
| Browser pages/responsiveness | Pages render and navigation works on mobile/desktop | Not run; browser/session test environment unavailable | Not tested | Static template/route review performed |
| Payment gateway | Signed webhook confirms actual payments | Not applicable | Not applicable | No gateway integration was supplied; unsafe browser verification was disabled |

Run locally after configuration:

```powershell
npm ci
npm test
npm run start:prod
```
