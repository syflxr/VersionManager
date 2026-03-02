// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.4;
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract ContractAV1 is Initializable {
    address public contractB;
    uint public a;

    function initialize(address contractBAddr) public initializer {
        contractB=contractBAddr;
    }


    function contractAFun1V1(uint number) external {
        a=number;
    }

    function contractAFun2V1() external{
        bytes memory data= abi.encodeWithSignature("contractBFun1V1(uint256)", a);
        (bool success,bytes memory returnData)=contractB.call(data);
        require(success);
    }

}


