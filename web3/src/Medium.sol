// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "./PriceConverter.sol";

/**
 * @title Medium
 * @dev Decentralized content publishing platform with tipping and comments
 */
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

    // Comment struct
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
    event CommentCreated(
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

    /**
     * @dev Initializes the contract with the price feed address and sets the contract owner
     * @param _priceFeed The address of the price feed from Chainlink
     */
    constructor(address _priceFeed) {
        // Set pricefeed address based on network use
        priceFeed = AggregatorV3Interface(_priceFeed);

        // Set contract owner
        owner = msg.sender;
    }

    /**
     * @dev Allows the author to create a new post
     * @param _title The title of the post
     * @param _summary The summary of the post
     * @param _content The content of the post
     */
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

    /**
     * @dev Allows users to comment on a post
     * @param _postId The ID of the post to comment on
     * @param _content The content of the comment
     */
    function createComment(
        uint256 _postId,
        string memory _content
    ) public {
        // Check if post exist
        if (posts[_postId].id == 0) revert PostNotFound();

        // Increment commentId
        commentId++;

        // push comment to postIdToComments
        postIdToComments[_postId].push(Comment({
            id: commentId,
            commenterAddress: msg.sender,
            content: _content
        }));

        // Emit CommentPost event
        emit CommentCreated(_postId, commentId, msg.sender, _content);
    }

    /**
     * @dev Allows users to tip a post
     * @param _id The ID of the post to tip
     */
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

    /**
     * @dev Allows the author to withdraw the tip for a specific post
     * @param _id The ID of the post
     */
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

    /**
     * @dev Retrieves the details of a specific post
     * @param _id The ID of the post
     * @return The details of the post
     */
    function getPost(uint256 _id) public view returns (Post memory) {
        return posts[_id];
    }

    /**
     * @dev Retrieves the comments for a specific post
     * @param _postId The ID of the post
     * @return The comments for the post
     */
    function getComments(uint256 _postId) public view returns (Comment[] memory) {
        return postIdToComments[_postId];
    }

    /**
     * @dev Allows users to clap for a specific post
     * @param _id The ID of the post
     * @param _clapCount The number of claps to add
     */
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

    /**
     * @dev Retrieves the address of the contract owner
     * @return The address of the contract owner
     */
    function getOwner() public view returns (address) {
        return owner;
    }

    /**
     * @dev Allows the contract owner to withdraw the accumulated fees
     */
    function withdrawFees() public payable onlyOwner {
        bool success = payable(owner).send(feesCollected);
        require(success, "Failed to send fees to owner.");
    }

    /**
     * @dev Ensures that only the author of a post can access certain functions
     * @param _author The address of the post author
     */
    modifier onlyAuthor(address _author) {
        if (msg.sender != _author) revert NotAuthor();
        _;
    }

    /**
     * @dev Ensures that only the contract owner can access certain functions
     */
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }
}
