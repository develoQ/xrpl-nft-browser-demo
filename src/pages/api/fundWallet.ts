// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse<{ seed: string }>) {
  const { secret: seed } = await fetch('https://hooks-testnet-v2.xrpl-labs.com/newcreds', {
    method: 'POST',
  }).then(async (res) => await res.json())
  res.status(200).json({ seed })
}
