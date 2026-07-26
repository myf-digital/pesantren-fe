import React, { useRef, useState } from 'react'

import Box from '@mui/material/Box'

import Collapse from '@mui/material/Collapse'
import Grid from '@mui/material/Grid2'

import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'

import { styled } from '@mui/material/styles'
import CardContent from '@mui/material/CardContent'

import { useForm } from 'react-hook-form'

import TableCell from '@mui/material/TableCell'

import Menu from '@mui/material/Menu'

import { formColumn } from '../form/AppFormBuilder'

import TableView from '../table/TableView'
import { tableColumn } from '../table/TableViewBuilder'

import Repeater from '../../../@core/components/repeater'

import { useRouter } from 'next/navigation'

const RepeatingContent = styled(Grid)(({ theme }) => ({
  paddingRight: 0,
  display: 'flex',
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  '& .col-title': {
    top: '-2.375rem',
    position: 'absolute'
  },
  [theme.breakpoints.down('md')]: {
    '& .col-title': {
      top: '0',
      position: 'relative'
    }
  }
}))

const RepeaterWrapper = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(8, 0, 0),
  '& .repeater-wrapper + .repeater-wrapper': {
    marginTop: theme.spacing(8)
  },
  [theme.breakpoints.down('md')]: {
    paddingTop: theme.spacing(8)
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(6)
  }
}))

const RowAction = ({ data, onRowUpdate, onRowDeleted, view }) => {
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState(null)

  const rowOptionsOpen = Boolean(anchorEl)

  const setOpen = event => {
    setAnchorEl(event.currentTarget)
  }

  const optionsOnClose = () => {
    setAnchorEl(null)
  }

  const handleUpdate = () => {
    onRowUpdate(data)
    optionsOnClose()
  }

  const handleDelete = () => {
    onRowDeleted(data.id)
    optionsOnClose()
  }

  const handleTindakan = () => {
    optionsOnClose()
    router.push(`/app/kebersihan-temuan/form?id=${data.id_temuan}&tindakan=true`)
  }

  return (
    <TableCell size='small'>
      <IconButton aria-controls='long-menu' size='small' aria-haspopup='true' onClick={setOpen}>
        <i className='tabler-dots-vertical' fontSize={20} />
      </IconButton>
      <Menu
        keepMounted
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={optionsOnClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ style: { minWidth: '8rem' } }}
      >
        {Boolean(view) ? (
          <>
            <MenuItem onClick={handleTindakan} sx={{ '& svg': { mr: 2 } }}>
              <i className='tabler-check' fontSize={20} />
              Tindakan
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem onClick={handleUpdate} sx={{ '& svg': { mr: 2 } }}>
              <i className='tabler-edit' fontSize={20} />
              Edit
            </MenuItem>

            <MenuItem onClick={handleDelete} sx={{ '& svg': { mr: 2 } }}>
              <i className='tabler-trash' fontSize={20} />
              Delete
            </MenuItem>
          </>
        )}
      </Menu>
    </TableCell>
  )
}

