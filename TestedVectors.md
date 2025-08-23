# Tested Attack Vectors

This document tracks security vectors analyzed in the repository.

| Vector | Severity | Status | Notes |
|-------|----------|--------|-------|
| Reentrancy in operator withdrawals via malicious token | High | Mitigated | Uses SSV ERC20 token with no callbacks, preventing reentrancy. |
| Unauthorized network fee updates | High | Mitigated | `updateNetworkFee` and related functions are restricted by `onlyOwner`. |
| Fee recipient manipulation via `setFeeRecipientAddress` | Medium | Managed | Function only emits an event without state change. |
