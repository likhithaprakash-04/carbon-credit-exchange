// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title CarbonCredit
 * @dev ERC-1155 multi-token: each tokenId = one verified carbon project batch
 * 1 token = 1 tonne CO2 equivalent (tCO2e)
 */
contract CarbonCredit is ERC1155, Ownable, Pausable {

    struct CarbonProject {
        string projectName;
        string methodology;
        string country;
        uint256 vintageYear;
        uint256 totalSupply;
        uint256 retired;
        bool isVerified;
        address verifier;
        uint256 registeredAt;
    }

    mapping(uint256 => CarbonProject) public projects;
    uint256 public projectCount;

    // Authorized verifiers (not just owner)
    mapping(address => bool) public isVerifier;

    event ProjectRegistered(uint256 indexed tokenId, string projectName, address indexed verifier);
    event CreditsIssued(uint256 indexed tokenId, address indexed recipient, uint256 amount);
    event CreditsRetired(uint256 indexed tokenId, address indexed holder, uint256 amount, string reason);
    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);

    modifier onlyVerifier() {
        require(isVerifier[msg.sender] || msg.sender == owner(), "Not authorized verifier");
        _;
    }

    constructor() ERC1155("https://api.carboncredits.io/metadata/{id}.json") Ownable(msg.sender) {
        isVerifier[msg.sender] = true;
    }

    function addVerifier(address _verifier) external onlyOwner {
        isVerifier[_verifier] = true;
        emit VerifierAdded(_verifier);
    }

    function removeVerifier(address _verifier) external onlyOwner {
        isVerifier[_verifier] = false;
        emit VerifierRemoved(_verifier);
    }

    function registerProject(
        string memory projectName,
        string memory methodology,
        string memory country,
        uint256 vintageYear
    ) external onlyVerifier returns (uint256) {
        uint256 tokenId = projectCount++;

        projects[tokenId] = CarbonProject({
            projectName: projectName,
            methodology: methodology,
            country: country,
            vintageYear: vintageYear,
            totalSupply: 0,
            retired: 0,
            isVerified: true,
            verifier: msg.sender,
            registeredAt: block.timestamp
        });

        emit ProjectRegistered(tokenId, projectName, msg.sender);
        return tokenId;
    }

    function issueCredits(
        uint256 tokenId,
        address recipient,
        uint256 amount
    ) external onlyVerifier whenNotPaused {
        require(tokenId < projectCount, "Project does not exist");
        require(projects[tokenId].isVerified, "Project not verified");
        require(amount > 0, "Amount must be greater than zero");

        projects[tokenId].totalSupply += amount;
        _mint(recipient, tokenId, amount, "");

        emit CreditsIssued(tokenId, recipient, amount);
    }

    function retireCredits(
        uint256 tokenId,
        uint256 amount,
        string memory retirementReason
    ) external whenNotPaused {
        require(balanceOf(msg.sender, tokenId) >= amount, "Insufficient credits");
        require(amount > 0, "Amount must be greater than zero");
        require(bytes(retirementReason).length > 0, "Retirement reason required");

        projects[tokenId].retired += amount;
        _burn(msg.sender, tokenId, amount);

        emit CreditsRetired(tokenId, msg.sender, amount, retirementReason);
    }

    function getProject(uint256 tokenId) external view returns (CarbonProject memory) {
        require(tokenId < projectCount, "Project does not exist");
        return projects[tokenId];
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}