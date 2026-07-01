import React, { Fragment, useEffect } from 'react'

import Grid from '@mui/material/Grid2'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox'
import Radio from '@mui/material/Radio'
import FormControlLabel from '@mui/material/FormControlLabel'
import { Controller } from 'react-hook-form'
import Autocomplete from '@mui/material/Autocomplete'
import InputAdornment from '@mui/material/InputAdornment'

import Button from '@mui/material/Button'
import FormHelperText from '@mui/material/FormHelperText'
import CircularProgress from '@mui/material/CircularProgress'

// Tiptap Imports
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TextAlign } from '@tiptap/extension-text-align'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

// numeral
import Cleave from 'cleave.js/react'

import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'


import Box from '@mui/material/Box'

import {
  updateFile,
  updateValueDate,
  updateValueMaskingThousand,
  updateValueNumber,
  updateValueSelect,
  updateValueSelectMulti,
  updateValueText
} from './AppFormInputCommons'

import InputFile from '../components/input-file'

import MapGoogle from '../components/input-maps'

import InputImage from '../components/input-image'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

// Components Imports
import CustomTextField from '@core/components/mui/TextField'

// Styled Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

function MaskedTextField(props) {
  const { options, inputRef, ...other } = props

  return <Cleave {...other} ref={inputRef} options={options} />
}

export function fieldBuildType(label, type, key, options, placeholder) {
  return fieldBuild(label, type, key, false, options, placeholder)
}

export function field(props) {
  const {
    type,
    label,
    tooltip,
    key,
    placeholder,
    required = false,
    readOnly = false,
    options,
    callback,
    onChange,
    ref,
    checked = false,
    startAdornment = null,
    endAdornment = null,
    portalId = '',
    minDate = null,
    minTime = null,
    maxTime = null,
    variant = null,
    color = null,
    autoFocus = false,
    urlImage = null,
    render,
    interval = 30,
    base64 = false,
    accept,
    helperText
  } = props

  return {
    type: type,
    label: label,
    tooltip: tooltip,
    key: key,
    placeholder: placeholder,
    required: required,
    readOnly: readOnly,
    options: options,
    callback: callback,
    ref: ref,
    checked: checked,
    startAdornment: startAdornment,
    endAdornment: endAdornment,
    portalId: portalId,
    minDate: minDate,
    minTime: minTime,
    maxTime: maxTime,
    variant: variant,
    color: color,
    autoFocus: autoFocus,
    urlImage: urlImage,
    render,
    interval,
    base64,
    onChange,
    accept,
    helperText
  }
}

export function fieldEditor(control, state, setter, label, type, key, placeholder, options, callback, ref) {
  return {
    control: control,
    state: state,
    setter: setter,
    label: label,
    type: type,
    key: key,
    placeholder: placeholder,
    options: options,
    callback: callback,
    ref: ref
  }
}

export function fieldBuild(label, type, key, options, placeholder, callback, ref) {
  return {
    label: label,
    type: type,
    key: key,
    options: options,
    placeholder: placeholder,
    callback: callback,
    ref: ref
  }
}

export function fieldBuildSpace(label = '') {
  return {
    label: label,
    type: 'space'
  }
}

// https://www.digitalocean.com/community/tutorials/understanding-default-parameters-in-javascript
export const fieldBuildSubmit = form => {
  const {
    type = 'submit',
    submit = 'Submit',
    cancel = 'Cancel',
    onClick,
    onCancel,
    loading = false,
    disabled = false,
    print = false,
    onPrint,
    label = '',
    onApprove,
    onReject
  } = form

  return {
    type: type,
    submit: submit,
    cancel: cancel,
    onClick: onClick,
    onCancel: onCancel,
    loading: loading,
    disabled: disabled,
    print: print,
    onPrint: onPrint,
    label: label,
    onApprove: onApprove,
    onReject: onReject
  }
}

// single column per row
export function formColumnSingle(state, values) {
  return formColumn(state, values, 1)
}

// render column
export const formColumn = param => {
  const { control, errors, state, setState, fields, count = 2 } = param

  // 1 column
  if (1 === param.count) {
    return (
      <>
        {param.values.map((o, i) => {
          return (
            <Grid container spacing={5} key={i} sx={{ width: '100%' }}>
              {formColumnSingleDetailField(param.state, o, i)}
            </Grid>
          )
        })}
      </>
    )
  }

  // 2 column
  return (
    <Grid container spacing={5} sx={{ width: '100%' }}>
      {param.fields.map((o, i) => {
        return formColumnDetailField({
          control: param.control,
          errors: errors,
          session: { state: param.state, setState: param.setState },
          props: o,
          index: i
        })
      })}
    </Grid>
  )
}

