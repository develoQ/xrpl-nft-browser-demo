import { useCallback, useEffect, useState } from 'react'
import { AccountNFTsResponse, NFTBuyOffersResponse } from 'xrpl'
import { XrplClient } from 'xrpl-client'
import { derive, sign } from 'xrpl-accountlib'

export type NfToken = AccountNFTsResponse['result']['account_nfts'][number]

export type NftOffer = NFTBuyOffersResponse['result']['offers'][number]

export type AccountNfts = AccountNFTsResponse['result']['account_nfts'][number] & {
  buyOffers: NftOffer[]
  sellOffers: NftOffer[]
}

export type MintData = {
  account: string
  transferFee: number
  taxon: number
  uri: string
  flag: number
}

export type NFTokenOfferCreateData = {
  account: string
  owner: string
  tokenId: string
  amount: string
} & (
  | {
      destination: string | undefined
      flags: 1
    }
  | {
      flags: 0
    }
)

export const useXrpl = (initialSeed: string) => {
  const [seed, setSeed] = useState(initialSeed)
  const [client] = useState(new XrplClient('wss://hooks-testnet-v2.xrpl-labs.com'))
  const [keyPair] = useState(derive.familySeed(seed))
  const [address, setAddress] = useState<string>()
  const [balance, setBanance] = useState<string>('0')
  const [nfts, setNfts] = useState<AccountNfts[]>([])

  // アカウント情報取得
  const getAccountInfo = useCallback(async () => {
    // client.reinstate()
    await client.send({
      command: 'account_nfts',
    })
    const request = await client.send({
      command: 'account_info',
      account: keyPair.address,
      ledger_index: 'validated',
    })
    // client.close()
    return { address: request.account_data.Account, balance: (request.account_data.Balance / 1000000.0).toString(10) }
  }, [client, keyPair.address])

  // NFT一覧取得
  const getNfts = useCallback(
    async (address: string) => {
      // client.reinstate()
      const response = await client.send({
        command: 'account_nfts',
        account: address,
        limit: 100,
      })
      // client.close()
      return response.account_nfts as NfToken[]
    },
    [client]
  )

  // NFTのオファー取得
  const getOffers = useCallback(
    async (offerType: 'buy' | 'sell', tokenId: string) => {
      // client.reinstate()
      if (offerType === 'buy') {
        const response = await client.send({
          command: 'nft_buy_offers',
          nft_id: tokenId,
        })
        // client.close()
        return (response.offers as NftOffer[]) || []
      } else {
        const response = await client.send({
          command: 'nft_sell_offers',
          nft_id: tokenId,
        })
        // client.close()
        return (response.offers as NftOffer[]) || []
      }
    },
    [client]
  )

  // NFT発行
  const mintNft = useCallback(
    async (data: MintData) => {
      // client.reinstate()
      console.log(data)
      const { account_data } = await client.send({ command: 'account_info', account: keyPair.address })
      console.log(account_data)
      const tx = {
        TransactionType: 'NFTokenMint',
        Account: data.account,
        TransferFee: data.transferFee,
        NFTokenTaxon: data.taxon,
        Flags: data.flag,
        Fee: '10',
        URI: data.uri,
        Sequence: account_data.Sequence,
      }
      const { signedTransaction } = sign(tx, keyPair)
      const submit = await client.send({ command: 'submit', tx_blob: signedTransaction })
      client.close()
      return submit.error_exception
    },
    [client, keyPair]
  )

  // オファー作成
  const createOffer = useCallback(
    async (data: NFTokenOfferCreateData, seed?: string) => {
      // client.reinstate()
      const thisKeyPair = seed ? derive.familySeed(seed) : keyPair
      const { account_data } = await client.send({ command: 'account_info', account: thisKeyPair.address })
      const tx = {
        TransactionType: 'NFTokenCreateOffer',
        Account: data.account,
        Owner: data.flags === 1 ? undefined : data.owner,
        NFTokenID: data.tokenId,
        Amount: data.amount,
        Flags: data.flags,
        Fee: '10',
        Sequence: account_data.Sequence,
        Destination: data.flags === 1 ? data.destination : undefined,
      }

      if (tx.Destination === undefined) {
        delete tx.Destination
      }
      if (data.flags === 1) {
        delete tx.Owner
      }

      console.log(thisKeyPair)
      console.log(tx)

      const { signedTransaction } = sign(tx, thisKeyPair)
      const submit = await client.send({ command: 'submit', tx_blob: signedTransaction })
      console.log(submit)
      client.close()
      return submit.error_exception
    },
    [client, keyPair]
  )

  // 更新
  const reload = useCallback(async () => {
    client.reinstate()
    const { address, balance } = await getAccountInfo()
    setAddress(address)
    setBanance(balance)
    const nfts = await getNfts(keyPair.address!)
    setNfts([])

    const accountNftsTemp: AccountNfts[] = []
    for (let index = 0; index < nfts.length; index++) {
      const nft = nfts[index]
      accountNftsTemp.push({
        ...nft,
        buyOffers: await getOffers('buy', nft.NFTokenID),
        sellOffers: await getOffers('sell', nft.NFTokenID),
      })
      setNfts([...accountNftsTemp])
    }
    client.close()
  }, [client, getAccountInfo, getNfts, getOffers, keyPair.address])

  // useEffect(() => {
  //   reload()
  // }, [reload, seed])

  return { setSeed, reload, address, balance, nfts, mintNft, createOffer, getNfts }
}
