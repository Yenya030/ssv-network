import { ethers } from "hardhat";
import { expect } from "chai";
import { keccak256, toUtf8Bytes, zeroPadValue, toBeHex } from "ethers";

function storageSlot(label: string, offset: bigint): string {
  const base = BigInt(keccak256(toUtf8Bytes(label)));
  const slot = base - 1n + offset;
  return zeroPadValue(toBeHex(slot), 32);
}

describe("SSVDAO zero amount withdrawal", function () {
  it("does not transfer funds or alter DAO balance", async function () {
    const [attacker] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("SSVToken");
    const token = await Token.deploy();
    await token.waitForDeployment();
    const Dao = await ethers.getContractFactory("SSVDAO");
    const dao = await Dao.deploy();
    await dao.waitForDeployment();

    const daoAddress = await dao.getAddress();
    const tokenAddress = await token.getAddress();

    // point DAO storage to SSV token
    const tokenSlot = storageSlot("ssv.network.storage.main", 7n);
    await ethers.provider.send("hardhat_setStorageAt", [
      daoAddress,
      tokenSlot,
      zeroPadValue(tokenAddress, 32),
    ]);

    // seed DAO balance with 1 token
    const amount = ethers.parseEther("1");
    await token.transfer(daoAddress, amount);
    const daoBalanceSlot = storageSlot("ssv.network.storage.protocol", 1n);
    const shrunk = amount / 10_000_000n;
    await ethers.provider.send("hardhat_setStorageAt", [
      daoAddress,
      daoBalanceSlot,
      zeroPadValue(toBeHex(shrunk), 32),
    ]);

    const beforeDao = await ethers.provider.getStorage(daoAddress, daoBalanceSlot);
    const beforeAttacker = await token.balanceOf(attacker.address);

    await expect(dao.connect(attacker).withdrawNetworkEarnings(0n))
      .to.emit(dao, "NetworkEarningsWithdrawn")
      .withArgs(0n, attacker.address);

    const afterDao = await ethers.provider.getStorage(daoAddress, daoBalanceSlot);
    const afterAttacker = await token.balanceOf(attacker.address);

    expect(afterAttacker - beforeAttacker).to.equal(0n);
    expect(afterDao).to.equal(beforeDao);
  });
});
