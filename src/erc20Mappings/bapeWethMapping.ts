import { BigInt } from "@graphprotocol/graph-ts"
import {
  Transfer
} from "../../generated/bapeWethLP/bapeWethLP"
import { vapeHolder, spendGas, tran } from "../../generated/schema"

import {
  trackGas,
  getHolder
} from "./vapeMapping"

export function handleTransfer(event: Transfer): void {
  let recipient = getHolder(event.params.to.toHex())
  let sender = getHolder(event.params.from.toHex())
  recipient.bapeWethBalance = recipient.bapeWethBalance.plus(event.params.value)
  sender.bapeWethBalance = sender.bapeWethBalance.minus(event.params.value)
  sender.save()
  recipient.save()
  
  saveTran(event, "bape-weth")
  trackGas(event)
}

function saveTran (event: Transfer, token: string): void {
  let txnString = event.transaction.hash.toHexString()
  let tokenString = token
  let fromString = event.params.from.toHexString()
  let toString = event.params.to.toHexString()
  let transfer_id = txnString + tokenString + fromString + toString
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