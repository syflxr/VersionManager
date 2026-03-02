// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IVersionManager {
    struct VersionInfo{
        address[] impls;//三个数组一一对应，包含了顺序
        uint[] contractIds;
        bytes4[] funSigs;
        bytes[] datas;
        uint[] values;
        uint32 finishTime;//内测结束时间
        uint8 isDeprecated;//是否被弃用
    }
    function getVersion(uint versionNow) external returns (VersionInfo memory,uint);
    function version() external pure returns (uint, bytes32);
}

