// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.4;
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "hardhat/console.sol";

contract ContractCV2 is Initializable {
    uint public a;
    address public contractB;
    function initialize(address contractBAddress) public initializer {
        contractB=contractBAddress;
    }


    function contractCFun1V2() payable external {
        console.log("contractCFun1V2");
        console.log(address(this).balance);
        console.log("msg sender",msg.sender);
        console.log("msg value",msg.value);
        a=msg.value;
    }

}