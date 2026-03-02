// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.4;
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract ContractAV2 is Initializable {
    address public contractC;
    uint public a;
    uint public b;

    function initialize(address contractBAddr) public initializer {
        contractC=contractBAddr;
    }

    function setContractC(address contractCAddress) external payable {
        require(msg.value>=1 ether/100);
        contractC=contractCAddress;
    }

    function contractAFun1V2(uint number) external {
        a=number;
        b=a*2;
    }

    function contractAFun2V2() external {
        bytes memory data= abi.encodeWithSignature("contractCFun1V2()");
        (bool success,bytes memory returnData)=contractC.call{value:1 ether/100}(data);
        require(success);
    }

}