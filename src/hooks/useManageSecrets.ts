import useLocalStorage from 'use-local-storage'
import { useEffect, useState } from 'react'

export const useManageSeeds = () => {
  const [generating, setGenerating] = useState(false)
  const [seeds, setSeeds] = useLocalStorage<Array<string>>('seeds', [])

  // シークレットキーの生成
  const generateSecret = async () => {
    // const seed = generateSeed()
    const { seed } = await fetch('/api/fundWallet', {
      method: 'POST',
    }).then(async (res) => await res.json())
    setSeeds([...seeds, seed])
  }

  const removeSeed = (removeSeed: string) => {
    const filterd = seeds.filter((seed) => seed !== removeSeed)
    setSeeds([...filterd])
  }

  useEffect(() => {
    const f = async () => {
      if (!generating && seeds.length === 0) {
        setGenerating(true)
        await generateSecret()
      }
    }
    f()
  }, [])

  return { seeds, generateSecret, removeSeed }
}
