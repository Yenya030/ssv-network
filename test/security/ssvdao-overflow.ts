import { ethers } from "hardhat";
import { expect } from "chai";

// This test demonstrates that setting an excessively large network fee in the
// SSVDAO module can cause arithmetic overflow in network earnings calculation.
describe("SSVDAO network earnings overflow", function () {
  it("reverts due to overflow when earnings exceed uint64", async function () {
    const [attacker] = await ethers.getSigners();
    const Dao = await ethers.getContractFactory("SSVDAO");
    const dao = await Dao.deploy();
    await dao.waitForDeployment();

    // Manually set daoValidatorCount to 2 in storage to simulate existing validators
    const baseSlot = BigInt(
      ethers.keccak256(ethers.toUtf8Bytes("ssv.network.storage.protocol"))
    ) - 1n;
    const slotHex = ethers.toBeHex(baseSlot, 32);
    const value =
      "0x" + (2n << 32n).toString(16).padStart(64, "0");
    await ethers.provider.send("hardhat_setStorageAt", [
      await dao.getAddress(),
      slotHex,
      value,
    ]);

    // Set the network fee to the maximum allowed value
    const maxFee = ((1n << 64n) - 1n) * 10000000n;
    await dao.connect(attacker).updateNetworkFee(maxFee);

    // Advance one block so network earnings calculation uses non-zero block diff
    await ethers.provider.send("evm_mine", []);

    await expect(
      dao.connect(attacker).withdrawNetworkEarnings(0)
    ).to.be.revertedWithPanic(0x11); // arithmetic overflow
  });
});
