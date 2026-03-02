// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";

contract VersionManager is AccessControlEnumerableUpgradeable {

    event AddVersion( uint indexed version, uint beginTime,uint endTime, uint operation);
    event AddVersionContract(uint indexed version, uint indexed contractId,address indexed impl,bytes4 functionSig,bytes data,uint value);
    event DeprecateVersion(uint indexed version);
    event WhiteList(address indexed whiteAdress);


    struct VersionInfo {
        address[] impls;
        uint[] contractIds;
        bytes4[] funcSigs;
        bytes[] datas;
        uint[] values;
        uint32 finishTime;
        uint8 isDeprecated;
    }
    struct VersionInfoParams{
        address[] implList;//只要是这套项目需要用到的，不管和上一版本相比是否有变化都传进来
        uint[] contractIds;//每个合约又一个自己的id，外面定义
        bytes4[] functionSigs;//如果升级的同时需要调用某个函数，把签名传进来 ，bytes4(keccak256(...))
        bytes[] datas;//如果调用函数的数据不能用户自定义，这儿要传
        uint[] values;//如果涉及到native token，这儿传
        uint delayTime;//发布后等待的测试时间
        uint operation;//新增或更新
        bytes32 description;//升级描述的hash值
    }
    bytes32 public constant VERSION_ROLE = keccak256("VERSION_ROLE");

    //查询某个版本的信息
    mapping(uint => VersionInfo) public versionInfo;
    //某个用户的当前版本号
    mapping(address => uint) public accountVersion;
    //当前最新版本
    uint public versionNow;
    //白名单，可以在测试周期内升级合约，一般是项目方开发者
    mapping(address => bool) public inWhiteList;

    uint8 constant OPERATION_ADD = 1;
    uint8 constant OPERATION_UPDATE = 2;


    error AddVersionErr1(); //更新当前版本时候发现当前版本不存在
    error AddVersionErr2();//更新版本参数不匹配
    error AddVersionErr3();//测试周期结束了试图更新版本
    error AddVersionErr4();//上一个版本内测还没结束，就已经发布下一个版本

    error MaxVersion();//当前是最新版本没法升级
    error FinishTimeNotReach();//还在测试阶段，且不是白名单用户，没法升级
    error VersionVerifyErr();//版本校验不通过
    //白名单地址，有新版本可以不受延迟时间影响
    function addWhiteList(address[] calldata whiteList) public onlyRole(VERSION_ROLE) {
        for (uint i = 0; i < whiteList.length; i++) {
            inWhiteList[whiteList[i]] = !inWhiteList[whiteList[i]];
            emit WhiteList(whiteList[i]);
        }
    }

    function initialize() initializer public {
        __AccessControlEnumerable_init();
        _grantRole(VERSION_ROLE,msg.sender);
        _grantRole(DEFAULT_ADMIN_ROLE,msg.sender);
    }


    /**
     * @dev 发布新版本，并设置内测需要的时间，白名单地址可以升级内测，在此之前项目方用户无法升级,无法发布下一个版本
     */
    function addVersion(VersionInfoParams memory params) external onlyRole(VERSION_ROLE) {
        console.log("version 1");
        if (params.operation == OPERATION_ADD) {
            if (versionNow != 0) {
                if (versionInfo[versionNow].finishTime > block.timestamp) {
                    revert AddVersionErr4();
                }
            }
            versionNow++;
        }
        console.log("version 2");
        VersionInfo storage sVersion = versionInfo[versionNow];
        if (params.operation == OPERATION_UPDATE) {
            if (versionNow == 0) {
                revert AddVersionErr1();
            }
            if (params.contractIds.length != params.implList.length || params.contractIds.length != params.datas.length||params.contractIds.length!=params.functionSigs.length) {
                revert AddVersionErr2();
            }
            if (sVersion.finishTime < block.timestamp) {
                revert AddVersionErr3();
            }
            if (params.contractIds.length != 0) {
                //说明要更新
                uint len = sVersion.contractIds.length;
                for (uint i = 0; i < len; i++) {
                    sVersion.impls.pop();
                    sVersion.contractIds.pop();
                    sVersion.funcSigs.pop();
                    sVersion.datas.pop();
                    sVersion.values.pop();

                }
            }
        }


        sVersion.finishTime = uint32(block.timestamp + params.delayTime);

        for (uint i = 0; i < params.contractIds.length; i++) {
            sVersion.impls.push(params.implList[i]);
            sVersion.contractIds.push(params.contractIds[i]);
            sVersion.funcSigs.push(params.functionSigs[i]);
            sVersion.datas.push(params.datas[i]);
            sVersion.values.push(params.values[i]);
            emit AddVersionContract(versionNow, params.contractIds[i],params.implList[i],params.functionSigs[i],params.datas[i],params.values[i]);

        }
        emit AddVersion(versionNow,  block.timestamp,sVersion.finishTime,params.operation);


    }

    /**
     * @dev 某个版本有问题弃用，例如版本四有问题，版本三要升级，就会跳到版本五，但必须在实现logic合约的时候做好兼容性,因为有些版本已经升到版本四了
     */
    function deprecateVersion(uint version) external onlyRole(VERSION_ROLE) {
        VersionInfo storage sVersion = versionInfo[version];
        sVersion.isDeprecated = 1;
        emit DeprecateVersion(version);

    }

    /**
     * @dev 查询并更新用户的版本，权限控制在上游
     */
    function getVersion(uint version) external returns (VersionInfo memory,uint){
        uint validVersion;
        if (version != 0) {
            //已经注册过或者项目方从未提交过升级信息
            if (accountVersion[msg.sender] != 0 || versionNow < version) {
                revert VersionVerifyErr();
            }
            //默认提交的是对的，校验放到调用者那边
            accountVersion[msg.sender] = version;
            return (versionInfo[version],version);
        }else{
            if (accountVersion[msg.sender] == 0) {
                revert VersionVerifyErr();
            }
        }
        VersionInfo memory res;
        uint validVersionBegin = accountVersion[msg.sender] + 1;
        for (uint i = validVersionBegin;; i++) {
            VersionInfo storage sVersion = versionInfo[i];
            //说明已经到了最大版本
            if (sVersion.finishTime == 0) {
                revert MaxVersion();
            }
            //弃用，跳过
            if (sVersion.isDeprecated == 1) {
                continue;
            }
            if (sVersion.finishTime >= block.timestamp && !inWhiteList[msg.sender]) {
                revert FinishTimeNotReach();
            }
            res = sVersion;
            validVersion=i;
            accountVersion[msg.sender]=i;
            break;
        }
        if(validVersion==0){
            revert MaxVersion();
        }
        return (res,validVersion);
    }

}


