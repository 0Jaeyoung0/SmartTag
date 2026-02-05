import React, {useState, useEffect, useMemo} from 'react';
import axios from 'axios';
import {useTable, useSortBy, useGlobalFilter} from 'react-table';
import './DatabaseComponent.css';
import {urlDefault} from './config';

const GlobalFilter = ({ filter, preFilteredRows, setFilter }) => {
    return (
      <input
        value={filter || ''}
        onChange={(e) => setFilter(e.target.value || undefined)}
        placeholder="Search..."
        className="search-input"
      />
    );
  };

  
const DatabaseComponent = () => {
    const [globalFilter, setGlobalFilter] = useState('');
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [tablelist, setTableList] = useState([]);
    const [curTable, setCurTable] = useState('');


    const fetchData = async() => {
        try {
            const api_response = await axios.get(`${urlDefault}/api/tablelist`);
            const list = api_response.data;
            const queryUrl = `${urlDefault}/query/${list[0]}`;
            const response = await axios.get(queryUrl);
            console.log(list, queryUrl);
            const columnDefinitions = response.data.field.map(field => ({
                Header: field.name,
                accessor: field.name,
            }));
            setCurTable(list[0]);
            setTableList(list);
            setData(response.data.row);
            setColumns(columnDefinitions);
        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        fetchData();
    }, []);

    const fetchTable = async() => {
        try {
            const queryUrl = `${urlDefault}/query/${curTable}`;
            const response = await axios.get(queryUrl);
            const columnDefinitions = response.data.field.map(field => ({
                Header: field.name,
                accessor: field.name,
            }));
            setData(response.data.row);
            setColumns(columnDefinitions);
        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        fetchTable();
    }, [curTable]);

    const updateTable = async(id, column, value) => {
        try{
            const queryUrl = `${urlDefault}/query/update`;
            const data = {
                id: id,
                column: column,
                value: value
            };
            const response = await fetch(queryUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            console.log(result);

        } catch (error) {
            console.log(error);
        }
    };

  
    // 테이블 훅 사용
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, setGlobalFilter: setGlobalTableFilter } = useTable(
      { columns, data, initialState: { globalFilter } },
      useGlobalFilter // 필터 훅 추가
    );
  
    // 전역 필터 설정
    useEffect(() => {
      setGlobalTableFilter(globalFilter);
    }, [globalFilter, setGlobalTableFilter]);

    const handleInputChange = (e, rowIndex) => {
        const updatedData = [...data];
        updatedData[rowIndex] = {
            ...updatedData[rowIndex],
            connection_interval: e.target.value,
        };
        setData(updatedData);
    };

    const handleKeyPress = async (e, columnID, rowIndex) => {
        if(e.key === 'Enter') {
            const curData = data[rowIndex];
            console.log(curData[columnID]);
            updateTable(curData.id, columnID, curData[columnID]);
        }
    }
  
    return (
      <div className="database-container">

        <div className="database-container-title">데이터베이스 테이블</div>
        <div className="table-select-container">
            {
                tablelist.map(table => (
                    <div className={`${table == curTable ? 'table-selected' : 'table-select'}`}
                        onClick={() => {
                        setCurTable(table);
                    }}>
                        {table}
                    </div>
                ))
            }
        </div>
        <div className="table-container">
        <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
            <table {...getTableProps()} className="table">
            <caption>My Custom Table</caption>
            <thead>
                {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map(column => (
                    <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                    ))}
                </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map((row, rowIndex) => {
                prepareRow(row);
                return (
                    <tr {...row.getRowProps()}>
                    {row.cells.map(cell => (
                        <td {...cell.getCellProps()}>
                            
                            {
                            cell.column.id === 'connection_interval' ?
                                (
                                    <input
                                        className="column-input"
                                        type="text"
                                        value={cell.value}
                                        onChange={(e) => {
                                            handleInputChange(e, rowIndex)
                                        }}
                                        onKeyDown={(e) => {
                                            handleKeyPress(e, cell.column.id, rowIndex)
                                        }}
                                        />
                                ) :
                                (
                                    cell.render('Cell')
                                )
                            }

                        </td>
                    ))}
                    </tr>
                );
                })}
            </tbody>
            </table>
        </div>
      </div>
    );
}

export default DatabaseComponent;