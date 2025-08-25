import { expect } from "chai";
import { ethers } from "hardhat";
import hre from "hardhat";
import { initializeContract } from "../helpers/contract-helpers";

describe("SSVNetwork validatorsPerOperatorLimit reinitializer", function () {
  it("allows any address to invoke initializev2", async function () {
    const { ssvContractsOwner, ssvNetwork, ssvNetworkViews } = await initializeContract();
    const [, attacker] = await hre.viem.getWalletClients();

    const Upgrade = await ethers.getContractFactory("SSVNetworkValidatorsPerOperatorUpgrade");
    const upgradeImpl = await Upgrade.deploy();
    await upgradeImpl.waitForDeployment();
    const implAddress = await upgradeImpl.getAddress();

    await ssvNetwork.write.upgradeTo([implAddress], { account: ssvContractsOwner });

    const upgraded = await hre.viem.getContractAt(
      "SSVNetworkValidatorsPerOperatorUpgrade",
      ssvNetwork.address as `0x${string}`
    );

    const newLimit = 123n;
    await upgraded.write.initializev2([newLimit], { account: attacker.account });

    expect(await ssvNetworkViews.read.getValidatorsPerOperatorLimit()).to.equal(newLimit);
  });
});
