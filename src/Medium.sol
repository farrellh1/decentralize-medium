// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "./PriceConverter.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";

contract Medium {
    using PriceConverter for uint256;
    using EnumerableMap for EnumerableMap.UintToAddressMap;

    address private immutable i_owner;
    AggregatorV3Interface private priceFeed;
    uint256 public constant MINIMUM_TIP_IN_USD = 1e18;
    uint256 private feesCollected;
    struct Post {
        uint256 id;
        address author;
        string title;
        string summary;
        string content;
        uint256 tipEarned;
    }
    mapping(uint256 id => Post post) public posts;
    EnumerableMap.UintToAddressMap private postIdToPostAddress;
    mapping(uint256 postId => uint256 clapCount) public postIdToClapCount;
    mapping(uint256 postId => uint256 tipAmount) public postIdToTipPost;
    uint256 private nextPostId = 1;

    event PostCreated(
        uint256 indexed id,
        address author,
        string title,
        string summary
    );

    event TipPost(uint256 indexed postId, address donator, uint256 tipAmount);

    error NotAuthor();
    error NotOwner();
    error TipAmountInsufficient();

    constructor(address _priceFeed) {
        priceFeed = AggregatorV3Interface(_priceFeed);
        i_owner = msg.sender;
    }

    function createPost(
        string memory _title,
        string memory _summary,
        string memory _content
    ) public {
        Post memory newPost = Post({
            id: nextPostId,
            author: msg.sender,
            title: _title,
            summary: _summary,
            content: _content,
            tipEarned: 0
        });

        posts[nextPostId] = newPost;
        postIdToPostAddress.set(nextPostId, newPost);
        emit PostCreated(nextPostId, msg.sender, _title, _summary);
        nextPostId++;
    }

    function tipPost(uint256 _id) public payable {
        require(
            msg.sender != posts[_id].author,
            "Author cannot tip owned post."
        );
        if (msg.value.getConversionRate(priceFeed) <= MINIMUM_TIP_IN_USD) {
            revert TipAmountInsufficient();
        }
        postIdToTipPost[_id] += msg.value;
        posts[_id].tipEarned += msg.value;
        emit TipPost(_id, msg.sender, msg.value);
    }

    function withdrawTip(
        uint256 id
    ) public payable onlyAuthor(posts[id].author) {
        uint256 tipAmount = postIdToTipPost[id];
        uint256 fee = (tipAmount * 3) / 100;
        postIdToTipPost[id] = 0;
        bool tipSuccess = payable(posts[id].author).send((tipAmount - fee));
        feesCollected += fee;
        require(tipSuccess, "Failed to send tip to author.");
    }

    function getPost(uint256 _id) public view returns (Post memory) {
        return posts[_id];
    }

    function clapPost(uint256 _id, uint8 _clapCount) public {
        require(
            posts[_id].author != msg.sender,
            "Author cannot clap owned post."
        );
        postIdToClapCount[_id] += _clapCount;
    }

    function editPost(
        uint256 _id,
        string memory _title,
        string memory _summary,
        string memory _content
    ) public onlyAuthor(posts[_id].author) {
        posts[_id].title = _title;
        posts[_id].summary = _summary;
        posts[_id].content = _content;
    }

    function deletePost(uint256 _id) public onlyAuthor(posts[_id].author) {
        delete posts[_id];
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function withdrawFees() public payable onlyOwner {
        bool success = payable(i_owner).send(feesCollected);
        require(success, "Failed to send fees to owner.");
    }

    modifier onlyAuthor(address _author) {
        if (msg.sender != _author) revert NotAuthor();
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != i_owner) revert NotOwner();
        _;
    }
}