const ItemForm = ({ temuanDetailsSelected, onAddTemuanDetail, onDeleteTemuanDetail, view }) => {
  const [count, setCount] = useState(1)

  const defaultValues = {
    deskripsi: '',
    kategori: '',
    perlu_tindak_lanjut: false,
    foto_path: '',
    edit: false,
    foto_path_tindakan: '',
    status: 0
  }

  const [state, setState] = useState(defaultValues)

  const [loading, setLoading] = useState(false)

  const [rowsPerPage, setRowsPerPage] = useState(50)

  const formRef = useRef(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({ defaultValues })

  const convertOptionTingkat = () => {
    return [
      {
        label: 'Ringan',
        value: 1
      },
      {
        label: 'Sedang',
        value: 2
      },
      {
        label: 'Berat',
        value: 3
      }
    ]
  }

  const onCancel = () => {
    setState(defaultValues)
    setTimeout(() => {
      reset(defaultValues)
    }, 0)
  }

  const resetClove = ref => {
    if (ref.current && ref.current.getRawValue().trim() !== '') {
      ref.current.setRawValue('')
    }
  }

  const onButtonSubmit = () => {
    handleSubmit(onSubmit)()
  }

  const onSubmit = () => {
    const cost = { ...state, temuan_id: state.temuan_id ? state.temuan_id : new Date().getTime() }

    // add temp
    onAddTemuanDetail(cost)

    // clear form
    onCancel()
  }

  const fields = () => {
    return [
      {
        type: 'text',
        key: 'kategori',
        label: 'Kategori',
        placeholder: 'Input Kategori',
        required: true
      },
      {
        type: 'select',
        key: 'tingkat',
        label: 'Tingkat',
        placeholder: 'Input Tingkat',
        required: true,
        options: {
          values: convertOptionTingkat()
        }
      },
      {
        type: 'checkbox',
        key: 'perlu_tindak_lanjut',
        label: 'Perlu Tindak Lanjut',
        placeholder: 'Input Perlu Tindak Lanjut',
        required: false
      },
      {
        type: 'textarea',
        key: 'deskripsi',
        label: 'Deskripsi',
        placeholder: 'Input Deskripsi',
        required: false
      },
      {
        type: 'image',
        key: 'foto_path',
        label: 'Foto',
        urlImage: '',
        placeholder: 'Upload foto',
        required: false
      },
      {
        type: 'button',
        submit: 'Add',
        cancel: 'Clear',
        onClick: onButtonSubmit,
        onCancel: onCancel,
        loading: loading
      }
    ]
  }

  const imageView = (row, value) => {
    if (row.foto_path.match(/^data:(.+);base64,(.+)$/)) {
      return <img src={row.foto_path} alt='image' width={100} height={100} />
    }

    return <img src={`${process.env.NEXT_PUBLIC_API_URL}${row.foto_path}`} alt='image' width={100} height={100} />
  }

  // table
  const buildTable = () => {
    return {
      page: 0,
      fields: [
        tableColumn('OPTION', 'act-x', 'left', renderOption),
        tableColumn('Kategori', 'kategori', 'left'),
        tableColumn('Tingkat', 'tingkat_custom', 'left'),
        tableColumn('Perlu Tindak Lanjut', 'tindak_lanjut', 'left'),
        tableColumn('Deskripsi', 'deskripsi', 'left'),
        tableColumn('Foto', 'foto_path', 'left', imageView)
      ],
      values: temuanDetailsSelected.map(r => {
        return {
          ...r,
          tingkat_custom: r.tingkat?.label ?? convertOptionTingkat().find(d => d.value === r.tingkat)?.label,
          tindak_lanjut: r.perlu_tindak_lanjut ? 'Ya' : 'Tidak'
        }
      }),
      count: temuanDetailsSelected.length,
      perPage: rowsPerPage,
      changePage: (event, newPage) => {
        // handleChangePage(event, newPage)
      },
      changePerPage: (event, o) => {
        // handleChangeRowsPerPage(event)
      }
    }
  }

  const onRowUpdate = row => {
    row = {
      ...row,
      tingkat: row.tingkat?.value
        ? row.tingkat
        : {
            value: row.tingkat,
            label: convertOptionTingkat().find(r => r.value === row.tingkat)?.label
          },
      edit: true
    }

    setState(row)
    reset(row)
  }

  const onRowDeleted = id => {
    onDeleteTemuanDetail(id)
  }

  const renderOption = (row, value) => {
    return <RowAction data={row} onRowUpdate={onRowUpdate} onRowDeleted={onRowDeleted} view={view} />
  }

  return (
    <RepeaterWrapper>
      {!Boolean(view) && (
        <div ref={formRef} className='mb-3'>
          <Repeater count={count}>
            {i => {
              const Tag = i === 0 ? Box : Collapse

              return (
                <Tag key={i} className='repeater-wrapper' {...(i !== 0 ? { in: true } : {})}>
                  <Grid container>
                    <RepeatingContent size={12}>
                      <Grid container sx={{ py: 4, width: '100%', pr: { lg: 0, xs: 4 } }}>
                        <Grid size={12} sx={{ px: 4, my: { lg: 0, xs: 4 } }}>
                          {formColumn({
                            control: control,
                            errors: errors,
                            state: state,
                            setState: setState,
                            fields: fields()
                          })}
                        </Grid>
                      </Grid>
                    </RepeatingContent>
                  </Grid>
                </Tag>
              )
            }}
          </Repeater>
        </div>
      )}

      <TableView model={buildTable()} />
    </RepeaterWrapper>
  )
}

export default ItemForm
