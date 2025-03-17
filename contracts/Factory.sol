// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

contract Factory {
    uint256 public fee;

    constructor(uint256 _fee) {
        fee = _fee;
    }
}
