
# Tested Attack Vectors

This document tracks security vectors analyzed in the repository.

| Vector | Severity | Status | Notes |
|-------|----------|--------|-------|
| Reentrancy in operator withdrawals via malicious token | High | Mitigated | Uses SSV ERC20 token with no callbacks, preventing reentrancy. |
| Unauthorized network fee updates | High | Mitigated | `updateNetworkFee` and related functions are restricted by `onlyOwner`. |
| Fee recipient manipulation via `setFeeRecipientAddress` | Medium | Managed | Function only emits an event without state change. |

 **Unauthorized module update**
  - *Severity*: Medium (access control)
  - *Test File*: `test/security/update-module.ts`
  - *Result*: Non-owner calls revert with "Ownable: caller is not the owner"; vector managed.