export function formColumnSingleDetailField(state, o, i) {
  if ('submit' === o?.type) {
    return (
      <Fragment>
        <button type='submit' className='btn btn-success'>
          {o?.label}
        </button>
      </Fragment>
    )
  }

  if ('submit-cancel' === o?.type) {
    return (
      <Fragment>
        <button type='submit' className='btn btn-success mr-2'>
          {o?.label}
        </button>
        <button type='cancel' className='btn mr-2' onClick={o?.clearForm}>
          {o?.cancel}
        </button>
      </Fragment>
    )
  }

  if ('space' === o?.type) {
    return (
      <Fragment>
        <Grid size={{ xs: 12, sm: 6 }} key={index} />
      </Fragment>
    )
  }

  return (
    <>
      <label>{o?.label}</label>
      {'text' === o?.type ? textField(state, o?.control, o?.label, o?.type, o?.key, o?.option, o?.placeholder) : null}
      {'editor' === o?.type ? TextFieldEditor(state, o?.control, o?.key, o?.placeholder, o.ref) : null}
      {'select' === o?.type
        ? selectField(state, o?.control, o?.key, o?.option?.is_number, o?.placeholder, o?.options, o.callback)
        : null}
      {'space' === o?.type ? null : null}

      {'year' === o?.type ? textFieldYear(state, o?.control, o?.key, o?.placeholder, o.ref) : null}
      {'password' === o?.type
        ? textField(state, o?.control, o?.type, o?.key, o?.option?.is_number, o?.placeholder)
        : null}
      {'hidden' === o?.type ? textFieldHidden(state, o?.control, o?.key) : null}
      {'textarea' === o?.type ? textareaField(state, o?.control, o?.key, o?.option?.is_number, o?.placeholder) : null}
      {'date' === o?.type ? textFieldDate(state, o?.control, o?.key, o?.placeholder, o.ref) : null}
      {'file' === o?.type ? textFieldFile(state, o?.control, o?.key, o?.placeholder, o.ref) : null}
      {'custom' === o?.type ? formSingleColumn(state, o?.control, o?.key, o?.placeholder, o.ref) : null}

      {error(state, o?.key)}
    </>
  )
}

/**
 * 2 column
 * */
