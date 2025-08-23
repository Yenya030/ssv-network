// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @notice ERC20 token used to test reentrancy protections in SSVNetwork
interface ISSVNetworkLike {
    function withdrawAllOperatorEarnings(uint64 operatorId) external;
}

contract ReentrantToken is ERC20, Ownable {
    address public target; // SSVNetwork address to call
    address public trigger; // address which when receiving tokens triggers reentrancy
    uint64 public operatorId;
    bool internal reentered;

    constructor() ERC20("Reentrant Token", "RTK") {
        _mint(msg.sender, 1000000000000000000000); // mint initial supply
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function setReentrancyTarget(address _target, address _trigger, uint64 _operatorId) external {
        target = _target;
        trigger = _trigger;
        operatorId = _operatorId;
    }

    function _transfer(address from, address to, uint256 amount) internal override {
        super._transfer(from, to, amount);
        if (!reentered && to == trigger && target != address(0)) {
            reentered = true;
            // Attempt a reentrant call; ignore result to avoid revert
            target.call(
                abi.encodeWithSignature("withdrawAllOperatorEarnings(uint64)", operatorId)
            );
        }
    }
}

