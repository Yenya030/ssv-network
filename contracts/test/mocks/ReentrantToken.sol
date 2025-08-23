// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ISSVNetworkDAO {
    function withdrawNetworkEarnings(uint256 amount) external;
}

contract ReentrantToken is ERC20, Ownable {
    address public target;
    uint256 private attackAmount;
    bool private attackEnabled;

    constructor() ERC20("Reentrant Token", "RNT") {
        _mint(msg.sender, 1e24);
    }

    function setTarget(address _target) external onlyOwner {
        target = _target;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function enableAttack(uint256 amount) external {
        attackEnabled = true;
        attackAmount = amount;
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        bool result = super.transfer(to, amount);
        if (attackEnabled) {
            attackEnabled = false;
            target.call(abi.encodeWithSignature("withdrawNetworkEarnings(uint256)", attackAmount));
        }
        return result;
    }
}