export function formColumnDetailField(form) {
  const { props, index = 0 } = form

  if (undefined === props || null === props) return

  if ('submit' === props.type) {
    return (
      <Grid size={12} key={index}>
        <div className='demo-space-x'>
          <Button size='medium' type='submit' variant='contained' disabled={props.disabled || props.loading}>
            {props?.loading ? (
              <CircularProgress
                sx={{
                  color: 'common.white',
                  width: '18px !important',
                  height: '18px !important',
                  mr: theme => theme.spacing(2)
                }}
              />
            ) : null}
            {props?.submit}
          </Button>
          <Button size='medium' variant='outlined' color='secondary' onClick={props?.onCancel}>
            {props?.cancel}
          </Button>
        </div>
      </Grid>
    )
  }

  if ('button' === props.type) {
    return (
      <Grid size={12} key={index}>
        <div className='demo-space-x'>
          {props.print ? (
            <Button
              size='medium'
              type='button'
              variant='contained'
              onClick={props.onPrint}
              disabled={props.disabled || props.loading}
              color='info'
              startIcon={<i className='material-symbols-print' />}
            >
              Print
            </Button>
          ) : (
            <Button size='medium' type='button' variant='contained' onClick={props.onClick} disabled={props.disabled || props.loading}>
              {props?.loading ? (
                <CircularProgress
                  sx={{
                    color: 'common.white',
                    width: '18px !important',
                    height: '18px !important',
                    mr: theme => theme.spacing(2)
                  }}
                />
              ) : null}
              {props?.submit}
            </Button>
          )}
          {props?.onCancel && (
            <Button size='medium' variant='outlined' color='secondary' onClick={props?.onCancel}>
              {props?.cancel}
            </Button>
          )}
        </div>
      </Grid>
    )
  }

  if ('approve' === props.type) {
    return (
      <Grid size={12} key={index}>
        <div className='demo-space-x'>
          {props.print ? (
            <Button
              size='medium'
              type='button'
              variant='contained'
              onClick={props.onPrint}
              disabled={props.disabled}
              color='success'
              startIcon={<i className='material-symbols-check' />}
            >
              {props.label ? props.label : 'Approve'}
            </Button>
          ) : (
            <Button size='medium' type='button' variant='contained' onClick={props.onClick} disabled={props.disabled}>
              {props?.loading ? (
                <CircularProgress
                  sx={{
                    color: 'common.white',
                    width: '18px !important',
                    height: '18px !important',
                    mr: theme => theme.spacing(2)
                  }}
                />
              ) : null}
              {props?.submit}
            </Button>
          )}
          <Button size='medium' variant='outlined' color='secondary' onClick={props?.onCancel}>
            {props?.cancel}
          </Button>
        </div>
      </Grid>
    )
  }

  if ('approve-reject' === props.type) {
    return (
      <Grid size={12} key={index}>
        <div className='demo-space-x'>
          {props.print ? (
            <>
              <Button
                size='medium'
                type='button'
                variant='contained'
                onClick={props.onApprove}
                disabled={props.disabled}
                color='success'
                startIcon={<i className='material-symbols-check' />}
              >
                Approve
              </Button>
              <Button
                size='medium'
                type='button'
                variant='contained'
                onClick={props.onReject}
                disabled={props.disabled}
                color='error'
                startIcon={<i className='material-symbols-check' />}
              >
                Unapprove
              </Button>
            </>
          ) : (
            <Button size='medium' type='button' variant='contained' onClick={props.onClick} disabled={props.disabled}>
              {props?.loading ? (
                <CircularProgress
                  sx={{
                    color: 'common.white',
                    width: '18px !important',
                    height: '18px !important',
                    mr: theme => theme.spacing(2)
                  }}
                />
              ) : null}
              {props?.submit}
            </Button>
          )}
          <Button size='medium' variant='outlined' color='secondary' onClick={props?.onCancel}>
            {props?.cancel}
          </Button>
        </div>
      </Grid>
    )
  }

  if ('check' === props.type) {
    return (
      <Grid size={12} key={index}>
        <div className='demo-space-x'>
          {props.print ? (
            <>
              <Button
                size='medium'
                type='button'
                variant='contained'
                onClick={props.onApprove}
                disabled={props.disabled}
                color='success'
                startIcon={<i className='material-symbols-check' />}
              >
                Check
              </Button>
            </>
          ) : (
            <Button size='medium' type='button' variant='contained' onClick={props.onClick} disabled={props.disabled}>
              {props?.loading ? (
                <CircularProgress
                  sx={{
                    color: 'common.white',
                    width: '18px !important',
                    height: '18px !important',
                    mr: theme => theme.spacing(2)
                  }}
                />
              ) : null}
              {props?.submit}
            </Button>
          )}
          <Button size='medium' variant='outlined' color='secondary' onClick={props?.onCancel}>
            {props?.cancel}
          </Button>
        </div>
      </Grid>
    )
  }

  if ('paid-unpaid' === props.type) {
    return (
      <Grid size={12} key={index}>
        <div className='demo-space-x'>
          {props.print ? (
            <>
              <Button
                size='medium'
                type='button'
                variant='contained'
                onClick={props.onApprove}
                disabled={props.disabled}
                color='success'
                startIcon={<i className='material-symbols-check' />}
              >
                Paid
              </Button>
              <Button
                size='medium'
                type='button'
                variant='contained'
                onClick={props.onReject}
                disabled={props.disabled}
                color='error'
                startIcon={<i className='material-symbols-check' />}
              >
                Unpaid
              </Button>
            </>
          ) : (
            <Button size='medium' type='button' variant='contained' onClick={props.onClick} disabled={props.disabled}>
              {props?.loading ? (
                <CircularProgress
                  sx={{
                    color: 'common.white',
                    width: '18px !important',
                    height: '18px !important',
                    mr: theme => theme.spacing(2)
                  }}
                />
              ) : null}
              {props?.submit}
            </Button>
          )}
          <Button size='medium' variant='outlined' color='secondary' onClick={props?.onCancel}>
            {props?.cancel}
          </Button>
        </div>
      </Grid>
    )
  }

  if ('submit-cancel' === props.type) {
    return (
      <div className='col-md-6 mt-2' key={index}>
        <div className='form-group row'>
          <div className='col-sm-3' />
          <div className='col-sm-9'>
            <button type='submit' className='btn btn-success mr-2'>
              {props?.label}
            </button>
            <button type='cancel' className='btn mr-2' onClick={props?.clearForm}>
              {props?.cancel}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if ('text' === props.type) {
    return (
      <Grid size={{ xs: 12, sm: 6 }} key={index}>
        <FormControl fullWidth size='small'>
          {textField(form)}
        </FormControl>
      </Grid>
    )
  }

  if ('password' === props.type) {
    return (
      <Grid size={{ xs: 12, sm: 6 }} key={index}>
        <FormControl fullWidth size='small'>
          {textField(form)}
        </FormControl>
      </Grid>
    )
  }

  if ('checkbox' === props.type) {
    return (
      <Grid size={{ xs: 12, sm: 6 }} key={index}>
        <FormControl fullWidth size='small'>
          {checkboxField(form)}
        </FormControl>
      </Grid>
    )
  }

  if ('numeral' === props.type) {
    return (
      <Grid size={{ xs: 12, sm: 6 }} key={index}>
        <FormControl fullWidth size='small'>
          {numeralField(form)}
        </FormControl>
      </Grid>
    )
  }

  if ('textarea' === props.type) {
    return (
      <Grid size={{ xs: 12, sm: 6 }} key={index}>
        <FormControl fullWidth size='small'>
          {textareaField(form)}
        </FormControl>
      </Grid>
    )
  }

  if ('select' === props.type) {
    return (
      <Grid size={{ xs: 12, sm: 6 }} key={index}>
        <FormControl fullWidth size='small'>
          {selectField(form)}
        </FormControl>
      </Grid>
    )
  }

  if ('select-multi' === props.type) {
    return (
      <Grid size={{ xs: 12, sm: 6 }} key={index}>
        <FormControl fullWidth size='small'>
          {selectMultiField(form)}
        </FormControl>
      </Grid>
    )
  }

  if ('date' === props.type) {
    return (
      <Grid size={{ xs: 12, sm: props?.options?.grid | 6 }} key={index}>
        <FormControl fullWidth size='small'>
          {selectDate(form)}
        </FormControl>
      </Grid>
    )
  }

  if ('date_custom' === props.type) {
    return (
      <Grid size={{ xs: 12, sm: props?.options?.grid | 6 }} key={index}>
        <FormControl fullWidth size='small'>
          <SelectDateCustomComponent form={form} />
        </FormControl>
      </Grid>
    )
  }

  if ('time' === props.type) {
    return (
      <Grid size={{ xs: 12, sm: props?.options?.grid | 6 }} key={index}>
        <FormControl fullWidth size='small'>
          {selectTime(form)}
        </FormControl>
      </Grid>
    )
  }

  if ('separator' === props.type) {
    return (
      <Grid size={{ xs: 12, sm: 12 }} key={index}>
        <Grid size={12}>
          <Divider sx={{ mb: '0 !important' }} />
        </Grid>
        <Grid size={12} mt={3} mb={3}>
          <Typography variant='body2' sx={{ fontWeight: 600 }}>
            {props.label}
          </Typography>
        </Grid>
      </Grid>
    )
  }

  if ('space' === props.type) {
    return <Grid size={{ xs: 12, sm: 6 }} key={index} />
  }

  if ('image' === props.type) {
    let session = form.session

    const { key, base64 } = props

    const defaultImage = `https://placehold.co/300x300?font=roboto&text=${props.placeholder}`

    let valueImage = ''

    if (base64) {
      valueImage = session.state[key] ? session.state[key] : ''
    } else {
      valueImage = session.state[key]
        ? session.state[key].includes(props.urlImage)
          ? process.env.NEXT_PUBLIC_API_URL + session.state[key]
          : process.env.NEXT_PUBLIC_API_URL + props.urlImage + session.state[key]
        : ''
    }

    const imageData = { value: 'img', img: valueImage ? valueImage : defaultImage }

    const selected = 'img'

    return (
      <Grid size={{ xs: 12, sm: 6 }} key={index}>
        <FormHelperText id='validation-basic-last-name'>{props.label}</FormHelperText>
        <InputImage
          className='mt-2'
          key={index}
          data={imageData}
          selected={selected}
          name='custom-checkbox-img'
          handleChange={image => {
            let store = { ...session.state }

            store[props.key] = image
            session.setState(store)
          }}
          gridProps={{ sm: 4, md: 2, xs: 12 }}
          ref={props.ref}
        />
      </Grid>
    )
  }

  if ('file' === props.type) {
    let session = form.session

    const { key } = props

    const valueFile = session.state[key] ? session.state[key] : ''

    return (
      <Grid size={{ xs: 12, sm: 6 }} key={index}>
        <FormHelperText id='validation-basic-last-name'>{props.label}</FormHelperText>
        <InputFile
          key={index}
          handleChange={file => {
            if (typeof props?.options?.onChange === 'function') {
              props?.options?.onChange(file)
            }
          }}
          handleClear={() => {
            updateValueText(session, props, { target: { value: '' } })
          }}
          gridProps={{ sm: 4, md: 2, xs: 12 }}
          selected={valueFile}
          url={props?.urlImage}
          accept={props?.accept}
          helperText={props?.helperText}
          previewTitle={props?.label}
          readOnly={props?.readOnly}
        />
      </Grid>
    )
  }

  if ('map' === props.type) {
    let session = form.session

    const { key } = props

    const valueMap = session.state[key] ? session.state[key] : ''

    return (
      <Grid size={{ xs: 12, sm: 6 }} key={index}>
        <FormHelperText id='validation-basic-last-name'>{props.label}</FormHelperText>
        <MapGoogle
          key={index}
          selected={valueMap}
          gridProps={{ sm: 4, md: 2, xs: 12 }}
          handleChange={data => {
            if (typeof props?.options?.onChange === 'function') {
              props?.options?.onChange(data)
            }
          }}
        ></MapGoogle>
      </Grid>
    )
  }

  if ('editor' === props.type) {
    return (
      <Grid size={{ xs: 12, sm: 12 }} key={index}>
        <FormControl fullWidth size='small'>
          {TextFieldEditor(form)}
        </FormControl>
      </Grid>
    )
  }

  if ('icon-picker' === props.type) {
    const session = form.session
    const value = session.state[props.key] || ''

    return (
      <Grid size={{ xs: 12, sm: 6 }} key={index}>
        <FormControl fullWidth size='small'>
          <TextField
            size='small'
            label={props.label}
            value={value}
            placeholder={props.placeholder}
            InputProps={{
              readOnly: true,
              startAdornment: value ? (
                <InputAdornment position='start'>
                  <i className={value} />
                </InputAdornment>
              ) : null,
              endAdornment: (
                <InputAdornment position='end'>
                  <Button size='small' variant='outlined' onClick={props.options?.onClick}>
                    Pilih
                  </Button>
                </InputAdornment>
              )
            }}
          />
        </FormControl>
      </Grid>
    )
  }

  if ('custom' === props.type) {
    return (
      <Grid size={{ xs: 12 }} key={index}>
        {typeof props.render === 'function' ? props.render() : null}
      </Grid>
    )
  }
}

const formColumnDetailSingleField = form => {
  const { props } = form

  if (undefined === props || null === props) return

  if ('text' === props.type) {
    return <>{textField(form)}</>
  }

  if ('password' === props.type) {
    return <>{textField(form)}</>
  }

  if ('numeral' === props.type) {
    return <>{numeralField(form)}</>
  }

  if ('textarea' === props.type) {
    return <>{textareaField(form)}</>
  }

  if ('select' === props.type) {
    return <>{selectField(form)}</>
  }

  if ('select-multi' === props.type) {
    return <>{selectMultiField(form)}</>
  }

  if ('date' === props.type) {
    return <>{selectDate(form)}</>
  }

  if ('time' === props.type) {
    return <>{selectTime(form)}</>
  }

  if ('checkbox' === props.type) {
    return <>{checkboxField(form)}</>
  }

  if ('radio' === props.type) {
    return <>{radioField(form)}</>
  }

  if ('button' === props.type) {
    return <>{buttonField(form)}</>
  }

  if ('image' === props.type) {
    let session = form.session

    const { key } = props

    const defaultImage = `https://placehold.co/300x300?font=roboto&text=${props.placeholder}`

    const valueImage = session.state[key] ? process.env.NEXT_PUBLIC_API_URL + props.urlImage + session.state[key] : ''

    const imageData = { value: 'img', img: valueImage ? valueImage : defaultImage }

    const selected = 'img'

    return (
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormHelperText id='validation-basic-last-name'>{props.label}</FormHelperText>
        <InputImage
          data={imageData}
          selected={selected}
          name='custom-checkbox-img'
          handleChange={image => {
            let store = { ...session.state }

            store[props.key] = image
            session.setState(store)
          }}
          gridProps={{ sm: 4, md: 2, xs: 12 }}
          ref={props.ref}
        />
      </Grid>
    )
  }

  if ('custom' === props.type) {
    return (
      <Grid size={{ xs: 12 }} key={index}>
        {typeof props.render === 'function' ? props.render() : null}
      </Grid>
    )
  }
}

export function error(state, key) {
  if (!key) return
  let errorMessage = state[key + '_error']

  if (!errorMessage) return

  return (
    <label data-test='error' style={{ color: 'red', fontSize: 10, marginTop: 10 }}>
      {errorMessage}
    </label>
  )
}

const textField = form => {
  const { control, errors, session, props } = form

  return (
    <Controller
      control={control}
      name={props.key}
      rules={{
        validate: value => {
          if (props.required && !value) {
            return `${props.label} wajib diisi`
          }

          return true
        }
      }}
      render={({ field: { value, onChange } }) => {
        const valueText = (props?.options?.converter ? props.options.converter(value) : value) ?? ''

        return (
          <TextField
            type={props.type}
            size='small'
            value={valueText}
            label={
              <Box component='span' sx={{ display: 'inline-flex', alignItems: 'center' }}>
                {props.required ? (
                  <span>
                    {props.label} <span style={{ color: '#ea5455' }}>*</span>
                  </span>
                ) : (
                  props.label
                )}
                {props.tooltip && (
                  <Tooltip title={props.tooltip} placement='top' arrow>
                    <Box component='span' sx={{ display: 'inline-flex', ml: 1, cursor: 'help' }}>
                      <i
                        className='tabler-info-circle'
                        style={{ fontSize: '1.1rem', color: 'var(--mui-palette-text-secondary)' }}
                      />
                    </Box>
                  </Tooltip>
                )}
              </Box>
            }
            placeholder={props.placeholder}
            error={Boolean(errors[props.key])}
            aria-describedby='validation-basic-first-name'
            onChange={e => {
              if (props.readOnly) return
              onChange(e) // trigger for default value useForm

              if (props?.options?.is_number) {
                updateValueNumber(session, props, e)
              } else {
                updateValueText(session, props, e)
              }

              if (typeof props?.options?.onChange === 'function') {
                props?.options?.onChange(e.target.value)
              }
            }}
            onClick={props?.options?.onClick}
            autoFocus={props.autoFocus}
            {...(errors[props.key] && { helperText: errors[props.key].message })}
            slotProps={{
              input: {
                inputRef: props.ref,
                inputProps: {
                  readOnly: props.readOnly
                },
                startAdornment: props.startAdornment ? (
                  <InputAdornment position='start'>{props.startAdornment}</InputAdornment>
                ) : null,
                endAdornment: props.endAdornment ? (
                  <InputAdornment position='end'>{props.endAdornment}</InputAdornment>
                ) : null,
                className: props.readOnly ? 'Mui-disabled' : ''
              },

              inputLabel: {
                shrink: true,
                readOnly: props.readOnly
              }
            }}
          />
        )
      }}
    />
  )
}

const checkboxField = form => {
  const { control, errors, session, props } = form
  const valueTmp = session.state[props.key]

  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={valueTmp}
          onChange={e => {
            let val = {
              target: {
                value: true
              }
            }

            if (valueTmp) {
              val.target.value = false
            }

            updateValueText(session, props, val)

            if (typeof props?.options?.onChange === 'function') {
              props?.options?.onChange(val.target.value)
            }
          }}
          disabled={props.readOnly}
        />
      }
      label={props.label}
    />
  )
}

