import React, { useEffect, useState } from 'react'
import { Backdrop, Button, CircularProgress } from '@material-ui/core'
import { processService } from '../api'
import { toList } from '../utils'
import '../TT.module.css'

import Editor from 'react-simple-code-editor'

import Alert from '@material-ui/lab/Alert/Alert'
import { AgGridReact } from 'ag-grid-react/main'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'

import './CodeEditor.css'

const Prism = require('prismjs')
require('prismjs/components/prism-sql.min')

Prism.languages.rqsql = Prism.languages.extend('sql', {
  // CSS doesn't have a 'color' token, so this token will be appended
  colonVar: { pattern: /\B:\w*/, greedy: true },

  // 'operator': /\+/,

  keyword: /\b(?:ACTION|ADD|AFTER|ALGORITHM|ALL|ALTER|ANALYZE|ANY|APPLY|AS|ASC|AUTHORIZATION|AUTO_INCREMENT|BACKUP|BDB|BEGIN|BERKELEYDB|BIGINT|BINARY|BIT|BLOB|BOOL|BOOLEAN|BREAK|BROWSE|BTREE|BULK|BY|CALL|CASCADED?|CASE|CHAIN|CHAR(?:ACTER)?|CHECK(?:POINT)?|CLOSE|CLUSTERED|COALESCE|COLLATE|COLUMNS?|COMMENT|COMMIT(?:TED)?|COMPUTE|CONNECT|CONSISTENT|CONSTRAINT|CONTAINS(?:TABLE)?|CONTINUE|CONVERT|CREATE|CROSS|CURRENT(?:_DATE|_TIME|_TIMESTAMP|_USER)?|CURSOR|CYCLE|DATA(?:BASES?)?|DATE(?:TIME)?|DAY|DBCC|DEALLOCATE|DEC|DECIMAL|DECLARE|DEFAULT|DEFINER|DELAYED|DELETE|DELIMITERS?|DENY|DESC|DESCRIBE|DETERMINISTIC|DISABLE|DISCARD|DISK|DISTINCT|DISTINCTROW|DISTRIBUTED|DO|DOUBLE|DROP|DUMMY|DUMP(?:FILE)?|DUPLICATE|ELSE(?:IF)?|ENABLE|ENCLOSED|END|ENGINE|ENUM|ERRLVL|ERRORS|ESCAPED?|EXCEPT|EXEC(?:UTE)?|EXISTS|EXIT|EXPLAIN|EXTENDED|FETCH|FIELDS|FILE|FILLFACTOR|FIRST|FIXED|FLOAT|FOLLOWING|FOR(?: EACH ROW)?|FORCE|FOREIGN|FREETEXT(?:TABLE)?|FROM|FULL|FUNCTION|GEOMETRY(?:COLLECTION)?|GLOBAL|GOTO|GRANT|GROUP|HANDLER|HASH|HAVING|HOLDLOCK|HOUR|IDENTITY(?:_INSERT|COL)?|IF|IGNORE|IMPORT|INDEX|INFILE|INNER|INNODB|INOUT|INSERT|INT|INTEGER|INTERSECT|INTERVAL|INTO|INVOKER|ISOLATION|ITERATE|JOIN|KEYS?|KILL|LANGUAGE|LAST|LEAVE|LEFT|LEVEL|LIMIT|LINENO|LINES|LINESTRING|LOAD|LOCAL|LOCK|LONG(?:BLOB|TEXT)|LOOP|MATCH(?:ED)?|MEDIUM(?:BLOB|INT|TEXT)|MERGE|MIDDLEINT|MINUTE|MODE|MODIFIES|MODIFY|MONTH|MULTI(?:LINESTRING|POINT|POLYGON)|NATIONAL|NATURAL|NCHAR|NEXT|NO|NONCLUSTERED|NULLIF|NUMERIC|OFF?|OFFSETS?|ON|OPEN(?:DATASOURCE|QUERY|ROWSET)?|OPTIMIZE|OPTION(?:ALLY)?|ORDER|OUT(?:ER|FILE)?|OVER|PARTIAL|PARTITION|PERCENT|PIVOT|PLAN|POINT|POLYGON|PRECEDING|PRECISION|PREPARE|PREV|PRIMARY|PRINT|PRIVILEGES|PROC(?:EDURE)?|PUBLIC|PURGE|QUICK|RAISERROR|READS?|REAL|RECONFIGURE|REFERENCES|RELEASE|RENAME|REPEAT(?:ABLE)?|REPLACE|REPLICATION|REQUIRE|RESIGNAL|RESTORE|RESTRICT|RETURNS?|REVOKE|RIGHT|ROLLBACK|ROUTINE|ROW(?:COUNT|GUIDCOL|S)?|RTREE|RULE|SAVE(?:POINT)?|SCHEMA|SECOND|SELECT|SERIAL(?:IZABLE)?|SESSION(?:_USER)?|SHARE|SHOW|SHUTDOWN|SIMPLE|SMALLINT|SNAPSHOT|SOME|SONAME|SQL|START(?:ING)?|STATISTICS|STATUS|STRIPED|SYSTEM_USER|TABLES?|TABLESPACE|TEMP(?:ORARY|TABLE)?|TERMINATED|TEXT(?:SIZE)?|THEN|TIME(?:STAMP)?|TINY(?:BLOB|INT|TEXT)|TOP?|TRAN(?:SACTIONS?)?|TRIGGER|TRUNCATE|TSEQUAL|TYPES?|UNBOUNDED|UNCOMMITTED|UNDEFINED|UNION|UNIQUE|UNLOCK|UNPIVOT|UNSIGNED|UPDATE(?:TEXT)?|USAGE|USE|USER|USING|VALUES?|VAR(?:BINARY|CHAR|CHARACTER|YING)|VIEW|WAITFOR|WARNINGS|WHEN|WHERE|WHILE|WITH(?: ROLLUP|IN)?|WORK|WRITE(?:TEXT)?|YEAR)\b/i,

  rqCommand: {
    pattern: /\b(set\-if\-empty|set|create-tid|include|parameters|parameters-if-empty)\b/,
    greedy: true
  }
})

