// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;
import {Token} from "./Token.sol";

contract Factory {
    uint256 public immutable i_fee;
    address public owner;

    constructor(uint256 _fee) {
        i_fee = _fee;
        owner = msg.sender;
    }

    function create() {
        // create a new token
        //save the token for later use
        //list the token for sale
        //tell people it's Live
    }
}