const radioField = form => {
  const { control, errors, session, props } = form
  const valueTmp = session.state[props.key]

  return (
    <FormControlLabel
      control={
        <Radio
          checked={valueTmp || props.checked}
          onChange={e => {
            let val = {
              target: {
                value: true
              }
            }

            if (valueTmp) {
              val.target.value = false
            }

            updateValueText(session, props, val)

            if (typeof props?.options?.onChange === 'function') {
              props?.options?.onChange(val.target.value)
            }
          }}
          disabled={props.readOnly}
        />
      }
      label={props.label}
    />
  )
}

const numeralField = form => {
  const { control, errors, session, props } = form

  return (
    <Controller
      control={control}
      name={props.key}
      rules={{
        validate: value => {
          if (props.required && !value) {
            return `${props.label} wajib diisi`
          }

          return true
        }
      }}
      render={({ field: { value, onChange } }) => {
        const valueText = (props?.options?.converter ? props.options.converter(value) : value) ?? ''

        return (
          <TextField
            size='small'
            value={valueText}
            label={props.label}
            placeholder={props.placeholder}
            error={Boolean(errors[props.key])}
            helperText={errors[props.key]?.message}
            aria-describedby='validation-basic-first-name'
            onChange={e => {
              onChange(e) // trigger for default value useForm
              updateValueMaskingThousand(session, props, e)

              if (typeof props?.options?.onChange === 'function') {
                props?.options?.onChange(e.target.value)
              }
            }}
            autoFocus={props.autoFocus}
            slotProps={{
              input: {
                inputComponent: MaskedTextField,
                inputProps: {
                  inputRef: props.ref,
                  options: {
                    numeral: true,
                    numeralThousandsGroupStyle: 'thousand'
                  },
                  readOnly: props.readOnly
                },
                startAdornment: props.startAdornment ? (
                  <InputAdornment position='start'>{props.startAdornment}</InputAdornment>
                ) : null,
                endAdornment: props.endAdornment ? (
                  <InputAdornment position='end'>{props.endAdornment}</InputAdornment>
                ) : null,
                className: props.readOnly ? 'Mui-disabled' : ''
              },

              inputLabel: {
                shrink: true
              }
            }}
          />
        )
      }}
    />
  )
}

