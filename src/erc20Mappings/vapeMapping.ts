import { BigInt } from "@graphprotocol/graph-ts"
import {
  // vAPE,
  // Approval,
  // OperatorTransferred,
  // OwnershipTransferred,
  // TaxOfficeTransferred,
  Transfer
} from "../../generated/vAPE/vAPE"
import { vapeHolder, spendGas, tran } from "../../generated/schema"

import {
  ethereum
} from "@graphprotocol/graph-ts";

export function handleTransfer(event: Transfer): void {
  let recipient = getHolder(event.params.to.toHex())
  let sender = getHolder(event.params.from.toHex())
  recipient.balance = recipient.balance.plus(event.params.value)
  sender.balance = sender.balance.minus(event.params.value)
  sender.save()
  recipient.save()
  saveTran(event, "vape")
  trackGas(event)
}


export function trackGas (event: ethereum.Event): void {
  let holder = getHolder(event.transaction.from.toHex())
  holder.save()

  let id = event.transaction.hash.toHex()
  let spend = new spendGas(id)
  spend.spender = event.transaction.from.toHex()
  spend.gasUsed = event.transaction.gasLimit
  spend.gasPrice = event.transaction.gasPrice
  spend.blockHeight = event.block.number
  spend.timestamp = event.block.timestamp
  spend.transactionId = event.transaction.hash.toHex()
  spend.save()
}

export function getHolder (id: string): vapeHolder {
  //let holder = new vapeHolder(id)
  let holder = vapeHolder.load(id)
  if (holder == null) {
    holder = new vapeHolder(id)
    holder.balance = new BigInt(0)
    holder.bapeBalance = new BigInt(0)
    holder.yugapeBalance = new BigInt(0)
    holder.vapeApeBalance = new BigInt(0)
    holder.vapeWethBalance = new BigInt(0)
    holder.bapeVapeBalance = new BigInt(0)
    holder.bapeWethBalance = new BigInt(0)
  }
  return holder
}

function getTranId (event: Transfer): string {
  let txnString = event.transaction.hash.toHexString()
  let tokenString = event.params.value.toHexString()
  let fromString = event.params.from.toHexString()
  let toString = event.params.to.toHexString()
  let transfer_id = txnString + "_" + tokenString + "_" + fromString + "_" + toString
  return transfer_id
}

function saveTran (event: Transfer, token: string): void {
  let transfer_id = getTranId(event)
  let transfer = new tran(transfer_id)
  transfer.amount = event.params.value
  transfer.token = token
  transfer.to = event.params.to.toHex()
  transfer.from = event.params.from.toHex()
  transfer.transactionId = event.transaction.hash.toHex()
  transfer.blockHeight = event.block.number
  transfer.timestamp = event.block.timestamp
  transfer.sender = event.transaction.from.toHex()
  transfer.transactionId = event.transaction.hash.toHex()
  transfer.save()
}
