# Tested Vulnerability Vectors

This document records security-related test vectors explored on the SSV Network codebase.

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

