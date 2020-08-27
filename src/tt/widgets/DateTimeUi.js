import { label, resolveBoolean } from '../utils'
import React, { useEffect, useState } from 'react'
import moment from 'moment'

import 'date-fns'
import DateFnsUtils from '@date-io/date-fns'
import {
  KeyboardDateTimePicker,
  MuiPickersUtilsProvider
} from '@material-ui/pickers'

export default function CalendarUi(props) {
  // The first commit of Material-UI
  const [value, _setValue] = useState()
  const [editable, setEditable] = useState(true)

  function setValue(v) {
    _setValue(v)
  }

  const change = (date) => {
    props.action('value', {
      [props.def.name]: moment(date).format('YYYY-MM-DD HH:mm')
    })
    setValue(date)
  }

  useEffect(() => {
    setValue(moment(props.value).valueOf())
    setEditable(resolveBoolean(props.def, 'editable', props.cx, true))
  }, [props])

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDateTimePicker
        disableToolbar
        variant='inline'
        format='yyyy-MM-dd  - HH:mm'
        margin='normal'
        id='date-time-picker-inline'
        label={label(props.def)}
        value={value}
        required={resolveBoolean(props.def, 'mandatory', props.cx, false)}
        onChange={change}
        fullWidth={resolveBoolean(props.def, 'editable', props.cx, true)}
        KeyboardButtonProps={{
          'aria-label': 'change date'
        }}
      />
    </MuiPickersUtilsProvider>
  )
}
