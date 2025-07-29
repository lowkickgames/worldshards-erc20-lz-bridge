// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import { WorldShardsOFT } from "../WorldShardsOFT.sol";

// @dev WARNING: This is for testing purposes only
contract WorldShardsOFTMock is WorldShardsOFT {
    constructor(address _lzEndpoint) WorldShardsOFT(_lzEndpoint) {}

    function initialize(
        string memory _name,
        string memory _symbol,
        address _delegate
    ) public override initializer {
        __OFT_init(_name, _symbol, _delegate);
        __Ownable_init(_delegate);
    }

    function mint(address _to, uint256 _amount) public {
        _mint(_to, _amount);
    }
}
