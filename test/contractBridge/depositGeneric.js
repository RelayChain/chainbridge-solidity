/**
 * Copyright 2020 ChainSafe Systems
 * SPDX-License-Identifier: LGPL-3.0-only
 */

const TruffleAssert = require('truffle-assertions');

const Helpers = require('../helpers');

const BridgeContract = artifacts.require("Bridge");
const CentrifugeAssetContract = artifacts.require("CentrifugeAsset");
const GenericHandlerContract = artifacts.require("GenericHandler");

contract('Bridge - [deposit - Generic]', async () => {
    const originChainID = 1;
    const destinationChainID = 2;
    const expectedDepositNonce = 1;
    const randomInfo = '0x123456789a'; // random bytes to accept
    
    let BridgeInstance;
    let GenericHandlerInstance;
    let depositData;
    let initialResourceIDs;
    let initialContractAddresses;
    let initialDepositFunctionSignatures;
    let initialExecuteFunctionSignatures;

    beforeEach(async () => {
        await Promise.all([
            CentrifugeAssetContract.new().then(instance => CentrifugeAssetInstance = instance),
            BridgeInstance = BridgeContract.new(originChainID, [], 0,).then(instance => BridgeInstance = instance)
        ]);
        
        resourceID = Helpers.createResourceID(CentrifugeAssetInstance.address, originChainID)
        initialResourceIDs = [resourceID];
        initialContractAddresses = [CentrifugeAssetInstance.address];
        initialDepositFunctionSignatures = [Helpers.blankFunctionSig];
        initialExecuteFunctionSignatures = [Helpers.getFunctionSignature(CentrifugeAssetInstance, 'store')];

        GenericHandlerInstance = await GenericHandlerContract.new(
            BridgeInstance.address,
            initialResourceIDs,
            initialContractAddresses,
            initialDepositFunctionSignatures,
            initialExecuteFunctionSignatures);
            
        await BridgeInstance.adminSetGenericResource(GenericHandlerInstance.address, resourceID,  initialContractAddresses[0], initialDepositFunctionSignatures[0], initialExecuteFunctionSignatures[0]);

        depositData = Helpers.createGenericDepositData('0xdeadbeef');
    });

    it('Generic deposit can be made', async () => {
        TruffleAssert.passes(await BridgeInstance.deposit(
            destinationChainID,
            resourceID,
            depositData,
            randomInfo
        ));
    });

    it('_depositCounts is incremented correctly after deposit', async () => {
        await BridgeInstance.deposit(
            destinationChainID,
            resourceID,
            depositData,
            randomInfo
        );

        const depositCount = await BridgeInstance._depositCounts.call(destinationChainID);
        assert.strictEqual(depositCount.toNumber(), expectedDepositNonce);
    });

    it('Deposit event is fired with expected value after Generic deposit', async () => {
        const depositTx = await BridgeInstance.deposit(
            destinationChainID,
            resourceID,
            depositData,
            randomInfo
        );

        TruffleAssert.eventEmitted(depositTx, 'Deposit', (event) => {
            return event.destinationChainID.toNumber() === destinationChainID &&
                event.resourceID === resourceID.toLowerCase() &&
                event.depositNonce.toNumber() === expectedDepositNonce
        });
    });
});