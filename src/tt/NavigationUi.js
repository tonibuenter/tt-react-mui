import React, { useEffect, useState } from 'react'

import Icon from '@material-ui/core/Icon'

import { BreadcrumbsUi } from './CommonUi'
import { arrayCompare, label, modulo } from './utils'

import ttStyles from './TT.module.css'
import navStyles from './NavigationUi.module.css'
import Alert from '@material-ui/lab/Alert/Alert'
import { resolveUiType } from './WidgetMap'

let versionCounter = 0

const SPLIT_CLASSES = ['', 'ttTwoThrid', 'ttOneThrid']

export function NavigationUi({ ttdefs, startName, value, data, action, mode }) {
  console.log('NavigationUi render')

  const [currentSplit, setCurrentSplit] = useState(0)
  const [breadcrumbs, setBreadcrumbs] = useState([])

  useEffect(() => {
    console.log('NavigationUi useEffect...')
    setBreadcrumbs([
      {
        ttdef: ttdefs[startName],
        label: label(ttdefs[startName]),
        value: value,
        data: data,
        version: versionCounter++
      }
    ])
  }, [startName, data])

  return (
    <div className={navStyles.ttNavigationUi + SPLIT_CLASSES[currentSplit]}>
      <div className={navStyles.ttToolbar}>
        <div>
          <BreadcrumbsUi breadcrumbs={breadcrumbs} action={navigatonAction} />
        </div>
        <div className={ttStyles.ttTitle}> Welcome to TT goes React</div>

        <div className={navStyles.ttIcons}>
          <Icon
            className={ttStyles.ttIcon}
            onClick={() => setCurrentSplit(modulo(currentSplit + 1, 3))}
          >
            view_carousel
          </Icon>
          <Icon className={ttStyles.ttIcon} onClick={() => action('close')}>
            close
          </Icon>
        </div>
      </div>
      <div className={navStyles.ttCenter}>
        <div className={navStyles.ttPaper}>
          {breadcrumbs.length === 0 ? (
            <div>navigation ui init</div>
          ) : breadcrumbs.length === 1 || mode === 'singleScreen' ? (
            <div className={navStyles.ttBoth}>
              {topDispatch(breadcrumbs[breadcrumbs.length - 1], (cmd, value) =>
                navigatonAction(breadcrumbs.length - 1, cmd, value)
              )}
            </div>
          ) : (
            <>
              <div className={navStyles.ttLeft}>
                {topDispatch(
                  breadcrumbs[breadcrumbs.length - 2],
                  (cmd, value) =>
                    navigatonAction(breadcrumbs.length - 2, cmd, value)
                )}
              </div>
              <div className={navStyles.ttRight}>
                {topDispatch(
                  breadcrumbs[breadcrumbs.length - 1],
                  (cmd, value) =>
                    navigatonAction(breadcrumbs.length - 1, cmd, value)
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <div className={navStyles.ttFooter}>Footer (Navigation Ui)</div>
    </div>
  )

  function navigatonAction(index, cmd, event) {
    switch (cmd) {
      case 'forward': {
        forward(index, event)
        break
      }
      case 'home':
        action('done')
        break
      case 'close':
      case 'cancel': {
        const c = breadcrumbs.filter((cb, i) => i < index)
        if (c.length > 0 && cmd === 'close')
          c[c.length - 1].version = versionCounter++
        arrayCompare(c, breadcrumbs)
        setBreadcrumbs(c)
        break
      }
      case 'breadcrumb': {
        const c = breadcrumbs.filter((cb, i) => i <= index)
        c[c.length - 1].version = versionCounter++
        setBreadcrumbs(c)
        break
      }
      case 'refresh': {
        // let c = breadcrumbs.map(bc => ({...bc}));
        const c = [...breadcrumbs]
        if (event.value) {
          c[index].value = { ...c[index].value, ...event.value }
        }
        c[index] = { ...c[index], version: versionCounter++ }
        setBreadcrumbs(c)
        break
      }
      default: {
        //
      }
    }

    function forward(index, event) {
      const ttdef = event && event.action ? ttdefs[event.action.forward] : null
      if (!ttdef) {
        console.error(
          'No ttdef found for event: ',
          JSON.stringify(event || '-empty-')
        )
        return
      }

      const newEntry = {
        ttdef: ttdef,
        label: label(ttdef, event.value),
        value: event.value,
        data: event.data,
        version: versionCounter++
      }
      const newBreadcrumbs = [...breadcrumbs]

      if (index < newBreadcrumbs.length - 1) {
        newBreadcrumbs.splice(index + 1, newBreadcrumbs.length - (index + 1))
      }
      newBreadcrumbs.push(newEntry)
      setBreadcrumbs(newBreadcrumbs)
    }
  }

  function topDispatch(bc, action) {
    const { name, ttdef } = bc

    if (!ttdef) {
      return (
        <Alert
          severity='error'
          onClose={() => action('cancel')}
        >{`No TT definition found for  ${name}`}</Alert>
      )
    }
    if (!ttdef.uiType) {
      return (
        <Alert
          severity='error'
          onClose={() => action('cancel')}
        >{`No uiType defined for TT definition ${ttdef.name}`}</Alert>
      )
    }
    const uiFun = resolveUiType(ttdef.uiType)
    bc.action = action

    if (typeof uiFun !== 'function') {
      return (
        <Alert
          severity='error'
          onClose={() => action('cancel')}
        >{`Unknown uiType for TT definition ${ttdef.name} with uiType=${ttdef.uiType}`}</Alert>
      )
    }
    return React.createElement(uiFun, bc, null)
  }
}
