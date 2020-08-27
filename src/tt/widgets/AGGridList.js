import React, {useEffect, useMemo, useState} from 'react';


import {AgGridReact} from 'ag-grid-react/main';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

import {label, toList} from "../utils";
import {processService} from "../api";
import {Link} from '@material-ui/core';
import Alert from "@material-ui/lab/Alert";
import {DebugUi, ProgressUi, renderAction} from "../CommonUi";

export function AGGridList(props) {

    const {action, ttdef} = props;

    const [currentData, setCurrentData] = useState([]);
    const [currentList, setCurrentList] = useState(null);
    const [currentSelectedKey, setCurrentSelectedKey] = useState('');
    const [exception, setException] = useState(null);

    const [actionRunning, setActionRunning] = useState(null);

    const [filterValue, setFilterValue] = useState('');


    const refreshAction = props.ttdef.actions.filter(actionDef => actionDef.type === 'refresh')[0];
    const toolbarActions = props.ttdef.actions.filter(actionDef => !actionDef.source || actionDef.source === 'toolbar');
    const rowSelectAction = props.ttdef.actions.filter(actionDef => actionDef.source === 'rowSelect')[0];
    const rowActions = props.ttdef.actions.filter(actionDef => actionDef.source === 'row');

    const gridOptions = useMemo(() => createGridOptions(props.ttdef), [currentSelectedKey, props.ttdef]);

    console.log('AGGridList render; version: %s', props.version);

    useEffect(() => {
        processTopAction(refreshAction);
    }, [props.version]);

    return (

        actionRunning
            ?
            <ProgressUi message={`Action processing ${actionRunning.name}`}/>
            :
            exception
                ?
                <Alert severity="error" onClose={() => action('home', {})}>{exception}</Alert>
                :
                <div style={{display: 'grid', gridTemplateRows: '0fr 1fr 0fr', height: '100%'}}>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 0fr'}}>
                        <div style={{padding: '1em'}}>
                            <input
                                value={filterValue}
                                name="filter"
                                placeholder={'filter...'}
                                onChange={externalFilterChanged}
                            />

                            &nbsp;
                            <Link href={'#'} onClick={clearFilter}>clear</Link>
                        </div>
                        <div style={{padding: '1em', whiteSpace: 'nowrap'}}>{
                            toolbarActions.map((actionDef, index) => renderAction({
                                actionDef,
                                index,
                                action: processTopAction,
                                value: props.value
                            }))

                        }</div>
                    </div>
                    <div
                        className="ag-theme-material"
                        style={{height: '100%', width: '100%'}}
                    >
                        <AgGridReact
                            gridOptions={gridOptions}
                            rowData={currentList}
                            onCellClicked={(cell) => {
                                if (cell.column.getColId() === 'ACTION_COLUMN') {
                                    return;
                                }
                                if (rowSelectAction) {
                                    setCurrentSelectedKey(createKey(cell.data));
                                    processRowAction(rowSelectAction, cell.data);
                                }
                            }}>
                        </AgGridReact>

                    </div>
                    <DebugUi currentVersion={props.version}/>
                </div>
    );

    function processTopAction(actionDef) {
        _processAction(actionDef, {})
    }

    function externalFilterChanged(e) {
        let filterValue = e.target.value;
        let newList = [];
        let currentList = toList(currentData);
        currentData.table.forEach((row, index) => {
            let match = false;
            row.forEach(cell => {
                if (cell.includes(filterValue)) {
                    match = true;
                }
            });
            if (match)
                newList.push(currentList[index]);
        });
        setCurrentList(newList);
        setFilterValue(filterValue);
    }

    function clearFilter() {
        setFilterValue('');
        setCurrentList(toList(currentData));
    }


    function processRowAction(actionDef, row) {
        _processAction(actionDef, row)
    }

    function _processAction(actionDef, row) {

        setException(null);
        if (!actionDef) {
            return;
        }

        let value = {...actionDef.parameters, ...props.value, ...row};
        let newAction = {...actionDef, value};
        setActionRunning(newAction);
        processService(newAction, processResult);

        function processResult(data) {
            setActionRunning(null);
            if (data && data.exception) {
                setException(data.exception);
                return
            }
            if (actionDef.type === 'refresh') {
                let list = toList(data);
                setCurrentData(data);
                setCurrentList(list);
                return;
            }
            if (actionDef.type === 'close') {
                action('close', {action: actionDef, value, data});
                return
            }
            if (actionDef.type === 'cancel') {
                action('cancel', {action: actionDef, value, data});
                return
            }
            if (actionDef.forward) {
                action('forward', {action: actionDef, value, data});
                return
            }
            if (data.exception) {
                setException(data.exception);
                return
            }
            if (actionDef.type === 'update') {
                let row = toList(data)[0];
                if (row) {
                    //setCurrentRow(row)
                }
            }
        }

    }

    function RowActionsRenderer(props) {
        let row = props.data;
        return <div>{
            rowActions.map((actionDef, index) =>
                <Link key={index} onClick={(event) => {
                    _processAction(actionDef, row)
                }}>{label(actionDef.name)}</Link>
            )
        }</div>;
    }

    function createGridOptions(ttdef) {

        const columnDefs = ttdef.attributes.map((attr) =>
            ({
                headerName: label(attr),
                field: attr.name,
                width: +attr.width || 120,
                resizable: true,
                sortable: !!attr.sortable,
                filter: !!attr.filter,
                filterParams: {
                    applyButton: true,
                    resetButton: true,
                }
            })
        );

        if (rowActions.length > 0) {
            columnDefs.push({
                headerName: 'actions',
                field: 'ACTION_COLUMN',
                resizable: false,
                sortable: false,
                filter: false,
                cellRenderer: 'rowActionsRenderer'
            });
        }


        return {
            columnDefs,
            pagination: true,
            paginationPageSize: 2000
            ,
            frameworkComponents: {
                rowActionsRenderer: RowActionsRenderer
            },
            defaultColDef: {
                flex: 1,
                minWidth: 100,
            },
            rowSelection: 'single',
            isRowSelectable: function (rowNode) {
                if (createKey(rowNode.data) === currentSelectedKey) {
                    rowNode.setSelected(true, true);
                }
                return true;
            }
        };

        // api.sizeColumnsToFit() on the gridReady

    }

    function createKey(value) {
        let key = ttdef.attributes.reduce((acc, att) => att.isKey ? acc + value[att.name] : acc, '');
        return key;
    }

}
