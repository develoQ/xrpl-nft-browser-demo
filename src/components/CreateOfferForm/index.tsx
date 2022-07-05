import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { MenuItem, useTheme } from '@mui/material'
import { useXrpl, NfToken, NFTokenOfferCreateData } from '../../hooks/useXrpl'
import useLocalStorage from 'use-local-storage'
import { derive } from 'xrpl-accountlib'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
}

type CreateOfferFormProps = {
  owner: string
  seed: string
  tokenId: string
}

export const CreateOfferForm: FC<CreateOfferFormProps> = ({ owner, seed, tokenId }) => {
  const [seeds] = useLocalStorage<Array<string>>('seeds', [])
  const { getNfts, setSeed, createOffer } = useXrpl(seed)
  const [addressTokens, setAddressTokens] = useState<NfToken[]>([])

  const theme = useTheme()
  const [open, setOpen] = useState(false)

  const [sellFlag, setSellFlag] = useState<1 | 0>(1)
  const [account, setAccount] = useState<string>(owner)
  // const [tokenId, setTokenId] = useState<string>()
  const [amount, setAmount] = useState<number>(0)
  const [destination, setDestination] = useState<string>()

  const [error, setError] = useState<string>()

  const addresses = useMemo(() => {
    return seeds.map((seed) => derive.familySeed(seed))
  }, [seeds])

  useEffect(() => {
    const f = async () => {
      const nfts = await getNfts(owner)
      setAddressTokens(nfts)
    }
    f()
  }, [getNfts, owner])

  useEffect(() => {
    if (account === owner) {
      setSellFlag(1)
    } else {
      setSellFlag(0)
    }
  }, [account, owner])

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  useEffect(() => {
    const txSeed = addresses.find((address) => address.address === account)!.secret.familySeed!
    setSeed(txSeed)
  }, [account, addresses, setSeed])

  const handleCreateOffer = async () => {
    console.log(addresses.find((address) => address.address === account))
    const message = await createOffer(
      {
        account,
        owner,
        tokenId,
        amount: amount.toString(),
        destination,
        flags: sellFlag,
      },
      addresses.find((address) => address.address === account)!.secret.familySeed!
    )

    if (!message) {
      handleClose()
    } else {
      setError(message)
    }
  }

  return (
    <div>
      <Button variant='text' onClick={handleClickOpen} size='small'>
        <ShoppingBagOutlinedIcon fontSize='small' />
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Subscribe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To subscribe to this website, please enter your email address here. We will send updates occasionally.
          </DialogContentText>
          {/* Account */}
          <TextField
            select
            autoFocus
            value={account}
            margin='dense'
            id='name'
            label='Account'
            type='email'
            fullWidth
            variant='standard'
            onChange={(e) => setAccount(e.target.value)}
          >
            {addresses.map((address) => (
              <MenuItem key={address.address!} value={address.address!}>
                {address.address}
              </MenuItem>
            ))}
          </TextField>
          {/* Owner */}
          <TextField
            value={owner}
            margin='dense'
            id='name'
            label='Owner'
            type='email'
            fullWidth
            variant='standard'
            // onChange={(e) => setOwner(e.target.value)}
          />
          {/* NFTokenId */}
          <TextField
            value={tokenId}
            id='name'
            label='tokenId'
            type='emai'
            // onChange={(e) => setTokenId(e.currentTarget.value)}
            fullWidth
            variant='standard'
          />
          {/* Amount */}
          <TextField
            value={amount}
            margin='dense'
            id='name'
            label='Amount(drop)'
            type='number'
            onChange={(e) => setAmount(parseFloat(e.currentTarget.value))}
            fullWidth
            variant='standard'
          />
          {/* Destination */}
          <TextField
            value={destination}
            margin='dense'
            id='name'
            label='Destination'
            disabled={!sellFlag}
            type='email'
            onChange={(e) => setDestination(e.currentTarget.value)}
            fullWidth
            variant='standard'
          />
          {!!error && (
            <DialogContentText color={'red'} sx={{ marginTop: '36px' }}>
              {error}
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          {!!sellFlag && (
            <Button variant='contained' color='success' onClick={handleCreateOffer}>
              Sell Offer
            </Button>
          )}
          {!sellFlag && (
            <Button variant='contained' color='primary' onClick={handleCreateOffer}>
              Buy Offer
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  )
}
