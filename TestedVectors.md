# Tested Attack Vectors

| Vector | Severity | Result | Notes |
| ------ | -------- | ------ | ----- |
| Reentrancy via malicious ERC20 token during `withdrawNetworkEarnings` | High | Managed | Attempted reentrant withdrawal using custom token; call did not succeed beyond initial withdrawal. |
