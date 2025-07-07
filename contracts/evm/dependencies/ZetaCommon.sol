// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ZetaInterfaces.sol";
import "./IZetaConnector.sol";

contract ZetaCommon {
    address public zetaConnector;

    modifier isValidMessage(ZetaInterfaces.ZetaMessage calldata context) {
        require(msg.sender == zetaConnector, "ZetaCommon: invalid sender");
        _;
    }

    modifier isValidRevert(ZetaInterfaces.ZetaMessage calldata context) {
        require(msg.sender == zetaConnector, "ZetaCommon: invalid sender");
        _;
    }

    constructor(address _zetaConnector) {
        zetaConnector = _zetaConnector;
    }
}


