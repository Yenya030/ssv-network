// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @notice ERC20 token to test generic reentrancy scenarios
contract ReentrantTokenGeneric is ERC20, Ownable {
    address public target;
    address public trigger;
    bytes public data;
    bool internal reentered;

    constructor() ERC20("Reentrant Token Generic", "RTG") {
        _mint(msg.sender, 1000000000000000000000);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function setReentrancyTarget(address _target, address _trigger, bytes calldata _data) external {
        target = _target;
        trigger = _trigger;
        data = _data;
    }

    function _transfer(address from, address to, uint256 amount) internal override {
        super._transfer(from, to, amount);
        if (!reentered && to == trigger && target != address(0)) {
            reentered = true;
            target.call(data);
        }
    }
}

