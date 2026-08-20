import { useRouter } from 'next/navigation'

import { Box, Card, CardContent, Grid2 as Grid, Typography } from '@mui/material'

const CardKhodimul = ({ ...res }) => {
  const router = useRouter()

  const navigate = (url: string) => router.push(url)

  return (
    <Card sx={{ marginBottom: 4 }}>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography
            variant='h5'
            sx={{
              marginBottom: 2,
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <i className={`${res.icon} text-[25px] mr-2`} />
            {res.title}
          </Typography>
          <Typography
            variant='h6'
            sx={{
              marginBottom: 2,
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}
            onClick={() => navigate(res.url || '/dashboards/khodimul')}
          >
            Detail
            <i className='tabler-chevron-right text-[18px] ml-2' />
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {res.data.map((r: any, index: number) => {
            return (
              <Grid size={{ md: 4 }} key={index}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 2,
                    backgroundColor: r.color || '#cfd1cc',
                    padding: 2
                  }}
                >
                  <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                    {r.title}
                  </Typography>
                  <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
                    {r.value}
                  </Typography>
                </Box>
              </Grid>
            )
          })}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default CardKhodimul
