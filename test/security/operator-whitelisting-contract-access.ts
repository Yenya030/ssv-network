import hre from 'hardhat';
import { expect } from 'chai';
import { initializeContract, owners, DataGenerator, CONFIG } from '../helpers/contract-helpers';

describe('Security: operator whitelisting contract access control', () => {
  let ssvNetwork: any;
  let mockWhitelistingContract: any;

  beforeEach(async () => {
    const metadata = await initializeContract();
    ssvNetwork = metadata.ssvNetwork;
    mockWhitelistingContract = await hre.viem.deployContract('MockWhitelistingContract', [[]], {
      client: owners[0].client,
    });
    await ssvNetwork.write.registerOperator([DataGenerator.publicKey(0), CONFIG.minimalOperatorFee, true], {
      account: owners[1].account,
    });
  });

  it('non-owner cannot set whitelisting contract', async () => {
    await expect(
      ssvNetwork.write.setOperatorsWhitelistingContract([[1], await mockWhitelistingContract.address], {
        account: owners[2].account,
      })
    ).to.be.rejectedWith('CallerNotOwnerWithData');
  });

  it('operator owner can set whitelisting contract', async () => {
    await expect(
      ssvNetwork.write.setOperatorsWhitelistingContract([[1], await mockWhitelistingContract.address], {
        account: owners[1].account,
      })
    ).to.not.be.rejected;
  });

  it('non-owner cannot remove whitelisting contract', async () => {
    await ssvNetwork.write.setOperatorsWhitelistingContract([[1], await mockWhitelistingContract.address], {
      account: owners[1].account,
    });
    await expect(
      ssvNetwork.write.removeOperatorsWhitelistingContract([[1]], { account: owners[2].account })
    ).to.be.rejectedWith('CallerNotOwnerWithData');
  });

  it('operator owner can remove whitelisting contract', async () => {
    await ssvNetwork.write.setOperatorsWhitelistingContract([[1], await mockWhitelistingContract.address], {
      account: owners[1].account,
    });
    await expect(
      ssvNetwork.write.removeOperatorsWhitelistingContract([[1]], { account: owners[1].account })
    ).to.not.be.rejected;
  });
});

