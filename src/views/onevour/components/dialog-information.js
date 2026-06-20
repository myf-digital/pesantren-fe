// ** React Imports
import { Fragment } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'

const DialogInformation = ({ title, content, handleOk, ...res }) => {
  return (
    <Fragment>
      <Dialog {...res} maxWidth='md' fullWidth={true} aria-labelledby='form-dialog-title'>
        <DialogTitle id='form-dialog-title'>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText component='div'>{content}</DialogContentText>
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button onClick={handleOk} color='primary'>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  )
}

export default DialogInformation
