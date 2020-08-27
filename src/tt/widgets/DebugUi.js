import React, { useEffect, useState } from 'react'

import 'date-fns'

export default function DebugUi(props) {
  const [value, setValue] = useState()

  useEffect(() => {
    setValue(props.cx)
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
}
