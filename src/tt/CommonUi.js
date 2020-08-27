import React, { useEffect, useState } from 'react'

import Typography from '@material-ui/core/Typography'
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import Link from '@material-ui/core/Link'

import LinearProgress from '@material-ui/core/LinearProgress'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'

import { Button, Icon } from '@material-ui/core'
import { label } from './utils'

import ttStyles from './TT.module.css'

export { BreadcrumbsUi, DebugUi, ExceptionUi, ProgressUi, Toast, renderAction }

function BreadcrumbsUi({ breadcrumbs, action }) {
  return (
    <Breadcrumbs aria-label='breadcrumb'>
      {breadcrumbs.map((bc, index) =>
        index < breadcrumbs.length - 1 ? (
          <Link
            className={ttStyles.ttLink}
            color='inherit'
            key={index}
            href='#'
            onClick={() => action(index, 'breadcrumb')}
          >
            {' '}
            {bc.label || bc.name}
          </Link>
        ) : (
          <Typography key={index} color='textPrimary'>
            {bc.label || bc.name}
          </Typography>
        )
      )}
    </Breadcrumbs>
  )
}

function renderAction({ actionDef, index, value, action }) {
  let visible = true

  if (typeof actionDef.visible === 'function') {
    visible = actionDef.visible({ value })
  }

  if (!visible) {
    return ''
  }

  return actionDef.icon ? (
    <Icon
      className={ttStyles.ttIcon}
      href='#'
      key={index}
      onClick={() => action(actionDef)}
    >
      {actionDef.icon}
    </Icon>
  ) : (
    <Button
      className={ttStyles.ttButton}
      href='#'
      key={index}
      onClick={() => action(actionDef)}
    >
      {label(actionDef)}
    </Button>
  )
}

function ExceptionUi({ message, onClose }) {
  return (
    <div>
      <div>{message}</div>
      <Button href='#' onClick={onClose}>
        close
      </Button>
    </div>
  )
}

function ProgressUi({ message, onClose }) {
  return (
    <div>
      <LinearProgress />
      <div>
        {message} &nbsp;{' '}
        {typeof onClose === 'function' ? (
          <Button href='#' onClick={onClose}>
            Close
          </Button>
        ) : (
          ''
        )}
      </div>
    </div>
  )
}

function DebugUi(props) {
  return (
    <div>
      {Object.entries(props).map(([key, value], index) => (
        <div key={index}>{`${key}=${value}`}</div>
      ))}
    </div>
  )
}

function Toast(props) {
  const [open, setOpen] = useState(false)
  // //
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  useEffect(() => {
    props.show ? setOpen(true) : setOpen(false)
  }, [props])

  return (
    <div>
      <Snackbar
        open={open}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        autoHideDuration={6000}
        onClose={handleClose}
        message={props.message}
        action={
          <React.Fragment>
            <Button color='secondary' size='small' onClick={handleClose}>
              UNDO
            </Button>
            <IconButton size='small' aria-label='close' color='inherit'>
              <Icon className={ttStyles.ttIcon} onClick={handleClose}>
                close
              </Icon>
            </IconButton>
          </React.Fragment>
        }
      />
    </div>
  )
}
