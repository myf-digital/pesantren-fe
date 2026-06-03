// ** React Imports
import { Fragment } from 'react'

// ** MUI Imports
import LinearProgress from '@mui/material/LinearProgress'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'

function LinearProgressWithLabel(props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant='determinate' {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant='body2' color='text.secondary'>{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  )
}

const DialogLoading = ({ ...res }) => {
  return (
    <Fragment>
      <Dialog {...res} maxWidth='md' fullWidth={true} aria-labelledby='form-dialog-title'>
        <DialogTitle id='form-dialog-title' sx={{ textAlign: 'center' }}>
          Please wait...
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Box sx={{ width: '100%' }}>
              <LinearProgressWithLabel value={res.loadingProgress} />
            </Box>
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </Fragment>
  )
}

export default DialogLoading
