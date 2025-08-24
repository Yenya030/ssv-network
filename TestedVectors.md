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
| Unauthorized withdrawal of DAO earnings via SSVDAO | High | Vulnerable | `SSVDAO.withdrawNetworkEarnings` lets any caller pull funds if DAO balance is set. |
| Unauthorized withdrawal of network earnings by non-owner | High | Managed | `SSVNetwork.withdrawNetworkEarnings` restricted by `onlyOwner` and tested in `network-fee-withdraw.ts` |
| Unauthorized modification of operator privacy status | Medium | Managed | `setOperatorsPrivateUnchecked`/`setOperatorsPublicUnchecked` verify operator ownership; non-owners revert |
| Unauthorized modification of operator whitelist | Medium | Managed | Non-owners calling `setOperatorsWhitelists` revert with `CallerNotOwnerWithData` (`test/operators/whitelist.ts`) |
| Unauthorized withdrawal of DAO earnings via `SSVDAO.withdrawNetworkEarnings` | Critical | Vulnerable | Missing access control allows any address to drain DAO funds. |
| Unauthorized updates to DAO parameters (operator fee limits, periods, liquidation thresholds) | High | Vulnerable | `SSVDAO` parameter update functions lack access control, enabling arbitrary configuration changes. |
| Date | Vector | Severity | Result |
|------|--------|----------|--------|
| 2025-08-23 | Unauthorized update of maximum operator fee via SSVDAO | High | Vulnerable: any address can change `operatorMaxFee` |

- **Unauthorized Maximum Operator Fee Update**
  - *Severity*: High (access control)
  - *Test File*: `test/security/ssvdao-access-control.ts`
  - *Result*: Any address can invoke `updateMaximumOperatorFee` to alter `operatorMaxFee`.
 
## Reentrancy on Operator Earnings Withdrawal
- **Severity**: Medium
- **Test File**: `test/security/operator-earnings-reentrancy.ts`
- **Result**: No reentrancy observed; state updates precede token transfer, preventing double withdrawals.

- **Unauthorized Declare Operator Fee Period Update**
  - *Severity*: High (access control)
  - *Test File*: `test/security/ssvdao-access-control.ts`
  - *Result*: Any address can call `updateDeclareOperatorFeePeriod` to change `declareOperatorFeePeriod`.

- **Unauthorized Execute Operator Fee Period Update**
  - *Severity*: High (access control)
  - *Test File*: `test/security/ssvdao-access-control.ts`
  - *Result*: Any address can call `updateExecuteOperatorFeePeriod` to change `executeOperatorFeePeriod`.

- **Unauthorized Liquidation Threshold Period Update**
  - *Severity*: High (access control)
  - *Test File*: `test/security/ssvdao-access-control.ts`
  - *Result*: Any address can call `updateLiquidationThresholdPeriod` to change `minimumBlocksBeforeLiquidation`.

- **Unauthorized Minimum Liquidation Collateral Update**
  - *Severity*: High (access control)
  - *Test File*: `test/security/ssvdao-access-control.ts`
  - *Result*: Any address can call `updateMinimumLiquidationCollateral` to change `minimumLiquidationCollateral`.

