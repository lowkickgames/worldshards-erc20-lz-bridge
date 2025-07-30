// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract TestERC20 is ERC20, ERC20Permit {
    constructor(address recipient) ERC20("TestERC20", "TestERC20") ERC20Permit("TestERC20") {
        _mint(recipient, 5000000000 * 10 ** decimals());
    }
}
