import { BigInt } from "@graphprotocol/graph-ts"
import {
  // vAPE,
  // Approval,
  // OperatorTransferred,
  // OwnershipTransferred,
  // TaxOfficeTransferred,
  Transfer
} from "../../generated/vapeWethLP/vapeWethLP"
import { vapeHolder, spendGas, tran } from "../../generated/schema"

import {
  trackGas,
  getHolder
} from "./vapeMapping"

export function handleTransfer(event: Transfer): void {
  let recipient = getHolder(event.params.to.toHex())
  let sender = getHolder(event.params.from.toHex())
  recipient.vapeWethBalance = recipient.vapeWethBalance.plus(event.params.value)
  sender.vapeWethBalance = sender.vapeWethBalance.minus(event.params.value)
  sender.save()
  recipient.save()

  saveTran(event, "vape-weth")
  trackGas(event)
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