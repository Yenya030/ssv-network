import { expect } from 'chai';
import {
  initializeContract,
  registerOperators,
  coldRegisterValidator,
  bulkRegisterValidators,
  DataGenerator,
  CONFIG,
  DEFAULT_OPERATOR_IDS,
  owners,
} from '../helpers/contract-helpers';

let ssvNetwork: any;
let minDepositAmount: bigint;
let cluster: any;

describe('Security: validator exit access control', () => {
  beforeEach(async () => {
    const metadata = await initializeContract();
    ssvNetwork = metadata.ssvNetwork;

    await registerOperators(0, 4, CONFIG.minimalOperatorFee);

    const networkFee = CONFIG.minimalOperatorFee;
    minDepositAmount =
      BigInt(CONFIG.minimalBlocksBeforeLiquidation) * (networkFee + CONFIG.minimalOperatorFee * 4n);

    await ssvNetwork.write.updateNetworkFee([networkFee]);

    await coldRegisterValidator();

    cluster = (
      await bulkRegisterValidators(1, 1, DEFAULT_OPERATOR_IDS[4], minDepositAmount, {
        validatorCount: 0,
        networkFeeIndex: 0,
        index: 0,
        balance: 0n,
        active: true,
      })
    ).args;
  });

  it('non-owner cannot exit validator', async () => {
    await expect(
      ssvNetwork.write.exitValidator([DataGenerator.publicKey(1), cluster.operatorIds], {
        account: owners[2].account,
      }),
    ).to.be.rejectedWith('IncorrectValidatorStateWithData', DataGenerator.publicKey(1));
  });
});
