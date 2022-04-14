import { BigInt } from "@graphprotocol/graph-ts"
import {
    Deposit,
    RewardPaid,
    Withdraw
  } from "../../generated/anomalyRewardPool/anomalyRewardPool"

import {
trackGas,
getHolder
} from "../erc20Mappings/vapeMapping";

let poolMappings = new Map<String, String>()
poolMappings.set("0", "vape-ape")

import { vapeHolder, stakeToken, withdrawToken, rewardToken } from "../../generated/schema"

export function handleDeposit(event: Deposit): void {
    let holder = getHolder(event.params.user.toHex())
    let stakeId = event.transaction.hash.toHex() + "_" + event.params.pid.toString()
    let stake = new stakeToken(stakeId)
    let token = poolMappings.get(event.params.pid.toString())//[event.params.pid.toString()]
    stake.token = token.toString()
    stake.amount = event.params.amount
    stake.staker = event.params.user.toHex()
    stake.poolId = event.params.pid.toString()
    stake.poolContract = "anomalyRewards"
    stake.blockHeight = event.block.number
    stake.timestamp = event.block.timestamp
    stake.sender = event.transaction.from.toHex()
    stake.transactionId = event.transaction.hash.toHex()
    holder.save()
    stake.save()

    trackGas(event)
}
  
export function handleRewardPaid(event: RewardPaid): void {
    let id = event.transaction.hash.toHex() + "_" + event.transaction.from.toHex()
    let reward = new rewardToken(id)
    reward.to = event.params.user.toHex()
    reward.amount = event.params.amount
    reward.poolId = "NA"
    reward.rewardContract = "anomaly"
    reward.blockHeight = event.block.number
    reward.timestamp = event.block.timestamp
    reward.sender = event.transaction.from.toHex()
    reward.transactionId = event.transaction.hash.toHex()
    reward.save()

    let holder = getHolder(event.params.user.toHex())
    holder.vapeRewarded = holder.vapeRewarded.plus(event.params.amount)
    holder.save()
    trackGas(event)
}

export function handleWithdraw(event: Withdraw): void {
    let id = event.transaction.hash.toHex()
    let withdraw = new withdrawToken(id)
    let token = poolMappings.get(event.params.pid.toString())
    withdraw.token = token.toString()
    withdraw.amount = event.params.amount
    withdraw.to = event.params.user.toHex()
    withdraw.poolId = event.params.pid.toString()
    withdraw.rewardContract = "anomaly"
    withdraw.blockHeight = event.block.number
    withdraw.timestamp = event.block.timestamp
    withdraw.sender = event.transaction.from.toHex()
    withdraw.transactionId = event.transaction.hash.toHex()


    withdraw.save()
    trackGas(event)
}