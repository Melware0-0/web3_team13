// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract L2EarnBadges is ERC1155, Ownable {
    string public name = "L2Earn Badges";
    string public symbol = "L2B";

    constructor(string memory baseMetadataURI, address initialOwner)
        ERC1155(baseMetadataURI)
        Ownable(initialOwner)
    {}

    function mint(address account, uint256 id, uint256 amount, bytes memory data)
        external
        onlyOwner
    {
        _mint(account, id, amount, data);
    }

    function setURI(string memory newuri) external onlyOwner {
        _setURI(newuri);
    }
}
