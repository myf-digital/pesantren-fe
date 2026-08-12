import { Grid2 as Grid, Box } from '@mui/material'

const ScrollRow = ({ children }: { children: React.ReactNode }) => (
  <Grid size={12}>
    <Box
      sx={{
        display: { xs: 'grid', sm: 'flex' },
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'none' },
        gap: { xs: 4, sm: 6 },
        width: '100%',
        flexWrap: 'wrap',
        '& > *': {
          flex: { sm: '1 1 0px' }
        }
      }}
    >
      {children}
    </Box>
  </Grid>
)

export default ScrollRow
