// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {Medium} from "../src/Medium.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

contract MediumScript is Script {
    function run() external returns (Medium medium) {
        HelperConfig helperConfig = new HelperConfig();
        address priceFeed = helperConfig.activeNetworkConfig();

        vm.startBroadcast();
        medium = new Medium(priceFeed);
        vm.stopBroadcast();
    }
}