export function editorStateHtml(text) {
  if (undefined === text || null === text) text = ''

  const blocksFromHTML = convertFromHTML(text)

  return EditorState.createWithContent(
    ContentState.createFromBlockArray(blocksFromHTML.contentBlocks, blocksFromHTML.entityMap)
  )
}

// Toolbar Component
const EditorToolbar = ({ editor }) => {
  if (!editor) return null

  const getColor = active => (active ? 'primary' : 'default')

  return (
    <div className='flex flex-wrap gap-2 p-3'>
      <Tooltip title='Bold'>
        <IconButton
          type='button'
          color={getColor(editor.isActive('bold'))}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <i className='tabler-bold' />
        </IconButton>
      </Tooltip>

      <Tooltip title='Underline'>
        <IconButton
          type='button'
          color={getColor(editor.isActive('underline'))}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <i className='tabler-underline' />
        </IconButton>
      </Tooltip>

      <Tooltip title='Italic'>
        <IconButton
          type='button'
          color={getColor(editor.isActive('italic'))}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <i className='tabler-italic' />
        </IconButton>
      </Tooltip>

      <Tooltip title='Strikethrough'>
        <IconButton
          type='button'
          color={getColor(editor.isActive('strike'))}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <i className='tabler-strikethrough' />
        </IconButton>
      </Tooltip>

      {/* Alignment */}
      <Tooltip title='Align Left'>
        <IconButton
          type='button'
          color={getColor(editor.isActive({ textAlign: 'left' }))}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          <i className='tabler-align-left' />
        </IconButton>
      </Tooltip>

      <Tooltip title='Align Center'>
        <IconButton
          type='button'
          color={getColor(editor.isActive({ textAlign: 'center' }))}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          <i className='tabler-align-center' />
        </IconButton>
      </Tooltip>

      <Tooltip title='Align Right'>
        <IconButton
          type='button'
          color={getColor(editor.isActive({ textAlign: 'right' }))}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          <i className='tabler-align-right' />
        </IconButton>
      </Tooltip>

      <Tooltip title='Justify'>
        <IconButton
          type='button'
          color={getColor(editor.isActive({ textAlign: 'justify' }))}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        >
          <i className='tabler-align-justified' />
        </IconButton>
      </Tooltip>
    </div>
  )
}

