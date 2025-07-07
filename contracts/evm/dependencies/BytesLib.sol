// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

library BytesLib {
    function slice(bytes memory _bytes, uint256 _start, uint256 _length) internal pure returns (bytes memory) {
        require(_length + _start <= _bytes.length, "BytesLib: out of bounds");
        bytes memory tempBytes = new bytes(_length);

        uint256 i = 0;
        uint256 j = _start;
        while (i < _length) {
            tempBytes[i] = _bytes[j];
            i++;
            j++;
        }
        return tempBytes;
    }
}
