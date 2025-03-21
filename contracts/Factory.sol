// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;
import {Token} from "./Token.sol";

contract Factory {
    uint256 public constant TARGET = 3 ether;
    uint256 public constant TOKEN_LIMIT = 500_000 ether;

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
    event Buy(address indexed token, uint256 amount);

    constructor(uint256 _fee) {
        i_fee = _fee;
        owner = msg.sender;
    }

    function getTokenSale(
        uint256 _index
    ) public view returns (TokenSale memory) {
        return tokenToSale[tokens[_index]];
    }

    function getCost(uint256 _sold) public pure returns (uint256) {
        uint256 floor = 0.0001 ether;
        uint256 step = 0.0001 ether;
        uint256 increment = 10000 ether;

        uint256 cost = (step * (_sold / increment)) + floor;
        return cost;
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
        TokenSale storage sale = tokenToSale[_token];

        //Check conditions
        require(sale.isOpen == true, "Factory: token is not for sale");
        require(_amount >= 1 ether, "Factory: Amount too low");
        require(_amount <= 10000 ether, "Factory: Amount exceeded");

        //Calculate the price of 1 token based upon total bought
        uint256 cost = getCost(sale.sold);

        uint256 price = cost * (_amount / 10 ** 18);

        //Make sure enough eth is sent
        require(msg.value >= price, "Factory: insufficient ETH received");

        //Update the sale
        sale.sold += _amount;
        sale.raised += price;

        //Make sure fund raising goal is met
        if (sale.sold >= TOKEN_LIMIT || sale.raised >= TARGET) {
            sale.isOpen = false;
        }

        Token(_token).transfer(msg.sender, _amount);

        //Emit an event
        emit Buy(_token, _amount);

        // payable(sale.creator).transfer(msg.value);
    }

    function deposit(address _token) external {
        //The remaining Token balance and the ETH raised
        // would go into a liquidity pool like uniswap V3
        // for simplicity we'll just transfer remaining
        //tokens and ETH raised to the creator.

        Token token = Token(_token);
        TokenSale memory sale = tokenToSale[_token];

        require(sale.isOpen == false, "Factory: token is still for sale");

        //Transfer the remaining tokens to the creator
        token.transfer(sale.creator, token.balanceOf(address(this)));

        //Transfer ETH raised
        (bool, s) = payable(sale.creator).call{value: sale.raised}("");
        require(s, "Factory: failed to send ETH to creator");
    }
}
