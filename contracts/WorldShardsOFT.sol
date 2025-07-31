// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import { OFTUpgradeable } from "@layerzerolabs/oft-evm-upgradeable/contracts/oft/OFTUpgradeable.sol";

contract WorldShardsOFT is OFTUpgradeable {
    constructor(address _lzEndpoint) OFTUpgradeable(_lzEndpoint) {
        require(_lzEndpoint != address(0), "WorldShardsOFT: Zero lz endpoint");
        _disableInitializers();
    }

    function initialize(string memory _name, string memory _symbol, address _delegate) public virtual initializer {
        __OFT_init(_name, _symbol, _delegate);
        __Ownable_init(_delegate);
    }
}
