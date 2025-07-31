// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import { OFTAdapterUpgradeable } from "@layerzerolabs/oft-evm-upgradeable/contracts/oft/OFTAdapterUpgradeable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

contract WorldShardsOFTAdapter is OFTAdapterUpgradeable {

    string private constant WRONG_ERC20_TOKEN_ERROR = "WorldShardsOFTAdapter: wrong ERC20 token contract";

    constructor(address _token, address _lzEndpoint) OFTAdapterUpgradeable(_token, _lzEndpoint) {
        require(_token != address(0), "WorldShardsOFTAdapter: Zero token");
        _validateERC20Token(_token);

        require(_lzEndpoint != address(0), "WorldShardsOFTAdapter: Zero lz endpoint");

        _disableInitializers();
    }

    function initialize(address _delegate) public virtual initializer {
        require(msg.sender != _delegate, "WorldShardsOFT: Delegate cannot be the same as the sender");

        __OFTAdapter_init(_delegate);
        __Ownable_init(_delegate);
    }

    function _validateERC20Token(address _token) private view {

        try IERC20(_token).balanceOf(address(this)) returns (uint256) {
            // OK
        } catch {
            revert(WRONG_ERC20_TOKEN_ERROR);
        }

        try IERC20(_token).allowance(msg.sender, address(this)) returns (uint256) {
            // OK
        } catch {
            revert(WRONG_ERC20_TOKEN_ERROR);
        }

        try IERC20(_token).totalSupply() returns (uint256) {
            // OK
        } catch {
            revert(WRONG_ERC20_TOKEN_ERROR);
        }

        try IERC20Metadata(_token).decimals() returns (uint8) {
            // OK
        } catch {
            revert(WRONG_ERC20_TOKEN_ERROR);
        }
    }
}
