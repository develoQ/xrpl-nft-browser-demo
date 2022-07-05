import Add from '@mui/icons-material/Add'
import { Box, Button, Stack } from '@mui/material'
import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { AccountCard } from '../components/AccountCard'
import { useManageSeeds } from '../hooks/useManageSecrets'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  const { seeds, generateSecret, removeSeed } = useManageSeeds()

  useEffect(() => {
    const f = async () => {
      if (seeds.length === 0) {
        await generateSecret()
      }
    }
    f()
  }, [generateSecret, seeds])

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          XRP Ledger <a href='https://github.com/XRPLF/XRPL-Standards/discussions/46'>Native NFT</a> Demo
        </h1>
        {mounted && (
          <Stack spacing={2} direction='row'>
            {seeds.map((seed, key) => (
              <AccountCard key={key} seed={seed} onDelete={() => removeSeed(seed)} />
            ))}
            {seeds.length < 3 && (
              <Button onClick={generateSecret} variant='outlined'>
                <Add />
              </Button>
            )}
          </Stack>
        )}
      </main>
    </div>
  )
}

export default Home
