// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DAOGovernance
 * @dev Community voting on new project registrations and platform parameters
 * Token holders vote to approve/reject carbon projects — decentralized verification
 */
contract DAOGovernance is Ownable {

    uint256 public proposalCount;
    uint256 public votingDuration = 3 days;
    uint256 public quorumVotes = 3; // minimum votes needed

    enum ProposalStatus { Pending, Active, Passed, Rejected, Executed }
    enum Vote { None, For, Against }

    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        string projectName;
        string country;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        ProposalStatus status;
        bool executed;
    }

    mapping(uint256 => Proposal) public proposals;
    // proposalId => voter => vote
    mapping(uint256 => mapping(address => Vote)) public votes;
    // member registry
    mapping(address => bool) public isDAOMember;
    address[] public members;

    event ProposalCreated(uint256 indexed proposalId, address proposer, string projectName);
    event Voted(uint256 indexed proposalId, address voter, bool support);
    event ProposalExecuted(uint256 indexed proposalId, bool passed);
    event MemberAdded(address member);

    constructor() Ownable(msg.sender) {
        isDAOMember[msg.sender] = true;
        members.push(msg.sender);
    }

    function addMember(address member) external onlyOwner {
        require(!isDAOMember[member], "Already a member");
        isDAOMember[member] = true;
        members.push(member);
        emit MemberAdded(member);
    }

    function createProposal(
        string memory description,
        string memory projectName,
        string memory country
    ) external returns (uint256) {
        require(isDAOMember[msg.sender], "Not a DAO member");

        uint256 proposalId = proposalCount++;
        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            description: description,
            projectName: projectName,
            country: country,
            votesFor: 0,
            votesAgainst: 0,
            deadline: block.timestamp + votingDuration,
            status: ProposalStatus.Active,
            executed: false
        });

        emit ProposalCreated(proposalId, msg.sender, projectName);
        return proposalId;
    }

    function castVote(uint256 proposalId, bool support) external {
        require(isDAOMember[msg.sender], "Not a DAO member");
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.Active, "Proposal not active");
        require(block.timestamp <= proposal.deadline, "Voting period ended");
        require(votes[proposalId][msg.sender] == Vote.None, "Already voted");

        votes[proposalId][msg.sender] = support ? Vote.For : Vote.Against;

        if (support) {
            proposal.votesFor++;
        } else {
            proposal.votesAgainst++;
        }

        emit Voted(proposalId, msg.sender, support);
    }

    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp > proposal.deadline, "Voting still ongoing");
        require(!proposal.executed, "Already executed");

        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;
        require(totalVotes >= quorumVotes, "Quorum not reached");

        proposal.executed = true;
        if (proposal.votesFor > proposal.votesAgainst) {
            proposal.status = ProposalStatus.Passed;
        } else {
            proposal.status = ProposalStatus.Rejected;
        }

        emit ProposalExecuted(proposalId, proposal.status == ProposalStatus.Passed);
    }

    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        return proposals[proposalId];
    }

    function getMemberCount() external view returns (uint256) {
        return members.length;
    }
}