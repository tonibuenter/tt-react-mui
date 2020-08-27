import React, { useEffect, useState } from 'react'

import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'

import { Alert } from '@material-ui/lab'

import { label, toList } from '../utils'
import { processService } from '../api'
import { ProgressUi, renderAction } from '../CommonUi'
import styles from './TopListUi.css'
import ttStyles from '../TT.module.css'

export default function TopListUi(props) {
  const { ttdef, data, action, version } = props

  const [currentVersion, setCurrentVersion] = useState(-1)
  const [currentValue, setCurrentValue] = useState(props.value)
  const [currentData, setCurrentData] = useState(data)
  const [currentList, setCurrentList] = useState(null)
  const [exception, setException] = useState(null)

  const [actionRunning, setActionRunning] = useState(null)

  // const refreshAction = useMemo(() => ttdef.actions.filter(actionDef => actionDef.type === 'refresh')[0], [ttdef]);
  const refreshAction = ttdef.actions.filter(
    (actionDef) => actionDef.type === 'refresh'
  )[0]
  const toolbarActions = ttdef.actions.filter(
    (actionDef) => actionDef.source === 'toolbar'
  )
  const rowSelectAction = ttdef.actions.filter(
    (actionDef) => actionDef.source === 'rowSelect'
  )[0]

  useEffect(() => {
    if (currentVersion !== version) {
      setCurrentValue(props.value)
      processTopAction(refreshAction)
    }
    setCurrentVersion(version)
  }, [props])

  return (
    <div className={styles.TopListUi}>
      <div className={styles.toolbar}>
        <div>{label(ttdef, currentValue)}</div>

        <div className={ttStyles.horizontalCenter}>
          {toolbarActions.map((actionDef, index) =>
            renderAction({
              actionDef,
              index,
              action: processTopAction,
              value: currentValue
            })
          )}
        </div>
      </div>

      <div>
        {actionRunning ? (
          <ProgressUi message={`Action processing ${actionRunning.name}`} />
        ) : (
          ''
        )}
      </div>

      <div>
        {exception ? (
          <Alert severity='error' action={() => setException('')}>
            {exception}
          </Alert>
        ) : (
          <MuiTable />
        )}
      </div>
    </div>
  )

  function processTopAction(actionDef) {
    _processAction(actionDef, {})
  }

  function processRowAction(actionDef, row) {
    _processAction(actionDef, row)
  }

  function _processAction(actionDef, row) {
    if (!actionDef) {
      return
    }

    const value = { ...actionDef.parameters, ...currentValue, ...row }
    const newAction = { ...actionDef, value }
    setActionRunning(newAction)
    processService(newAction, processResult)

    function processResult(data) {
      setActionRunning(null)
      if (data && data.exception) {
        setException(data.exception)
        return
      }
      if (actionDef.type === 'refresh') {
        const list = toList(data)
        setCurrentData(data)
        setCurrentList(list)
        return
      }
      if (actionDef.type === 'close') {
        action('close', { action: actionDef, value, data })
        return
      }
      if (actionDef.type === 'cancel') {
        action('cancel', { action: actionDef, value, data })
        return
      }
      if (actionDef.forward) {
        action('forward', { action: actionDef, value, data })
        return
      }
      if (data.exception) {
        setException(data.exception)
        return
      }
      if (actionDef.type === 'update') {
        const row = toList(data)[0]
        if (row) {
          // setCurrentRow(row)
        }
      }
    }
  }

  function MuiTable() {
    let message = !currentData ? 'No Data' : ''
    message = !currentList && !message ? 'Empty List' : message
    return (
      <TableContainer component={Paper}>
        {message ? (
          <div>{message}</div>
        ) : (
          <Table className='list-ui' aria-label='simple table'>
            <TableHead>
              <TableRow>
                {ttdef.attributes.map((attr, index) => (
                  <TableCell key={index}>{label(attr)}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {currentList.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className='tt-row'
                  onClick={() => processRowAction(rowSelectAction, row)}
                >
                  {ttdef.attributes.map((attr, index) => (
                    <TableCell key={index}>{row[attr.name]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    )
  }
}
