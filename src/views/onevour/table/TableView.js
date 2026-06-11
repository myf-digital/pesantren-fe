import { useState, useEffect, Fragment } from 'react'

import TableContainer from '@mui/material/TableContainer'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableBody from '@mui/material/TableBody'
import TablePagination from '@mui/material/TablePagination'
import TableSortLabel from '@mui/material/TableSortLabel'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

import { getNestedValue } from './TableViewBuilder'

const TableView = ({ model, changeSort, ...res }) => {
  const [order, setOrder] = useState('asc') // "asc" | "desc"
  const [orderBy, setOrderBy] = useState('') // field name
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  useEffect(() => {
    if (changeSort) {
      changeSort({ order, orderBy })
    }
  }, [changeSort, order, orderBy])

  const renderTableHeader = (model = [], { order, orderBy, onSort }) => {
    if (!model.fields) {
      return <></>
    }

    return (
      <TableRow>
        {model.fields.map((o, i) => {
          const isActive = orderBy === o.key

          return (
            <TableCell key={i} align={o.align} sx={o.sx}>
              {o.sortable ? (
                <TableSortLabel active={isActive} direction={isActive ? order : 'asc'} onClick={() => onSort(o.key)}>
                  {o.title}
                </TableSortLabel>
              ) : (
                o.title
              )}
            </TableCell>
          )
        })}
      </TableRow>
    )
  }

  const renderTableRows = model => {
    if (!model?.values || model.values.length === 0) {
      return renderEmptyRow(model)
    }

    return (
      <>
        {model &&
          model.values &&
          model.values.map((o, i) => {
            return (
              <TableRow
                key={i}
                sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}
                onClick={() => {
                  if (typeof res?.onClick === 'function') {
                    res?.onClick(o)
                  }
                }}
                hover={res.hover || false}
              >
                {model.fields.map((x, y) => {
                  // Mengambil nilai nested jika ada dot notation (misal: 'santri.fullname')
                  const rawValue = getNestedValue(o, x.key)

                  if (x.key === 'act-x') {
                    return <Fragment key={y}>{x.format(o, rawValue)}</Fragment>
                  }

                  // Jika kolom memiliki fungsi format custom
                  if (x.format) {
                    return (
                      <TableCell key={y} align={x.align}>
                        {x.format(o, x.key ? rawValue : null)}
                      </TableCell>
                    )
                  }

                  return (
                    <TableCell key={y} align={x.align}>
                      {rawValue}
                    </TableCell>
                  )
                })}
              </TableRow>
            )
          })}
      </>
    )
  }

  const renderMobileRows = model => {
    if (!model?.values || model.values.length === 0) {
      return <div className='text-center py-8 text-gray-500'>Tidak Ada Data</div>
    }

    return (
      <div>
        {model.values?.map((row, i) => {
          const statusField = model.fields.find(f => ['status', 'status_label', 'status_display'].includes(f.key))
          const updatedField = model.fields.find(f => f.key === 'updated_at')
          const actionField = model.fields.find(f => f.key === 'act-x')
          const descriptionFields = model.fields.filter(f =>
            ['keterangan', 'description'].includes(f.key.toLowerCase())
          )

          const otherFields = model.fields.filter(
            f =>
              ![
                'status',
                'status_label',
                'status_display',
                'updated_at',
                'act-x',
                'keterangan',
                'description'
              ].includes(f.key)
          )

          return (
            <div key={i} className='border rounded-xl p-4 mb-3 bg-white shadow-sm relative'>
              {statusField && (
                <div className='absolute top-2 right-2 text-xs px-2 py-1 rounded'>
                  {statusField.format
                    ? statusField.format(row, getNestedValue(row, statusField.key))
                    : getNestedValue(row, statusField.key)}
                </div>
              )}

              <div className='flex-1 grid grid-cols-2 gap-3 mt-2'>
                {otherFields.map((f, idx) => {
                  const val = getNestedValue(row, f.key)
                  return (
                    <div key={idx} className='text-sm col-span-1'>
                      <div className='text-gray-500 text-xs'>{f.title}</div>
                      <div className='font-medium'>{f.format ? f.format(row, val) : val}</div>
                    </div>
                  )
                })}
                {descriptionFields.map((f, idx) => {
                  const val = getNestedValue(row, f.key)
                  return (
                    <div key={`desc-${idx}`} className='text-sm col-span-2'>
                      <div className='text-gray-500 text-xs'>{f.title}</div>
                      <div className='font-medium'>{f.format ? f.format(row, val) : val}</div>
                    </div>
                  )
                })}
              </div>

              <div className='flex justify-between items-center mt-4 pt-3 border-t border-gray-200'>
                {updatedField ? (
                  <div className='text-xs text-gray-500'>
                    <div className='text-gray-500 text-xs'>{updatedField.title}</div>
                    {updatedField.format
                      ? updatedField.format(row, getNestedValue(row, updatedField.key))
                      : getNestedValue(row, updatedField.key)}
                  </div>
                ) : (
                  <div></div>
                )}

                {actionField && (
                  <div className='shrink-0'>{actionField.format(row, getNestedValue(row, actionField.key))}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderEmptyRow = model => {
    const colSpan = model?.fields?.length || 1

    return (
      <TableRow>
        <TableCell colSpan={colSpan} align='center' sx={{ py: 4, color: 'text.secondary' }}>
          Tidak Ada Data
        </TableCell>
      </TableRow>
    )
  }

  const handleSort = fieldName => {
    const isAsc = orderBy === fieldName && order === 'asc'

    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(fieldName)
  }

  return (
    <>
      {model ? (
        <>
          {isMobile ? (
            renderMobileRows(model)
          ) : (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label='simple table'>
                <TableHead>{renderTableHeader(model, { order, orderBy, onSort: handleSort })}</TableHead>

                <TableBody>{renderTableRows(model)}</TableBody>
              </Table>
            </TableContainer>
          )}

          <TablePagination
            page={model.page - 1}
            component='div'
            count={model.count}
            rowsPerPage={model.perPage}
            onPageChange={model.changePage}
            rowsPerPageOptions={[10, 15, 25, 30, 50, 100]}
            onRowsPerPageChange={model.changePerPage}
          />
        </>
      ) : null}{' '}
    </>
  )
}

export default TableView
