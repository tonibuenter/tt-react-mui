import React, { useEffect, useState } from 'react'
import Alert from '@material-ui/lab/Alert'

import { renderWidget } from '../WidgetMap'
import { ProgressUi, renderAction } from '../CommonUi'
import { label, toList } from '../utils'
import { processService } from '../api'

import ttStyles from '../TT.module.css'
import styles from './TopDetailUi.css'

export default function TopDetailUi(props) {
  const { ttdef, action } = props

  const [currentValue, setCurrentValue] = useState(props.value || {})
  const [exception, setException] = useState(null)
  const [actionRunning, setActionRunning] = useState(null)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setCurrentValue(props.value || {})
  }, [props.version])

  const toolbarActions = ttdef.actions.filter(
    (action) => action.source === 'toolbar'
  )
  const detailActions = ttdef.actions.filter(
    (action) => action.source !== 'toolbar'
  )

  return (
    <div className={styles.topDetailUi}>
      {exception ? (
        <Alert severity='error' onClose={() => action('close', {})}>
          {exception}
        </Alert>
      ) : actionRunning ? (
        <ProgressUi message={`Action processing ${actionRunning.name}`} />
      ) : (
        <div>
          <div className={styles.vToolbar}>
            <div>
              {
                // <div>{JSON.stringify(currentValue || '-now value-')}</div>
              }
              {label(ttdef, currentValue)}
            </div>

            <div className={ttStyles.horizontalCenter}>
              {toolbarActions.map((actionDef, index) =>
                renderAction({
                  actionDef,
                  index,
                  action: processAction,
                  value: currentValue
                })
              )}
            </div>
          </div>
          <div>{dirty ? 'dirty ' + dirty : ''}</div>
          <div>
            {ttdef.attributes.map((attDef, index) =>
              renderAttribute(attDef, index)
            )}
          </div>
          <div>
            {detailActions.map((actionDef, index) =>
              renderAction({
                actionDef,
                index,
                action: processAction,
                value: currentValue
              })
            )}
          </div>
        </div>
      )}
    </div>
  )

  function renderAttribute(attDef, index) {
    return (
      <div key={index} className={styles.attributeRow}>
        {renderWidget({
          def: attDef,
          value: currentValue[attDef.name],
          cx: { row: currentValue, ttdef },
          action: widgetAction
        })}
      </div>
    )
  }

  function processAction(actionDef) {
    if (!actionDef) {
      return
    }

    const parameters = { ...actionDef.parameters, ...currentValue }
    const newAction = { ...actionDef, parameters }
    setActionRunning(newAction)
    processService(newAction, processResult)

    function processResult(data) {
      setActionRunning(null)
      if (data && data.exception) {
        setException(data.exception)
        return
      }
      const row = toList(data)[0]
      const value = { ...currentValue, ...row }
      if (actionDef.type === 'close' || actionDef.type === 'cancel') {
        action(actionDef.type, { action: actionDef, value, data })
        return
      }
      if (actionDef.forward) {
        action('forward', { action: actionDef, value, data })
        return
      }
      if (actionDef.type === 'update') {
        action('refresh', { action: actionDef, value, data })
      }
    }
  }

  function widgetAction(cmd, value) {
    switch (cmd) {
      case 'value': {
        const newValue = { ...currentValue, ...value }
        setCurrentValue(newValue)
        setDirty(true)
        break
      }
      case 'dirty': {
        setDirty(true)
        break
      }
      default:
        setCurrentValue(currentValue)
    }
  }
}
