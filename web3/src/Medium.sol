// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "./PriceConverter.sol";

// Decentralize Medium
contract Medium {
    // Use PriceCoverter library to convert CryptoCurrency to USD
    using PriceConverter for uint256;

    // Contract Owner
    address private immutable owner;

    // Pricefeed from Chainlink
    AggregatorV3Interface private priceFeed;

    // Minimum tip in USD = 1 dollar
    uint256 public constant MINIMUM_TIP_IN_USD = 1e18;

    // Fees collected from Author tip withdrawal
    uint256 private feesCollected;

    // Post struct
    struct Post {
        uint256 id;
        address author;
        string title;
        string summary;
        string content;
        uint256 tipEarned;
    }

    struct Comment {
        uint256 id;
        address commenterAddress;
        string content;
    }

    // PostId to Post
    mapping(uint256 id => Post) public posts;

    // PostId to ClapCount
    mapping(uint256 postId => uint32 clapCount) public postIdToClapCount;

    // PostId to TipPost
    mapping(uint256 postId => uint256 tipAmount) public postIdToTipPost;

    // PostId to TipPost
    mapping(uint256 postId => Comment[] comments) public postIdToComments;

    // PostCount
    uint256 public postCount;

    // CommentId
    uint256 private commentId;

    // Events
    event PostCreated(
        uint256 indexed id,
        address author,
        string title,
        string summary
    );
    event TipPost(uint256 indexed postId, address donator, uint256 tipAmount);
    event WithdrawTip(
        uint256 indexed postId,
        address author,
        uint256 tipEarned,
        uint256 fees
    );
    event ClapPost(
        uint256 indexed postId,
        uint8 clapCount,
        address clapperAddress
    );
    event CommentPost(
        uint256 indexed postId,
        uint256 commentId,
        address commenterAddress,
        string content
    );

    // Custom Errors
    error NotAuthor();
    error NotOwner();
    error TipAmountInsufficient();
    error PostNotFound();

    // Constructor
    constructor(address _priceFeed) {
        // Set pricefeed address based on network use
        priceFeed = AggregatorV3Interface(_priceFeed);

        // Set contract owner
        owner = msg.sender;
    }

    // Create Post
    function createPost(
        string memory _title,
        string memory _summary,
        string memory _content
    ) public {
        // Increment postCount
        postCount++;

        // Set PostId to new Post
        posts[postCount] = Post({
            id: postCount,
            author: msg.sender,
            title: _title,
            summary: _summary,
            content: _content,
            tipEarned: 0
        });

        // Emit PostCreated event
        emit PostCreated(postCount, msg.sender, _title, _summary);
    }

    // Comment a post
    function commentPost(
        uint256 _postId,
        string memory _content
    ) public {
        // Check if post exist
        if (posts[_postId] != bytes(0)) revert PostNotFound();

        // Increment commentId
        commentId++;

        // push comment to postIdToComments
        postIdToComments[_postId].push(Comment({
            id: commentId,
            commenterAddress: msg.sender,
            content: _content
        }));

        // Emit CommentPost event
        emit CommentPost(_postId, commentId, msg.sender);
    }

    // Tip Post
    function tipPost(uint256 _id) public payable {
        // Author can't tip owned Post
        require(
            msg.sender != posts[_id].author,
            "Author cannot tip owned post."
        );

        // Check if value send is equal or greater than 1 dollar
        if (msg.value.getConversionRate(priceFeed) <= MINIMUM_TIP_IN_USD) {
            revert TipAmountInsufficient();
        }

        // Add tip post to current tip post
        postIdToTipPost[_id] += msg.value;

        // Add tip earned post to current tip post
        posts[_id].tipEarned += msg.value;

        // Emit TipPost event
        emit TipPost(_id, msg.sender, msg.value);
    }

    // Withdraw Tip
    function withdrawTip(
        uint256 _id
    ) public payable onlyAuthor(posts[_id].author) {
        // Get tip amount in a post
        uint256 tipAmount = postIdToTipPost[_id];

        // Calculate 3% of tip for contract owner
        uint256 fee = (tipAmount * 3) / 100;

        // Reset Tip Amount to 0
        postIdToTipPost[_id] = 0;

        // Calculate tipEarned after subtract tipAmount by 3% fee to Author
        uint256 tipEarned = tipAmount - fee;

        // Send tipEarned to Author
        bool tipSuccess = payable(posts[_id].author).send(tipEarned);

        // Revert if failed to send tipEarned to Author
        require(tipSuccess, "Failed to send tip to author.");

        // Add fee to total fees collected
        feesCollected += fee;

        // Emit WihtdrawTip event
        emit WithdrawTip(_id, posts[_id].author, tipEarned, fee);
    }

    // Get Post
    function getPost(uint256 _id) public view returns (Post memory) {
        return posts[_id];
    }

    function clapPost(uint256 _id, uint8 _clapCount) public {
        // Revert if msg.sender is the Author
        require(
            posts[_id].author != msg.sender,
            "Author cannot clap owned post."
        );

        // Add clapCount to post's total clap count
        postIdToClapCount[_id] += _clapCount;

        // Emit ClapPost event
        emit ClapPost(_id, _clapCount, msg.sender);
    }

    // Get Contract Owner
    function getOwner() public view returns (address) {
        return owner;
    }

    // Withdraw feesCollected to owner
    function withdrawFees() public payable onlyOwner {
        bool success = payable(owner).send(feesCollected);
        require(success, "Failed to send fees to owner.");
    }

    // Modifier for onlyAuthor
    modifier onlyAuthor(address _author) {
        if (msg.sender != _author) revert NotAuthor();
        _;
    }

    // Modifier for onlyOwner
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }
}
