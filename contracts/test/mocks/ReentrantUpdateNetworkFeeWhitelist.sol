// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.24;

import "../../interfaces/external/ISSVWhitelistingContract.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

/// @notice Whitelisting contract that attempts reentrancy into SSVNetwork
///         to update the network fee during a view call.
contract ReentrantUpdateNetworkFeeWhitelist is ERC165, ISSVWhitelistingContract {
    address private immutable ssvNetwork;

    constructor(address _ssvNetwork) {
        ssvNetwork = _ssvNetwork;
    }

    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return interfaceId == type(ISSVWhitelistingContract).interfaceId || super.supportsInterface(interfaceId);
    }

    function isWhitelisted(address, uint256) external view override returns (bool) {
        // Attempt to update the network fee via reentrancy using a staticcall.
        // The call will not succeed and any state change is prevented by EVM rules.
        // solhint-disable-next-line no-unused-vars
        (bool success, ) = ssvNetwork.staticcall(abi.encodeWithSignature("updateNetworkFee(uint256)", 123));
        success;
        return true;
    }
}

