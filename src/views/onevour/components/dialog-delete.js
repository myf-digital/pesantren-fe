// ** React Imports
import { Fragment } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'

const DialogConfirmation = ({ id, handleClose, handleOk, ...res }) => {
  return (
    <Fragment>
      <Dialog maxWidth='xs' fullWidth={true} {...res} onClose={handleClose} aria-labelledby='alert-dialog-title' aria-describedby='alert-dialog-description'>
        <DialogTitle id='alert-dialog-title'>Hapus</DialogTitle>
        <DialogContent>
          <DialogContentText component='div' id='alert-dialog-description'>
            Apakah yakin menghapus data <div style={{ display: 'inline-block', paddingLeft: '0px', fontWeight: 600 }}>{id}</div>?
          </DialogContentText>
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button onClick={handleClose}>Tidak</Button>
          <Button onClick={handleOk} color='error'>
            Ya
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  )
}

export default DialogConfirmation
