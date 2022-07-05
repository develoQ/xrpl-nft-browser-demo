import { Delete } from '@mui/icons-material'
import { Box, Button, Card, CardActions, CardContent, Stack, Typography } from '@mui/material'
import { FC, useState, useEffect } from 'react'
import { MintData, useXrpl } from '../../hooks/useXrpl'
import { CreateOfferForm } from '../CreateOfferForm'
import { MintForm } from '../MintForm'

type AccountCardProps = {
  seed: string
  onDelete: () => void
}

export const AccountCard: FC<AccountCardProps> = ({ seed, onDelete }) => {
  const { address, balance, nfts, reload, mintNft } = useXrpl(seed)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const onMint = async (props: MintData) => {
    const message = await mintNft(props)
    await reload()
    return message
  }

  if (!mounted) {
    return <></>
  } else {
    return (
      <Card sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <CardContent>
          <Stack direction='row'>
            <Typography variant='h5'>{address}</Typography>
            <Button onClick={reload}>更新</Button>
          </Stack>

          <Box>残高: {balance} XRP</Box>
          <Box sx={{ marginTop: '24px' }}>
            保有NFT
            {nfts.map((nft, index) => (
              <Box key={index} sx={{ paddingLeft: '24px', paddingBottom: '12px' }}>
                <Stack flex={1} direction='row'>
                  <Box pt={1} mr={1}>
                    {nft.NFTokenID}
                  </Box>
                  <div style={{ width: '100%' }} />
                  <CreateOfferForm owner={address!} seed={seed} tokenId={nft.NFTokenID} />
                </Stack>
                <Box>
                  <Typography variant='subtitle2'>買オファー</Typography>
                  {nft.buyOffers.map((o, k) => (
                    <Box key={k}>{o.nft_offer_index}</Box>
                  ))}
                </Box>
                <Box>
                  <Typography variant='subtitle2'>売オファー</Typography>
                  {nft.sellOffers.map((o, k) => (
                    <Box key={k}>{o.nft_offer_index}</Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>

        <CardActions>
          <>
            <MintForm address={address || ''} onMint={onMint} />
          </>
          <Box width='100%' />
          <div>
            <Button variant='contained' color='error' onClick={onDelete}>
              Delete
            </Button>
          </div>
        </CardActions>
      </Card>
    )
  }
}
