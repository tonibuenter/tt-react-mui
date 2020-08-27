import React, { useEffect, useState } from 'react'

import 'date-fns'
import { processService } from '../api'
import { toList } from '../utils'

export default function SelectListUi(props) {
  const { cx, value } = props
  const [selectListTid, setSelectListTid] = useState(-1)
  const [, setSelectValues] = useState([])
  const [, setValues] = useState([])

  useEffect(() => {
    setSelectListTid(props.value)
    init()
  }, [props])

  return (
    <div>
      <h1>Debug Ui</h1>
      <h4>cx.row</h4>
      <div>{JSON.stringify(value ? value.row : '-no row-')}</div>

      <h4>cx.ttdef</h4>
      <div>{JSON.stringify(value ? value.ttdef : '-no ttdef-')}</div>
    </div>
  )

  function init() {
    processService(
      [
        {
          serviceId: props.def.valuesServiceId,
          parameters: {
            ...props.def.defaultParameters,
            ...cx.row,
            ...props.def.parameters,
            selectListTid
          }
        },
        {
          serviceId: props.def.valuesServiceId,
          parameters: {
            ...props.def.defaultParameters,
            ...cx.row,
            ...props.def.parameters,
            selectListTid
          }
        }
      ],
      (dataArray) => {
        setValues(toList(dataArray[0]))
        setSelectValues(toList(dataArray[1]))
      }
    )
  }
}
