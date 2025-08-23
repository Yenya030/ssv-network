


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

| Vector | Severity | Status | Notes |
|-------|---------|--------|-------|
| Unauthorized upgrade by non-owner | High | Managed (reverts) | Non-owner upgrade attempt reverted with `Ownable: caller is not the owner` |

| Date | Vector | Severity | Result |
|------|--------|----------|--------|
| 2025-08-23 | Reentrancy via malicious ERC20 during network earnings withdrawal | Medium | Mitigated: operator earnings unchanged during reentrancy attempt |