const TextFieldEditor = form => {
  const { session, props } = form
  const { key, label, options } = props

  // Editor instance
  const editor = useEditor({
    extensions: [
      StarterKit.configure(),
      Underline,
      Placeholder.configure({
        placeholder: 'Write something here...'
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      })
    ],
    content: options?.default || '',
    onUpdate({ editor }) {
      const html = editor.getHTML()

      let store = { ...session.state }

      store[key] = html
      session.setState(store)
    }
  })

  // If incoming value changes → update editor
  useEffect(() => {
    if (editor && session.state[key] !== undefined) {
      editor.commands.setContent(session.state[key])
    }
  }, [editor, key, session.state])

  return (
    <>
      <FormHelperText>{label}</FormHelperText>

      <div className='border rounded-md mt-2'>
        <EditorToolbar editor={editor} />

        <div className='border-t p-3'>
          <div className='min-h-[180px]'>
            <EditorContent editor={editor} className='min-h-[180px] w-full focus:outline-none' />
          </div>
        </div>
      </div>
    </>
  )
}

export function textFieldHidden(state, key) {
  let valueTmp = state.state[key]

  if (!valueTmp) {
    valueTmp = ''
  }

  return <input type='hidden' className='form-control' value={valueTmp} />
}

// https://codesandbox.io/s/react-hook-form-v7-controller-forked-7cns76?file=/src/MuiAutoComplete.js:657-668
const selectField = form => {
  const { control, errors, session, props } = form

  if (undefined === props.options || null === props.options) {
    props.options = {}
  }

  if (undefined === props.options.values || null === props.options.values) {
    props.options.values = []
  }

  const valueTmp = session.state[props.key]

  let selected = valueTmp ? props.options.values.find(e => e.value === valueTmp) : { label: '', value: null }

  return (
    <Controller
      control={control}
      name={props.key}
      value={selected}
      defaultValue={null}
      rules={{
        validate: value => {
          if (props.required && !value) {
            return `${props.label} wajib diisi`
          }

          return true
        }
      }}
      render={({ field: { value, onChange } }) => {
        return (
          <Autocomplete
            size='small'
            autoHighlight
            value={value ?? null}
            defaultValue={null}
            getOptionLabel={option => {
              return option.label || ''
            }}
            isOptionEqualToValue={(option, val) => {
              return option.value === val.value
            }}
            onChange={(event, newValue) => {
              onChange(newValue) // Update the Controller's value
              updateValueSelect(session, props, newValue)

              if (typeof props?.onChange === 'function') {
                props?.onChange(newValue)
              }

              if (typeof props?.options?.onChange === 'function') {
                props?.options?.onChange(newValue)
              }
            }}
            options={props.options.values}
            renderInput={params => (
              <TextField
                {...params}
                label={
                  props.required ? (
                    <span>
                      {props.label} <span style={{ color: '#ea5455' }}>*</span>
                    </span>
                  ) : (
                    props.label
                  )
                }
                error={Boolean(errors[props.key])}
                helperText={errors[props.key]?.message}
                placeholder={props.placeholder}
                slotProps={{
                  inputRef: props.ref,
                  htmlInput: {
                    ...params.inputProps,
                    autoComplete: 'new-password'
                  },

                  inputLabel: {
                    shrink: true
                  }
                }}
              />
            )}
            renderOption={(props, option) => {
              const { key, ...optionProps } = props

              return (
                <Box
                  key={key}
                  component='li'
                  {...optionProps}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    whiteSpace: 'normal', // ✅ allow wrapping
                    wordBreak: 'break-word', // ✅ break long words if needed
                    lineHeight: 1.4 // nicer spacing for wrapped text
                  }}
                >
                  {option.icon && (
                    <i className={option.icon} style={{ marginRight: 8, flexShrink: 0, width: 24, height: 24 }} />
                  )}
                  <Box component='span' sx={{ flex: 1 }}>
                    {option.html ? option.htmlLabel : option.label}
                  </Box>
                </Box>
              )
            }}
            disabled={props.readOnly}
          />
        )
      }}
    />
  )
}

