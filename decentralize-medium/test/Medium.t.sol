// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "../lib/forge-std/src/Test.sol";
import {Medium} from "../src/Medium.sol";
import {MediumScript} from "../script/Medium.s.sol";

contract MediumTest is Test {
    Medium medium;
    address ownerAddress;
    address authorAddress = makeAddr("author");
    address donatorAddress = makeAddr("donator");

    // Set up the test environment
    function setUp() public {
        MediumScript script = new MediumScript();
        medium = script.run();

        // Get owner address from medium
        ownerAddress = medium.getOwner();
        // Give 1 ether authorAddress
        vm.deal(authorAddress, 1 ether);
        // Give 1 ether donatorAddress
        vm.deal(donatorAddress, 1 ether);
    }

    /**
    * @dev Test for getting the owner of the contract
    */
    function test_GetOwnerContract() public {
        assertEq(medium.getOwner(), msg.sender);
    }

    /**
    * @dev Test for creating a post
    */
    function test_CreatePost() public {
        // Act as author
        vm.prank(authorAddress);

        // Expect emit PostCreated event
        vm.expectEmit();
        emit Medium.PostCreated(1, authorAddress, "title", "summary");

        // Create post
        medium.createPost("title", "summary", "content");

        // Get a post
        Medium.Post memory post = medium.getPost(1);

        // Post assertion
        assertEq(post.id, 1);
        assertEq(post.title, "title");
        assertEq(post.summary, "summary");
        assertEq(post.content, "content");
        assertEq(post.author, authorAddress);
        assertEq(post.tipEarned, 0);
        assertEq(medium.postIdToClapCount(1), 0);
        assertEq(medium.postIdToTipPost(1), 0);
    }

    /**
    * @dev Test for creating a comment to a post
    */
    function test_CreateComment() public createPost {
        vm.prank(donatorAddress);

        // Expect emit CommentCreated event
        vm.expectEmit();
        emit Medium.CommentCreated(1, 1, donatorAddress, "comment");

        // Create comment
        medium.createComment(1, "comment");

        // Get comment
        Medium.Comment memory comment = medium.getComments(1)[0];

        // Comment assertion
        assertEq(comment.id, 1);
        assertEq(comment.commenterAddress, donatorAddress);
        assertEq(comment.content, "comment");
    }

    /**
    * @dev Test for reverting when creating a comment for a post that does not exist
    */
    function test_RevertWhenCreateCommentButPostNotFound() public createPost {
        vm.prank(donatorAddress);

        // Expect revert
        vm.expectRevert(Medium.PostNotFound.selector);

        // Create comment
        medium.createComment(0, "comment");

        // Comment assertion
        Medium.Comment[] memory comments = medium.getComments(1);
        assertEq(comments.length, 0);
    }

    /**
    * @dev Test for tipping a post
    */
    function test_TipPost() public createPost {
        // Act as donator
        vm.prank(donatorAddress);

        // Expect emit TipPost event
        vm.expectEmit();
        emit Medium.TipPost(1, donatorAddress, 0.1 ether);

        // Tip a post
        medium.tipPost{value: 0.1 ether}(1);

        // Check tip amount
        assertEq(medium.postIdToTipPost(1), 0.1 ether);
        assertEq(address(medium).balance, 0.1 ether);
    }

    /**
    * @dev Test for reverting when tipping a post less than a dollar
    */
    function test_RevertWhen_TipPostLessThanADollar() public createPost {
        // Act as donator
        vm.prank(donatorAddress);

        // Expect revert
        vm.expectRevert(Medium.TipAmountInsufficient.selector);
        medium.tipPost{value: 0.001 ether}(1);

        // Check tip amount
        assertEq(medium.postIdToTipPost(1), 0);
        assertEq(address(medium).balance, 0);
    }

    /**
    * @dev Test for reverting when tipping a post as an author
    */
    function test_RevertWhen_TipPostAsAuthor() public createPost {
        // Act as donator
        vm.prank(authorAddress);

        // Expect revert
        vm.expectRevert("Author cannot tip owned post.");
        medium.tipPost{value: 0.1 ether}(1);

        // Check tip amount
        assertEq(medium.postIdToTipPost(1), 0);
        assertEq(address(medium).balance, 0);
    }

    /**
    * @dev Test for withdraw tip as an author
    */
    function test_WithdrawTipAsAuthor() public createPost tipPost {
        // Act as donator
        vm.startPrank(authorAddress);

        // Get previous balances
        uint256 previousAuthorBalance = address(authorAddress).balance;
        uint256 previousContractBalance = address(medium).balance;

        // Withdraw tip
        medium.withdrawTip(1);

        // Get current balances
        uint256 currentAuthorBalance = address(authorAddress).balance;
        uint256 currentContractBalance = address(medium).balance;

        // Calculate fee
        uint256 fee = (0.1 ether * 3) / 100;

        // Post assertion
        assertEq(currentAuthorBalance, previousAuthorBalance + (0.1 ether - fee));
        assertEq(currentContractBalance, previousContractBalance - 0.1 ether + fee);
    }

    /**
    * @dev Test for reverting when withdrawing tip not as an author
    */
    function test_RevertWhen_WithdrawTipNotAsAuthor() public createPost tipPost {
        // Act as donator
        vm.prank(donatorAddress);

        // Expect revert
        vm.expectRevert(Medium.NotAuthor.selector);

        // Withdraw tip
        medium.withdrawTip(1);
    }

    /**
    * @dev Test for withdraw fees as an owner
    */
    function test_WithdrawFeesAsOwner() public createPost tipPost authorWithdrawTip {
        // Get previous balances
        uint256 previousOwnerBalance = address(ownerAddress).balance;

        // Act as owner
        vm.prank(ownerAddress);

        // Withdraw fees
        medium.withdrawFees();

        // Get current balance
        uint256 currentOwnerBalance = address(ownerAddress).balance;

        // Balance assertion
        assertEq(currentOwnerBalance, previousOwnerBalance + ((0.1 ether * 3) / 100));
    }

    /**
    * @dev Test for reverting when withdrawing fees not as an owner
    */
    function test_RevertWhen_WithdrawFeesNotAsOwner() public createPost tipPost authorWithdrawTip {
        // Get previous balances
        uint256 previousOwnerBalance = address(ownerAddress).balance;
        uint256 previousContractBalance = address(medium).balance;

        // Act as author
        vm.prank(authorAddress);

        // Expect revert
        vm.expectRevert(Medium.NotOwner.selector);

        // Withdraw fees
        medium.withdrawFees();

        // Get current balances
        uint256 currentOwnerBalance = address(ownerAddress).balance;
        uint256 currentContractBalance = address(medium).balance;

        // Balance assertion
        assertEq(previousOwnerBalance, currentOwnerBalance);
        assertEq(previousContractBalance, currentContractBalance);
    }

    /**
    * @dev Test for getting a post
    */
    function test_GetPost() public createPost {
        // Get a post
        Medium.Post memory post = medium.getPost(1);

        // Post assertion
        assertEq(post.id, 1);
        assertEq(post.title, "title");
        assertEq(post.summary, "summary");
        assertEq(post.content, "content");
        assertEq(post.author, authorAddress);
        assertEq(post.tipEarned, 0);
        assertEq(medium.postIdToClapCount(1), 0);
        assertEq(medium.postIdToTipPost(1), 0);
    }

    /**
    * @dev Test for getting a post when post not found
    */
    function test_GetPostWhenPostNotFound() public createPost {
        // Get a post
        Medium.Post memory post = medium.getPost(2);

        // Post assertion
        assertEq(post.id, 0);
        assertEq(post.title, "");
        assertEq(post.summary, "");
        assertEq(post.content, "");
        assertEq(post.author, address(0));
        assertEq(post.tipEarned, 0);
        assertEq(medium.postIdToClapCount(1), 0);
        assertEq(medium.postIdToTipPost(1), 0);
    }

    /**
    * @dev Test for clapping a post
    */
    function test_ClapPost() public createPost {
        // Act as donator
        vm.prank(donatorAddress);

        // Expect emit ClapPost event
        vm.expectEmit();
        emit Medium.ClapPost(1, 10, donatorAddress);

        // Clap a post
        medium.clapPost(1, 10);

        // Clap count assertion
        assertEq(medium.postIdToClapCount(1), 10);
    }

    /**
    * @dev Test for reverting when clapping a post as an author
    */
    function test_RevertWhenClapPostAsAuthor() public createPost {
        vm.prank(authorAddress);

        vm.expectRevert("Author cannot clap owned post.");
        medium.clapPost(1, 10);
    }

    /**
    * @dev Modifier for creating a post before a test function
    */
    modifier createPost() {
        vm.prank(authorAddress);
        medium.createPost("title", "summary", "content");
        _;
    }

    /**
    * @dev Modifier for tipping a post before a test function
    */
    modifier tipPost() {
        vm.prank(donatorAddress);
        medium.tipPost{value: 0.1 ether}(1);
        _;
    }

    /**
    * @dev Modifier for author withdrawing tip before a test function
    */
    modifier authorWithdrawTip() {
        vm.prank(authorAddress);
        medium.withdrawTip(1);
        _;
    }
}
