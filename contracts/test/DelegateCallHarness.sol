// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.24;

contract EmptyReverter {
    fallback() external payable {
        revert();
    }
}

contract DelegateCallHarness {
    function callDelegate(address target) external returns (bytes memory) {
        (bool success, bytes memory result) = target.delegatecall("");
        if (!success && result.length > 0) {
            assembly {
                let returndata_size := mload(result)
                revert(add(32, result), returndata_size)
            }
        }
        return result;
    }
}
