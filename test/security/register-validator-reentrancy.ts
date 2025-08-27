import {
  initializeContract,
  registerOperators,
  coldRegisterValidator,
  CONFIG,
} from '../helpers/contract-helpers';
import { expect } from 'chai';

let ssvNetwork: any, ssvViews: any, ssvToken: any;

describe('Register validator reentrancy protections', () => {
  beforeEach(async () => {
    const metadata = await initializeContract('ReentrantToken');
    ssvNetwork = metadata.ssvNetwork;
    ssvViews = metadata.ssvNetworkViews;
    ssvToken = metadata.ssvToken;

    await registerOperators(0, 4, CONFIG.minimalOperatorFee);
    await ssvNetwork.write.updateNetworkFee([CONFIG.minimalOperatorFee]);
  });

  it('registerValidator not vulnerable to token reentrancy', async () => {
    const operatorId = 1n;
    await ssvToken.write.setReentrancyTarget([
      ssvNetwork.address,
      ssvNetwork.address,
      operatorId,
    ]);

    const earningsBefore = await ssvViews.read.getOperatorEarnings([operatorId]);

    await coldRegisterValidator();

    const earningsAfter = await ssvViews.read.getOperatorEarnings([operatorId]);
    expect(earningsAfter).to.be.gte(earningsBefore);
  });
});
