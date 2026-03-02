// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.4;
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract ContractBV1 is Initializable {
    uint public a;

    function initialize() public initializer {
    }


    function contractBFun1V1(uint256 number) external {
        a=number;
    }

}