const selectMultiField = form => {
  const { control, errors, session, props } = form

  if (undefined === props.options || null === props.options) {
    props.options = {}
  }

  if (undefined === props.options.values || null === props.options.values) {
    props.options.values = []
  }

  let selected = session.state[props.key]

  return (
    <Controller
      control={control}
      name={props.key}
      value={selected ?? []}
      defaultValue={[]}
      rules={{
        validate: value => {
          if (props.required && !value) {
            return `${props.label} wajib diisi`
          }

          return true
        }
      }}
      render={({ field: { value, onChange } }) => {
        return (
          <Autocomplete
            size='small'
            multiple
            autoHighlight
            filterSelectedOptions
            value={value ?? []}
            defaultValue={[]}
            getOptionLabel={option => {
              return option.label || ''
            }}
            isOptionEqualToValue={(option, val) => {
              return option.value === val.value
            }}
            onChange={(event, newValue) => {
              onChange(newValue) // Update the Controller's value
              updateValueSelectMulti(session, props, newValue)

              if (typeof props?.options?.onChange === 'function') {
                props?.options?.onChange(newValue)
              }
            }}
            options={props.options.values}
            renderInput={params => (
              <TextField
                {...params}
                label={
                  props.required ? (
                    <span>
                      {props.label} <span style={{ color: '#ea5455' }}>*</span>
                    </span>
                  ) : (
                    props.label
                  )
                }
                error={Boolean(errors[props.key])}
                helperText={errors[props.key]?.message}
                placeholder={props.placeholder}
                slotProps={{
                  htmlInput: {
                    ...params.inputProps,
                    autoComplete: 'new-password' // disable autocomplete and autofill
                  },

                  inputLabel: {
                    shrink: true
                  }
                }}
              />
            )}
          />
        )
      }}
    />
  )
}

const selectDate = form => {
  const { control, errors, session, props } = form

  const popperPlacement = 'bottom-start'

  // Mengambil value langsung dari state session builder
  const valueTmp = session.state[props.key]

  // Pastikan default value berupa objek Date asli atau null, bukan wrapper object agar dibaca pas oleh DatePicker
  const initialDate = valueTmp ? new Date(valueTmp) : null

  return (
    <Controller
      control={control}
      name={props.key}
      defaultValue={initialDate}
      rules={{
        validate: value => {
          // Jika required dan value kosong (null/undefined)
          if (props.required && !value) {
            return `${props.label} wajib diisi`
          }

          // Validasi tambahan jika tipenya objek Date malformat/invalid
          if (value && isNaN(new Date(value).getTime())) {
            return `${props.label} format tanggal tidak valid`
          }

          return true
        }
      }}
      render={({ field: { value, onChange } }) => {
        // Konversi string ke objek Date jika react-hook-form menyimpan dalam bentuk string ISO/Text
        const dateValue = value ? new Date(value) : null

        return (
          <AppReactDatepicker
            selected={dateValue}
            id='basic-input'
            popperPlacement={popperPlacement}
            onChange={date => {
              onChange(date)
              updateValueDate(session, props, date)

              if (typeof props?.options?.onChange === 'function') {
                props?.options?.onChange(date)
              }
            }}
            dateFormat={'dd/MM/yyyy'}
            placeholderText={props.placeholder || 'Click to select a date'}
            disabled={props.readOnly}
            portalId={props.portalId}
            minDate={props.minDate}
            customInput={
              <TextField
                fullWidth
                size='small'
                error={Boolean(errors[props.key])}
                helperText={errors[props.key]?.message}
                label={
                  props.required ? (
                    <span>
                      {props.label} <span style={{ color: '#ea5455' }}>*</span>
                    </span>
                  ) : (
                    props.label
                  )
                }
                slotProps={{
                  input: {
                    inputRef: props.ref,
                    inputProps: {
                      readOnly: props.readOnly
                    }
                  },

                  inputLabel: {
                    shrink: true,
                    readOnly: props.readOnly
                  }
                }}
              />
            }
          />
        )
      }}
    />
  )
}

