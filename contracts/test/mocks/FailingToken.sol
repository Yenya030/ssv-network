// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice ERC20 token that always fails transfers, used for testing
contract FailingToken is ERC20 {
    constructor() ERC20("Failing Token", "FAIL") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        to; amount; // suppress warnings
        return false;
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        from; to; amount; // suppress warnings
        return false;
    }
}
