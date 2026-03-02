// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.4;
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
contract ContractCV3 is Initializable {
    uint public a;
    address public contractB;
    function initialize(address contractBAddress) public initializer {
        contractB=contractBAddress;
    }


    function contractCFun1V1() payable external {
        a=msg.value;
    }

    function setContractB(address bNew) external{
        if(bNew==address(0)){
            delete contractB;
        }else{
            contractB=bNew;
        }
    }

}