const SelectDateCustomComponent = ({ form }) => {
  const { control, errors, session, props } = form

  const currentYear = new Date().getFullYear()
  const minDate = props.minDate || new Date(currentYear - 100, 0, 1)
  const maxDate = props.maxDate || new Date(currentYear + 20, 11, 31)

  return (
    <Controller
      name={props.key}
      control={control}
      rules={{
        validate: value => {
          if (props.required && !value) {
            return `${props.label} wajib diisi`
          }

          return true
        }
      }}
      render={({ field: { value, onChange } }) => {
        const currentValue = value || session.state[props.key] || null
        const dateValue = currentValue ? new Date(currentValue) : null

        return (
          <AppReactDatepicker
            selected={dateValue}
            id={`date-picker-${props.key}`}
            popperPlacement={props.popperPlacement || 'bottom-start'}
            onChange={date => {
              onChange(date)
              updateValueDate(session, props, date)

              if (typeof props?.options?.onChange === 'function') {
                props.options.onChange(date)
              }
            }}
            placeholderText={props.placeholder || 'Select Date'}
            disabled={props.readOnly}
            portalId={props.portalId}
            minDate={minDate}
            maxDate={maxDate}
            dateFormat={props.dateFormat || 'dd/MM/yyyy'}
            className='w-100'
            wrapperClassName='w-100'
            customInput={
              <CustomTextField
                fullWidth
                size='small'
                label={props.label}
                error={Boolean(errors[props.key])}
                {...(errors[props.key] && { helperText: errors[props.key].message })}
                InputProps={{
                  readOnly: true
                }}
              />
            }
          />
        )
      }}
    />
  )
}

const selectTime = form => {
  const { control, errors, session, props } = form

  return (
    <Controller
      name={props.key}
      control={control}
      rules={{
        validate: value => {
          if (props.required && !value) {
            return `${props.label} wajib diisi`
          }

          return true
        }
      }}
      render={({ field: { value, onChange } }) => (
        <AppReactDatepicker
          selected={value ? new Date(value) : null}
          onChange={e => {
            onChange(e)
            updateValueDate(session, props, e)

            if (typeof props?.options?.onChange === 'function') {
              props?.options?.onChange(e)
            }
          }}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={props.interval || 30}
          timeFormat='HH:mm'
          dateFormat='HH:mm'
          placeholderText={props.placeholder}
          disabled={props.readOnly}
          minTime={props.minTime}
          maxTime={props.maxTime}
          className='w-100'
          wrapperClassName='w-100'
          boxProps={{ sx: { width: '100%' } }}
          customInput={
            <TextField
              fullWidth
              size='small'
              label={props.label}
              error={Boolean(errors[props.key])}
              helperText={errors[props.key]?.message}
              slotProps={{
                input: {
                  inputRef: props.ref,
                  inputProps: {
                    readOnly: props.readOnly
                  }
                },

                inputLabel: {
                  shrink: true,
                  readOnly: props.readOnly
                }
              }}
            />
          }
        />
      )}
    />
  )
}

export function textareaField(form) {
  const { control, errors, session, props } = form

  return (
    <Controller
      control={control}
      name={props.key}
      rules={{
        validate: value => {
          if (props.required && !value) {
            return `${props.label} wajib diisi`
          }

          return true
        }
      }}
      render={({ field: { value, onChange } }) => {
        return (
          <TextField
            size='small'
            value={value ?? ''}
            rows={4}
            multiline
            label={
              props.required ? (
                <span>
                  {props.label} <span style={{ color: '#ea5455' }}>*</span>
                </span>
              ) : (
                props.label
              )
            }
            error={Boolean(errors[props.key])}
            helperText={errors[props.key]?.message}
            aria-describedby='validation-basic-textarea'
            onChange={e => {
              onChange(e) // trigger for default value useForm
              updateValueText(session, props, e)
            }}
            onClick={props?.options?.onClick}
            slotProps={{
              input: {
                inputRef: props.ref,
                inputProps: {
                  readOnly: props.readOnly
                }
              },

              inputLabel: {
                shrink: true
              }
            }}
          />
        )
      }}
    />
  )
}

export function textFieldFile(state, key, placeholder, ref) {
  return (
    <input
      type='file'
      className='form-control'
      ref={ref}
      placeholder={placeholder}
      onChange={e => {
        updateFile(e, state, key)
      }}
    />
  )
}

export function submitField(state, key, isNumber, placeholder, optValue) {
  return (
    <button type='submit' className='btn btn-success'>
      Simpan
    </button>
  )
}

export function buttonField(form) {
  const { control, errors, session, props } = form

  return (
    <Button
      size={'medium'}
      variant={props?.variant || 'outlined'}
      color={props?.color || 'primary'}
      onClick={props?.options?.onClick}
    >
      {props.label}
    </Button>
  )
}

export const formSingleColumn = param => {
  const { control, errors, state, setState, field } = param

  return formColumnDetailSingleField({
    control,
    errors: errors,
    session: { state, setState },
    props: field
  })
}
