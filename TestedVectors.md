# Tested Vectors

- **Unauthorized module update**
  - *Severity*: Medium (access control)
  - *Test File*: `test/security/update-module.ts`
  - *Result*: Non-owner calls revert with "Ownable: caller is not the owner"; vector managed.