export function ServiceRunner(props) {
  const [value, setValue] = useState(props.value)
  const [loading, setLoading] = useState(false)
  const [resultData, setResultData] = useState(null)

  useEffect(() => {
    setValue(props.value || '')
    setResultData(null)
  }, [props])

  return loading ? (
    <Backdrop open={loading} onClick={() => alert('close')}>
      <CircularProgress color='inherit' />
    </Backdrop>
  ) : resultData ? (
    <div
      style={{
        height: '100%',
        display: 'grid',
        gridTemplateRows: '0fr 1fr'
      }}
    >
      {renderDetails()}
      {renderResult(false)}
    </div>
  ) : (
    renderDetails()
  )

  function renderDetails() {
    return (
      <div>
        <h1>{value.serviceId}</h1>
        <h4>Roles</h4>
        <div>{value.roles}</div>
        <h4>Statements</h4>

        <Editor
          value={value.statements}
          onValueChange={(code) => {
            setValue({ ...value, statements: code })
            // setResultData(null)
          }}
          highlight={(code) =>
            Prism.highlight(code, Prism.languages.rqsql, 'rqsql')
          }
          padding={10}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 12
          }}
        />
        <div className='ttButtonPanel'>
          <Button className='ttButton' href='#' onClick={runService}>
            Save & Run
          </Button>
          <Button className='ttButton' href='#' onClick={saveService}>
            Save Only
          </Button>
        </div>
      </div>
    )
  }

  function renderResult(standalone) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateRows: standalone ? '0fr 1fr' : '1fr',
          height: '100%'
        }}
      >
        {standalone ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 0fr' }}>
            <div style={{ padding: '1em', fontSize: '1.2em' }}>
              {'Result for ' + value.serviceId}
            </div>
            <div style={{ padding: '1em', whiteSpace: 'nowrap' }}>
              <Button href='#' onClick={() => setResultData(null)}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          ''
        )}

        {resultData.exception ? (
          <Alert severity='error'>{`Exception  ${resultData.exception}`}</Alert>
        ) : !resultData.table ? (
          <Alert severity='error'>{`Rows affected  ${JSON.stringify(
            resultData
          )}`}</Alert>
        ) : (
          <div
            className='ag-theme-material'
            style={{ height: '100%', width: '100%' }}
          >
            <AgGridTable data={resultData} />
          </div>
        )}
      </div>
    )

    function AgGridTable(props) {
      const gridOptions = createGridOptions(props.data.header)

      console.log('gridOptions: ' + JSON.stringify(gridOptions.columnDefs))

      return (
        <AgGridReact
          gridOptions={gridOptions}
          rowData={toList(props.data)}
          onRowClicked={(row) => {}}
        />
      )
    }
  }

  function runService() {
    saveService(() => {
      processService({ serviceId: value.serviceId }, (data) => {
        setLoading(false)
        setResultData(data)
      })
    })
  }

  function saveService(thenCb) {
    setLoading(true)
    processService({ serviceId: 'service.update', parameters: value }, () => {
      if (typeof thenCb === 'function') {
        thenCb()
      } else {
        setLoading(false)
      }
    })
  }

  function createGridOptions(header) {
    const columnDefs = header.map((head) => ({
      headerName: head,
      field: head,
      sortable: true,
      filter: true,
      filterParams: {
        applyButton: true,
        resetButton: true
      }
    }))
    return {
      columnDefs,
      pagination: true,
      paginationPageSize: 2000,
      defaultColDef: {
        flex: 1,
        minWidth: 100
      },
      rowSelection: 'single'
    }
  }
}
