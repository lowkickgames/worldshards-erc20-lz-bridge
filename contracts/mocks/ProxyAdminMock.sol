// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import { ProxyAdmin } from "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

contract ProxyAdminMock is ProxyAdmin {
    constructor(address initialOwner) ProxyAdmin(initialOwner) {}
}