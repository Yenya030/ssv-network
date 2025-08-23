

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

## Reentrancy on Cluster Withdrawals
- **Objective**: Ensure external token transfers in `SSVClusters.withdraw` do not enable reentrancy to drain funds.
- **Approach**: Reviewed withdrawal logic and executed full Hardhat test suite.
- **Result**: No reentrancy observed; state updates occur before token transfer, preventing balance manipulation.

## Unauthorized DAO Fee Updates
- **Objective**: Verify only the DAO (owner) can update fee-related parameters.
- **Approach**: Covered by existing tests executed via `npm test`.
- **Result**: Tests confirm unauthorized callers revert with `caller is not the owner`.

## Static Analysis Attempt
- **Objective**: Run Slither for additional vulnerability detection.
- **Approach**: Attempted `slither contracts/SSVNetwork.sol`; compilation failed due to missing dependency remappings.
- **Result**: Static analysis could not complete; manual review performed instead.

- Duplicate operator registration: Verified that attempting to register an operator with an existing public key reverts with `OperatorAlreadyExists`, preventing duplicate operator creation.

| Vector | Severity | Status | Notes |
|-------|----------|--------|-------|
| Unauthorized update of network fee through SSVDAO module | High | Vulnerable | `SSVDAO.updateNetworkFee` lacks access control allowing any caller to change the fee. |
| Unauthorized minting of SSV token | Medium | Mitigated | `SSVToken.mint` is restricted to owner; non-owners revert. |
| Unauthorized update of maximum operator fee through SSVDAO module | High | Vulnerable | `SSVDAO.updateMaximumOperatorFee` lacks access control enabling arbitrary fee limits. |