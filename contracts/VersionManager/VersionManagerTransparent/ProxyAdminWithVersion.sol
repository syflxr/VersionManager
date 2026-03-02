// SPDX-License-Identifier: MIT

pragma solidity =0.8.4;

import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interface/IVersionManager.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/**
 * @dev This is an auxiliary contract meant to be assigned as the admin of a {TransparentUpgradeableProxy}. For an
 * explanation of why you would want to use this see the documentation for {TransparentUpgradeableProxy}.
 */


contract ProxyAdminWithVersion is AccessControlEnumerable {
    mapping(uint => address) private _idToProxy;
    address private _versionManager;

    EnumerableSet.UintSet private _allProxyIds;
    bool public hasVersion;
    uint8 constant public OPERATION_ADD = 1;
    uint8 constant public OPERATION_REMOVE = 2;
    bytes32 public constant UPGRADE_ROLE = keccak256("UPGRADE_ROLE");

    error ProxyIdNotExist();
    error NotExtraProxy();
    error SetProxyParamsErr();
    error SetProxyTwice();
    error VerifyNotPass01();
    error VerifyNotPass02();
    error VerifyNotPass03();
    error VerifyNotPass04();
    error UpgradeDataErr();
    error UpgradeDataNotExists();

    event SetProxy(uint indexed version,uint indexed proxyId,address indexed proxyAddr);

    event UpgradeProxyExtra(uint indexed version,uint indexed extraProxyId,address indexed extraProxyAddr,uint operation);

    event UpgradeProxyExecute(uint indexed version,uint indexed proxyId,bytes data);

    using EnumerableSet for EnumerableSet.UintSet;
    constructor(address versionManager){
        _versionManager = versionManager;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(UPGRADE_ROLE, msg.sender);
    }

    function setProxy(uint[] calldata proxyIds, address[] calldata proxyAddrs, uint version) external onlyRole(UPGRADE_ROLE) {
        if (proxyIds.length != proxyAddrs.length || version == 0) {
            revert SetProxyParamsErr();
        }
        if (hasVersion) {
            revert SetProxyTwice();
        }
        hasVersion=true;
        for (uint i = 0; i < proxyIds.length; i++) {
            _allProxyIds.add(proxyIds[i]);
            _idToProxy[proxyIds[i]]=proxyAddrs[i];
        }
        (IVersionManager.VersionInfo memory versionInfo,) = IVersionManager(_versionManager).getVersion(version);
        if (versionInfo.contractIds.length != _allProxyIds.length()) {
            //长度不匹配
            revert VerifyNotPass01();
        }
        for (uint i = 0; i < versionInfo.contractIds.length; i++) {
            if(!_allProxyIds.contains(versionInfo.contractIds[i])){
                //合约在proxyAdmin里不存在
                revert VerifyNotPass02();
            }
            address implThis = TransparentUpgradeableProxy(payable(_idToProxy[versionInfo.contractIds[i]])).implementation();
            if (implThis != versionInfo.impls[i]) {
                revert VerifyNotPass03();
            }
            if(versionInfo.finishTime>block.timestamp){
                revert VerifyNotPass04();
            }
        }
        for(uint i=0;i<proxyIds.length;i++){
            emit SetProxy(version,proxyIds[i],proxyAddrs[i]);
        }

    }

    function setVersionManager(address versionManager) external onlyRole(UPGRADE_ROLE) {
        if (_versionManager == address(0)) {
            _versionManager = versionManager;
        }
    }

    function upgradeAndCall(uint[] calldata extraProxyIds, address[] calldata extraProxyAddrs, uint[] calldata operations,uint[] calldata proxyIds,bytes[] memory datas) external payable onlyRole(UPGRADE_ROLE) {
        (IVersionManager.VersionInfo memory versionInfo,uint versionNow) = IVersionManager(_versionManager).getVersion(0);
        for (uint i = 0; i < extraProxyIds.length; i++) {
            uint proxyIdThis = extraProxyIds[i];
            address proxyThis = extraProxyAddrs[i];
            if (operations[i] == OPERATION_ADD) {
                if (_allProxyIds.contains(proxyIdThis)) {
                   revert NotExtraProxy();
                }
                _allProxyIds.add(proxyIdThis);
                _idToProxy[proxyIdThis] = proxyThis;
            } else if (operations[i] == OPERATION_REMOVE) {
                if (!_allProxyIds.remove(proxyIdThis)) {
                    revert ProxyIdNotExist();
                }

                delete _idToProxy[proxyIdThis];
            }
            emit UpgradeProxyExtra(versionNow,proxyIdThis,proxyThis,operations[i]);
        }

//        uint[] memory allIds = _allProxyIds.values();

        for (uint i = 0; i < versionInfo.contractIds.length; i++) {
            uint idThis = versionInfo.contractIds[i];
            address proxyToUpgrade=_idToProxy[idThis];
            if(getProxyImplementation(TransparentUpgradeableProxy(payable(proxyToUpgrade)))==versionInfo.impls[i]){
                //说明实现地址没有变
                continue;
            }
            bytes memory dataThis;
            if(uint32(versionInfo.funSigs[i])!=0){
                if(versionInfo.datas[i].length!=0){
                    dataThis=abi.encodePacked(versionInfo.funSigs[i],versionInfo.datas[i]);
                }else{
                    for(uint j=0;j<proxyIds.length;j++){
                        if(proxyIds[j]==idThis){
                            dataThis=datas[j];
                        }
                    }
                    if(dataThis.length==0){
                        revert UpgradeDataNotExists();
                    }
                }
                TransparentUpgradeableProxy(payable(proxyToUpgrade)).upgradeToAndCall{value :versionInfo.values[i]}(versionInfo.impls[i], dataThis);
            }else{
                TransparentUpgradeableProxy(payable(proxyToUpgrade)).upgradeTo(versionInfo.impls[i]);

            }
            emit UpgradeProxyExecute(versionNow,idThis,dataThis);

        }
    }




    /**
     * @dev Returns the current implementation of `proxy`.
     *
     * Requirements:
     *
     * - This contract must be the admin of `proxy`.
     */
    function getProxyImplementation(TransparentUpgradeableProxy proxy) public view virtual returns (address) {
        // We need to manually run the static call since the getter cannot be flagged as view
        // bytes4(keccak256("implementation()")) == 0x5c60da1b
        (bool success, bytes memory returndata) = address(proxy).staticcall(hex"5c60da1b");
        require(success);
        return abi.decode(returndata, (address));
    }

    /**
     * @dev Returns the current admin of `proxy`.
     *
     * Requirements:
     *
     * - This contract must be the admin of `proxy`.
     */
    function getProxyAdmin(TransparentUpgradeableProxy proxy) public view virtual returns (address) {
        // We need to manually run the static call since the getter cannot be flagged as view
        // bytes4(keccak256("admin()")) == 0xf851a440
        (bool success, bytes memory returndata) = address(proxy).staticcall(hex"f851a440");
        require(success);
        return abi.decode(returndata, (address));
    }

    function changeProxyAdmin(TransparentUpgradeableProxy proxy, address newAdmin) public virtual onlyRole(UPGRADE_ROLE) {
        proxy.changeAdmin(newAdmin);
    }
}
