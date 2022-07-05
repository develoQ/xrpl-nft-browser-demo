import { FC, useMemo, useState } from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Input,
  Select,
  SelectChangeEvent,
  Theme,
  useTheme,
} from '@mui/material'
import { MintData } from '../../hooks/useXrpl'

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

function getStyles(name: string, flags: readonly string[], theme: Theme) {
  return {
    fontWeight: flags.indexOf(name) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium,
  }
}

const FLAGS = {
  Burnable: 1,
  OnlyXRP: 2,
  TrustLine: 4,
  Transferable: 8,
}

type MintFormProps = {
  address: string
  onMint: (data: MintData) => Promise<string | undefined>
}

export const MintForm: FC<MintFormProps> = ({ address, onMint }) => {
  const theme = useTheme()
  const [open, setOpen] = useState(false)

  const [transferFee, setTransferFee] = useState<number>(0)
  const [taxon, setTaxon] = useState<number>(0)
  const [uri, setUri] = useState<string>('')

  const [flags, setFlags] = useState<{ [key in 'Burnable' | 'OnlyXRP' | 'TrustLine' | 'Transferable']: boolean }>({
    Burnable: false,
    OnlyXRP: false,
    TrustLine: false,
    Transferable: false,
  })

  const [error, setError] = useState<string>()

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleFlagsChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event

    let tmp = {
      Burnable: false,
      OnlyXRP: false,
      Transferable: false,
      TrustLine: false,
    } as typeof flags
    ;(value as ('Burnable' | 'OnlyXRP' | 'TrustLine' | 'Transferable')[]).forEach((val) => {
      tmp = {
        ...tmp,
        [val]: true,
      }
    })
    console.log(tmp)
    setFlags({ ...tmp })
  }

  const flagNames = useMemo(() => {
    return (Object.keys(flags) as unknown as (keyof typeof flags)[]).filter((key) => flags[key] === true) as string[]
  }, [flags])

  const handleMint = async () => {
    const flagValue = (Object.keys(flags) as unknown as (keyof typeof flags)[])
      .filter((key) => flags[key] === true)
      .map((f) => {
        return FLAGS[f]
      })
      .reduce((prev, curr) => prev + curr, 0)

    const message = await onMint({
      account: address,
      transferFee,
      taxon: taxon!,
      uri: uri!,
      flag: flagValue,
    })
    if (!message) {
      handleClose()
    } else {
      setError(message)
    }
  }

  return (
    <div>
      <Button variant='outlined' onClick={handleClickOpen}>
        Mint
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Subscribe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To subscribe to this website, please enter your email address here. We will send updates occasionally.
          </DialogContentText>
          {/* Account */}
          <TextField
            autoFocus
            value={address}
            margin='dense'
            id='name'
            label='Account'
            type='email'
            fullWidth
            variant='standard'
          />
          {/* TransferFee */}
          <TextField
            autoFocus
            value={transferFee}
            id='name'
            label='TransferFee'
            type='number'
            onChange={(e) => setTransferFee(parseFloat(e.currentTarget.value))}
            fullWidth
            variant='standard'
          />
          {/* Taxon */}
          <TextField
            autoFocus
            value={taxon}
            margin='dense'
            id='name'
            label='Taxon'
            type='number'
            onChange={(e) => setTaxon(parseFloat(e.currentTarget.value))}
            fullWidth
            variant='standard'
          />
          {/* URI */}
          <TextField
            value={uri}
            autoFocus
            margin='dense'
            id='name'
            label='URI'
            type='email'
            onChange={(e) => setUri(e.currentTarget.value)}
            fullWidth
            variant='standard'
          />
          {/* フラグ */}
          <FormControl fullWidth variant='standard' margin='dense'>
            <InputLabel id='flags-label'>Flag</InputLabel>
            <Select
              labelId='flags-label'
              id='flag-id'
              fullWidth
              multiple
              variant='standard'
              value={flagNames}
              onChange={handleFlagsChange}
              input={<Input id='flag-id' />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size='small' />
                  ))}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {(Object.keys(FLAGS) as unknown as (keyof typeof FLAGS)[]).map((flag) => (
                <MenuItem key={FLAGS[flag]} value={flag} style={getStyles(flag, flagNames, theme)}>
                  {flag}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {!!error && (
            <DialogContentText color={'red'} sx={{ marginTop: '36px' }}>
              {error}
            </DialogContentText>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleMint}>Mint</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
