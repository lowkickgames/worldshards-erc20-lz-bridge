// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import { OFTAdapterUpgradeable } from "@layerzerolabs/oft-evm-upgradeable/contracts/oft/OFTAdapterUpgradeable.sol";

contract WorldShardsOFTAdapter is OFTAdapterUpgradeable {
    constructor(address _token, address _lzEndpoint) OFTAdapterUpgradeable(_token, _lzEndpoint) {
        require(_lzEndpoint != address(0), "WorldShardsOFTAdapter: Zero lz endpoint");
        _disableInitializers();
    }

    function initialize(address _delegate) public virtual initializer {
        __OFTAdapter_init(_delegate);
        __Ownable_init(_delegate);
    }
}
