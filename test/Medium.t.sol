// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {Medium} from "../src/Medium.sol";
import {MediumScript} from "../script/Medium.s.sol";

contract MediumTest is Test {
    Medium medium;
    address ownerAddress;
    address authorAddress = makeAddr("author");
    address donatorAddress = makeAddr("donator");

    function setUp() public {
        MediumScript script = new MediumScript();
        medium = script.run();

        ownerAddress = medium.getOwner();
        vm.deal(authorAddress, 1 ether);
        vm.deal(donatorAddress, 1 ether);
    }

    function test_GetOwnerContract() public {
        assertEq(medium.getOwner(), msg.sender);
    }

    function test_MinimumTipInUSD() public {
        assertEq(medium.MINIMUM_TIP_IN_USD(), 1e18);
    }

    function test_CreatePost() public {
        vm.prank(authorAddress);

        // Emit PostCreated event
        vm.expectEmit();
        emit Medium.PostCreated(1, authorAddress, "title", "summary");
        medium.createPost("title", "summary", "content");

        // Post Assertion
        Medium.Post memory post = medium.getPost(1);
        assertEq(post.id, 1);
        assertEq(post.title, "title");
        assertEq(post.summary, "summary");
        assertEq(post.content, "content");
        assertEq(post.author, authorAddress);
        assertEq(medium.postIdToClapCount(1), 0);
        assertEq(medium.postIdToTipPost(1), 0);
    }

    function test_TipPost() public createPost {
        // Tip a post
        vm.startPrank(donatorAddress);

        // Emit TipPost event
        vm.expectEmit();
        emit Medium.TipPost(1, donatorAddress, 0.1 ether);
        medium.tipPost{value: 0.1 ether}(1);
        vm.stopPrank();

        assertEq(medium.postIdToTipPost(1), 0.1 ether);
        assertEq(address(medium).balance, 0.1 ether);
    }

    function test_RevertWhen_TipPostLessThanADollar() public createPost {
        // Tip a post
        vm.startPrank(donatorAddress);

        // Expect revert
        vm.expectRevert(Medium.TipAmountInsufficient.selector);
        medium.tipPost{value: 0.001 ether}(1);
        vm.stopPrank();

        assertEq(medium.postIdToTipPost(1), 0);
        assertEq(address(medium).balance, 0);
    }

    function test_RevertWhen_TipPostAsAuthor() public createPost {
        // Tip a post
        // Expect revert
        vm.expectRevert("Author cannot tip owned post.");
        medium.tipPost{value: 0.1 ether}(1);
        vm.stopPrank();

        assertEq(medium.postIdToTipPost(1), 0);
        assertEq(address(medium).balance, 0);
    }

    function test_WithdrawTipAsAuthor() public createPost tipPost {
        vm.startPrank(authorAddress);
        uint256 previousAuthorBalance = address(authorAddress).balance;
        uint256 previousContractBalance = address(medium).balance;
        medium.withdrawTip(1);

        uint256 currentAuthorBalance = address(authorAddress).balance;
        uint256 currentContractBalance = address(medium).balance;
        uint256 fee = 0.1 ether * 3 / 100;
        assertEq(currentAuthorBalance, previousAuthorBalance + (0.1 ether - fee));
        assertEq(currentContractBalance, previousContractBalance - 0.1 ether + fee);
    }

    function test_RevertWhen_WithdrawTipNotAsAuthor() public createPost tipPost {
        vm.startPrank(donatorAddress);
        vm.expectRevert(Medium.NotAuthor.selector);
        medium.withdrawTip(1);
    }

    function test_WithdrawFeesAsOwner() public createPost tipPost authorWithdrawTip {
        uint256 previousOwnerBalance = address(ownerAddress).balance;
        vm.startPrank(ownerAddress);    
        medium.withdrawFees();
        vm.stopPrank();
        uint256 currentOwnerBalance = address(ownerAddress).balance;
        assertEq(currentOwnerBalance, previousOwnerBalance + (0.1 ether * 3 / 100));
    }

    modifier createPost() {
        vm.startPrank(authorAddress);
        medium.createPost("title", "summary", "content");
        _;
    }

    modifier tipPost() {
        vm.startPrank(donatorAddress);
        medium.tipPost{value: 0.1 ether}(1);
        vm.stopPrank();
        _;
    }

    modifier authorWithdrawTip() {
        vm.startPrank(authorAddress);
        medium.withdrawTip(1);
        _;
    }
}
