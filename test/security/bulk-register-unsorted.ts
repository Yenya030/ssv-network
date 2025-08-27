import hre from 'hardhat';
import { expect } from 'chai';
import {
  initializeContract,
  registerOperators,
  owners,
  DataGenerator,
  CONFIG,
} from '../helpers/contract-helpers';

/**
 * Validate operator ID ordering and uniqueness for bulk validator registration.
 */
describe('Security: bulk register validator operator list validation', () => {
  let ssvNetwork: any;
  let ssvToken: any;
  let minDepositAmount: bigint;

  beforeEach(async () => {
    const metadata = await initializeContract();
    ssvNetwork = metadata.ssvNetwork;
    ssvToken = metadata.ssvToken;
    await registerOperators(0, 14, CONFIG.minimalOperatorFee);
    minDepositAmount =
      (BigInt(CONFIG.minimalBlocksBeforeLiquidation) + 2n) *
      CONFIG.minimalOperatorFee *
      13n;
  });

  it('reverts when operator IDs are unsorted', async () => {
    await ssvToken.write.approve([ssvNetwork.address, minDepositAmount], {
      account: owners[1].account,
    });
    await expect(
      ssvNetwork.write.bulkRegisterValidator(
        [
          [DataGenerator.publicKey(1)],
          [3, 2, 1, 4],
          [await DataGenerator.shares(1, 1, [3, 2, 1, 4])],
          minDepositAmount,
          {
            validatorCount: 0,
            networkFeeIndex: 0,
            index: 0,
            balance: 0n,
            active: true,
          },
        ],
        { account: owners[1].account },
      ),
    ).to.be.rejectedWith('UnsortedOperatorsList');
  });

  it('reverts when operator IDs contain duplicates', async () => {
    await ssvToken.write.approve([ssvNetwork.address, minDepositAmount], {
      account: owners[1].account,
    });
    await expect(
      ssvNetwork.write.bulkRegisterValidator(
        [
          [DataGenerator.publicKey(1)],
          [2, 2, 3, 4],
          [await DataGenerator.shares(1, 1, [2, 3, 4, 5])],
          minDepositAmount,
          {
            validatorCount: 0,
            networkFeeIndex: 0,
            index: 0,
            balance: 0n,
            active: true,
          },
        ],
        { account: owners[1].account },
      ),
    ).to.be.rejectedWith('OperatorsListNotUnique');
  });
});

