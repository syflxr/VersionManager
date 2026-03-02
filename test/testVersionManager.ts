// @ts-nocheck

// import {Contract} from "../../src/chain/contract";

import { Contract } from "../src/chain/contract";

import {
  ContractAV1,
  ContractAV1__factory,
  ContractAV2, ContractAV2__factory, ContractAV3,
  ContractBV1,
  ContractBV1__factory,
  ContractBV2, ContractCV2, ContractCV2__factory, ContractCV3, ContractCV3__factory, ProxyAdmin,
  ProxyAdminWithVersion,
  ProxyIntakeAdmin,
  TransparentUpgradeableProxy,
  VersionManager
} from "../typechain";
import {BigNumber, utils} from "ethers";
import {ethers} from "hardhat";
import networkConfig from "../../networks";

let owner,user1,user2,user3,user4

//
let E18=(num)=>{
  return BigNumber.from(num).mul(BigNumber.from("1000000000000000000"))
}
let overrides = {
  gasLimit: 8000000
}
let overridesWithValue = {
  gasLimit: 8000000,
  value:E18(1).div(100)
}
let folder = "2025-11-09";

setTimeout(function (){test();},50);
async function test(){
  [owner,user1, user2, user3, user4] = await ethers.getSigners();

  const ADD_VERSION_OP_ADD=1;
  const ADD_VERSION_OP_UPDATE=2;

  // error AddVersionErr1();//no version
  // error AddVersionErr2();//length mismatch
  // error AddVersionErr3();//finish time
  // error AddVersionErr4();//finish time
  // error MaxVersion();
  // error FinishTimeNotReach();
  // error VersionVerifyErr();+
  let errArrsTask=["AddVersionErr1()","AddVersionErr2()","AddVersionErr3()","AddVersionErr4()","MaxVersion()","FinishTimeNotReach()","VersionVerifyErr()"]
  for(let i=0;i<errArrsTask.length;i++){
    console.log(errArrsTask[i]+"_VersionManager:"+utils.keccak256(utils.toUtf8Bytes(errArrsTask[i])).substring(0,10))
  }
  // error ProxyIdNotExist();
  // error NotExtraProxy();
  // error SetProxyParamsErr();
  // error SetProxyTwice();
  // error VerifyNotPass01();
  // error VerifyNotPass02();
  // error VerifyNotPass03();
  // error VerifyNotPass04();
  // error UpgradeDataErr();
  // error VersionManagerErr();
  let errArrsCommittee=["ProxyIdNotExist()","NotExtraProxy()","SetProxyParamsErr()","SetProxyTwice()","VerifyNotPass01()","VerifyNotPass02()","VerifyNotPass03()","VerifyNotPass04()","UpgradeDataErr()","VersionManagerErr()"]
  for(let i=0;i<errArrsCommittee.length;i++){
    console.log(errArrsCommittee[i]+"_ProxyAdminWithVersion:"+utils.keccak256(utils.toUtf8Bytes(errArrsCommittee[i])).substring(0,10))
  }
  //项目方发版本用的版本管理器
  let versionManagerAdmin= <ProxyAdmin>await Contract.deploy("ProxyAdmin",owner,[],overrides)

  let versionManager = <VersionManager> await Contract.deployProxy("VersionManager", owner, [overrides], { folder: folder, override: overrides },versionManagerAdmin.address);

  //用户端
  let proxyAdmin1= <ProxyAdminWithVersion>await Contract.deploy("ProxyAdminWithVersion",user1,[versionManager.address],overrides)


  let contractBV1Impl=<ContractBV1> await Contract.deploy("ContractBV1",user1,[],overrides)
  let contractAV1Impl=<ContractAV1> await Contract.deploy("ContractAV1",user1,[],overrides)
  let contractCV2Impl=<ContractCV2> await Contract.deploy("ContractCV2",user1,[],overrides)

  let calldata1=ContractBV1__factory.createInterface().encodeFunctionData("initialize",[]);
  // let calltataQuest=Quest__factory.createInterface().encodeFunctionData("initialize",[vote.address,govContract.address,owner.address])
  console.log(calldata1)
  let contractBVersion1Proxy = <TransparentUpgradeableProxy> await Contract.deploy("@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol:TransparentUpgradeableProxy",user1,[contractBV1Impl.address,proxyAdmin1.address,calldata1],overrides)

  let calldata2=ContractAV1__factory.createInterface().encodeFunctionData("initialize",[contractBVersion1Proxy.address]);
  let contractAVersion1Proxy = <TransparentUpgradeableProxy> await Contract.deploy("@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol:TransparentUpgradeableProxy",user1,[contractAV1Impl.address,proxyAdmin1.address,calldata2],overrides)

  let calldata3=ContractCV2__factory.createInterface().encodeFunctionData("initialize",[contractBVersion1Proxy.address]);
  let contractCVersion2Proxy = <TransparentUpgradeableProxy> await Contract.deploy("@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol:TransparentUpgradeableProxy",user1,[contractCV2Impl.address,proxyAdmin1.address,calldata3],overrides)

  // params: {
  //   implList: string[];
  //   : BigNumberish[];
  //   functionSigs: BytesLike[];
  //   datas: BytesLike[];
  //   values: BigNumberish[];
  //   delayTime: BigNumberish;
  //   : BigNumberish;
  //   description: string;
  // },
  let descHashVersion1=utils.keccak256(utils.toUtf8Bytes("version 1"))
  let addVTx=await versionManager.connect(owner).addVersion({contractIds:[1,2],
    implList:[contractAV1Impl.address,contractBV1Impl.address],
    functionSigs:["0x00000000","0x00000000"],
    datas:["0x","0x"],values:[0,0],delayTime:0,operation:ADD_VERSION_OP_ADD,description:descHashVersion1})
  await addVTx.wait()

  let regTx=await proxyAdmin1.connect(user1).setProxy([1,2],[contractAVersion1Proxy.address,contractBVersion1Proxy.address],1,overrides)
  await regTx.wait()

  let contractBV2Impl=<ContractBV2> await Contract.deploy("ContractBV2",user1,[],overrides)
  let contractAV2Impl=<ContractAV2> await Contract.deploy("ContractAV2",user1,[],overrides)

  let calldataA2=ContractAV2__factory.createInterface().encodeFunctionData("setContractC",[contractCVersion2Proxy.address]);
  let a2Sig=calldataA2.substring(0,10)
  let a2Data="0x"+calldataA2.substring(10)
  console.log("calldataA2:"+calldataA2)
  console.log("a2Sig:"+a2Sig)
  console.log("a2Data:"+a2Data)

  let descHashVersion2=utils.keccak256(utils.toUtf8Bytes("version 2"))
  addVTx=await versionManager.connect(owner).addVersion({contractIds:[1,2,3],
    implList:[contractAV2Impl.address,contractBV2Impl.address,contractCV2Impl.address],
    functionSigs:[a2Sig,"0x00000000","0x00000000"],
    datas:[a2Data,"0x","0x"],values:[E18(1).div(100),0,0],delayTime:0,operation:ADD_VERSION_OP_ADD,description:descHashVersion2})
  await addVTx.wait()

  const OPERATION_ADD = 1;
  const OPERATION_REMOVE = 2;
  let upgradeTx=await proxyAdmin1.connect(user1).upgradeAndCall([3],[contractCVersion2Proxy.address],[OPERATION_ADD],[],[],overridesWithValue)
  await upgradeTx.wait()

  let contractAV2Wrapper=await ContractAV2__factory.connect(contractAVersion1Proxy.address,owner)
  let txxx=await contractAV2Wrapper.contractAFun2V2(overrides)
  await txxx.wait()

  let contractCV2Wrapper=await ContractCV2__factory.connect(contractCVersion2Proxy.address,owner)

  console.log(Number(await contractCV2Wrapper.a()))

  let contractAV3Impl=<ContractAV3> await Contract.deploy("ContractAV3",user1,[],overrides)
  let contractCV3Impl=<ContractCV3> await Contract.deploy("ContractCV3",user1,[],overrides)
  const zeroAddress = "0x0000000000000000000000000000000000000000"
  let descHashVersion3=utils.keccak256(utils.toUtf8Bytes("version 3"))

  let c3Data=ContractCV3__factory.createInterface().encodeFunctionData("setContractB",[zeroAddress])
  addVTx=await versionManager.connect(owner).addVersion({contractIds:[1,3],
      implList:[contractAV3Impl.address,contractCV3Impl.address],
    functionSigs:["0x00000000",c3Data.substring(0,10)],datas:["0x","0x"],values:[0,0],delayTime:0,operation:ADD_VERSION_OP_ADD,description:descHashVersion3})
  await addVTx.wait()

  console.log("before upgrade:"+await contractCV2Wrapper.contractB())

  upgradeTx=await proxyAdmin1.connect(user1).upgradeAndCall([2],[contractBVersion1Proxy.address],[OPERATION_REMOVE],[3],[c3Data],overrides)
  await upgradeTx.wait()

  console.log("after upgrade:"+await contractCV2Wrapper.contractB())

}
