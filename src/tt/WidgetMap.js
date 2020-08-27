import React from 'react'

import InputUi from './widgets/InputUi'

const WIDGET_MAP = {}


export function registerUiType(uiType, uiFun) {
  if (typeof uiType === 'object') {
    Object.entries(uiType).forEach(
      ([uiType, uiFun]) => (WIDGET_MAP[uiType] = uiFun)
    )
  } else {
    WIDGET_MAP[uiType] = uiFun
  }
  return WIDGET_MAP
}

export function resolveUiType(uiType) {
  return WIDGET_MAP[uiType]
}

export function renderWidget({ def, value, action, cx }) {
  const uiTypeFun = WIDGET_MAP[def.uiType]

  return typeof uiTypeFun === 'function' ? (
    <div>
      {React.createElement(uiTypeFun, { def, value, action, cx }, null)}
    </div>
  ) : (
    <div>
      <InputUi def={def} value={value} action={action} />
    </div>
  )
}
