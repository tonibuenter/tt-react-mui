import { label, resolveBoolean } from '../utils'
import React, { useEffect, useState } from 'react'

import 'date-fns'
import { TextField } from '@material-ui/core'

export default function InputUi(props) {
  // console.info('props ', JSON.stringify(props));
  const [value, setValue] = useState(props.value)
  const [editable, setEditable] = useState(true)
  useEffect(() => {
    setValue(props.value || '')
    setEditable(resolveBoolean(props.def, 'editable', props.cx, true))
  }, [props])
  try {
    return (
      <TextField
        label={label(props.def)}
        value={value}
        disabled={!editable}
        InputLabelProps={{ shrink: !!value }}
        onChange={change}
        required={resolveBoolean(props.def, 'mandatory', props.cx, false)}
        fullWidth={resolveBoolean(props.def, 'editable', props.cx, true)}
        multiline={!!props.def.multiline}
        type={props.def.inputType || 'text'}
      />
    )
  } catch (e) {
    return <div>Input UI : Error</div>
  }

  function change(event) {
    props.action('value', { [props.def.name]: event.target.value })
    setValue(event.target.value)
  }
}
