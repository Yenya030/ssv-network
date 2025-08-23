# Tested Attack Vectors

| Vector | Severity | Status | Notes |
|-------|----------|--------|-------|
| Unauthorized update of network fee through SSVDAO module | High | Vulnerable | `SSVDAO.updateNetworkFee` lacks access control allowing any caller to change the fee. |
| Unauthorized minting of SSV token | Medium | Mitigated | `SSVToken.mint` is restricted to owner; non-owners revert. |
