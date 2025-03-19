// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;
import {Token} from "./Token.sol";

contract Factory {
    uint256 public immutable i_fee;
    address public owner;

    uint256 public totalTokens;
    address[] public tokens;

    mapping(address => TokenSale) public tokenToSale;

    struct TokenSale {
        address token;
        string name;
        address creator;
        uint256 sold;
        uint256 raised;
        bool isOpen;
    }

    event Created(address indexed token);

    constructor(uint256 _fee) {
        i_fee = _fee;
        owner = msg.sender;
    }

    function getTokenSale(
        uint256 _index
    ) public view returns (TokenSale memory) {
        return tokenToSale[tokens[_index]];
    }

    function create(
        string memory _name,
        string memory _symbol
    ) external payable {
        //Make sure that the FEE is correct
        require(msg.value >= i_fee, "Factory: insufficient fee");
        // create a new token
        Token token = new Token(msg.sender, _name, _symbol, 1_000_000 ether);

        //save the token for later use
        tokens.push(address(token));

        totalTokens++;

        //list the token for sale
        TokenSale memory sale = TokenSale(
            address(token),
            _name,
            msg.sender,
            0,
            0,
            true
        );

        tokenToSale[address(token)] = sale;

        //Tell people it's Live
        emit Created(address(token));
    }

    function buy(address _token, uint256 _amount) external payable {
        Token(_token).transfer(msg.sender, _amount);
        // TokenSale storage sale = tokenToSale[_token];
        // require(sale.isOpen, "Factory: token is not for sale");
        // require(msg.value >= _amount, "Factory: insufficient funds");

        // sale.sold += _amount;
        // sale.raised += msg.value;

        // payable(sale.creator).transfer(msg.value);
    }
}
