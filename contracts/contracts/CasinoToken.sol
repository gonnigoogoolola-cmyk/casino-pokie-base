// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/**
 * @title CasinoToken
 * @dev ERC20 token minted based on pokie game scores on BASE network
 * Conversion rate: 1 score point = 0.00112 AUD equivalent
 */
contract CasinoToken is ERC20, Ownable, ERC20Burnable {
    // Address authorized to mint tokens (backend API)
    address public minter;
    
    // Conversion rate: score points to token amount (with 18 decimals)
    // 1 point = 0.00112 AUD, stored as fixed point number
    uint256 public constant CONVERSION_RATE = 112e13; // 0.00112 * 10^18
    
    // Events
    event TokensMinted(address indexed player, uint256 score, uint256 tokenAmount);
    event MinterChanged(address indexed oldMinter, address indexed newMinter);
    event GameCompleted(address indexed player, uint256 score, uint256 rewards);

    /**
     * @dev Initialize the casino token
     */
    constructor() ERC20("Casino Pokie Token", "CPOK") {
        minter = msg.sender;
    }

    /**
     * @dev Mint tokens to a player based on their game score
     * @param player Address of the player
     * @param score The score achieved in the pokie game
     */
    function mintForScore(address player, uint256 score) external onlyMinter {
        require(player != address(0), "Invalid player address");
        require(score > 0, "Score must be greater than 0");
        
        // Calculate token amount: score * conversion rate
        uint256 tokenAmount = (score * CONVERSION_RATE) / 10**18;
        
        require(tokenAmount > 0, "Score too low to mint tokens");
        
        // Mint tokens to player
        _mint(player, tokenAmount);
        
        emit TokensMinted(player, score, tokenAmount);
        emit GameCompleted(player, score, tokenAmount);
    }

    /**
     * @dev Bulk mint tokens for multiple players
     * @param players Array of player addresses
     * @param scores Array of game scores
     */
    function batchMintForScores(
        address[] calldata players,
        uint256[] calldata scores
    ) external onlyMinter {
        require(players.length == scores.length, "Arrays must have same length");
        require(players.length > 0, "Arrays cannot be empty");
        
        for (uint256 i = 0; i < players.length; i++) {
            require(players[i] != address(0), "Invalid player address");
            require(scores[i] > 0, "Score must be greater than 0");
            
            uint256 tokenAmount = (scores[i] * CONVERSION_RATE) / 10**18;
            
            if (tokenAmount > 0) {
                _mint(players[i], tokenAmount);
                emit TokensMinted(players[i], scores[i], tokenAmount);
            }
        }
    }

    /**
     * @dev Set a new minter address
     * @param newMinter Address of the new minter
     */
    function setMinter(address newMinter) external onlyOwner {
        require(newMinter != address(0), "Invalid minter address");
        address oldMinter = minter;
        minter = newMinter;
        emit MinterChanged(oldMinter, newMinter);
    }

    /**
     * @dev Modifier to restrict functions to minter only
     */
    modifier onlyMinter() {
        require(msg.sender == minter, "Only minter can call this function");
        _;
    }

    /**
     * @dev Calculate token amount from score
     * @param score The game score
     * @return The token amount that would be minted
     */
    function calculateTokensForScore(uint256 score) external pure returns (uint256) {
        if (score == 0) return 0;
        return (score * CONVERSION_RATE) / 10**18;
    }
}
