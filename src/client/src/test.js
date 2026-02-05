import React, { useMemo, useState } from 'react';
import { useTable, useGlobalFilter, useFilters } from 'react-table';

// 글로벌 필터 컴포넌트
const GlobalFilter = ({ globalFilter, setGlobalFilter }) => (
  <span>
    Global Search: 
    <input
      value={globalFilter || ''}
      onChange={(e) => setGlobalFilter(e.target.value || undefined)}
      placeholder="Type to search..."
    />
  </span>
);

// 열별 필터 컴포넌트
const ColumnFilter = ({ columns, selectedColumn, setFilter }) => {
  if (selectedColumn) {
    const column = columns.find(col => col.accessor === selectedColumn);
    return column && column.Filter ? (
      <div>
        {column.Filter({ column: { filterValue: column.filterValue, setFilter } })}
      </div>
    ) : null;
  }
  return null;
};

// 사용자 정의 필터 타입 정의


// 테이블 컴포넌트
const MyTableComponent = () => {
  const [selectedColumn, setSelectedColumn] = useState('');

  const columnFilterTypes = React.useMemo(() => ({
    text: (rows, id, filterValue) => {
      return rows.filter((row) => {
        const cellValue = row.values[id];
        return typeof cellValue === 'string' &&
               cellValue.toLowerCase().includes(filterValue.toLowerCase());
      });
    },
    number: (rows, id, filterValue) => {
      return rows.filter((row) => {
        const cellValue = row.values[id];
        return typeof cellValue === 'number' &&
               cellValue.toString().includes(filterValue);
      });
    },
  }), []);
  
  const columns = React.useMemo(() => [
    {
      Header: 'Name',
      accessor: 'name',
      Filter: ({ column: { filterValue, setFilter } }) => (
        <input
          value={filterValue || ''}
          onChange={(e) => setFilter(e.target.value || undefined)}
          placeholder="Search Name..."
        />
      ),
      filter: 'text',
    },
    {
      Header: 'Age',
      accessor: 'age',
      Filter: ({ column: { filterValue, setFilter } }) => (
        <input
          type="number"
          value={filterValue || ''}
          onChange={(e) => setFilter(e.target.value || undefined)}
          placeholder="Filter Age..."
        />
      ),
      filter: 'number',
    },
    {
      Header: 'Email',
      accessor: 'email',
      Filter: ({ column: { filterValue, setFilter } }) => (
        <input
          value={filterValue || ''}
          onChange={(e) => setFilter(e.target.value || undefined)}
          placeholder="Search Email..."
        />
      ),
      filter: 'text',
    },
  ], []);

  const data = React.useMemo(() => [
    { name: 'Alice', age: 25, email: 'alice@example.com' },
    { name: 'Bob', age: 30, email: 'bob@example.com' },
    { name: 'Carol', age: 35, email: 'carol@example.com' },
  ], []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: { globalFilter },
    setGlobalFilter,
    setFilter,
  } = useTable(
    { 
      columns, 
      data,
      filterTypes: columnFilterTypes
    },
    useGlobalFilter, // 글로벌 필터 훅 사용
    useFilters // 열별 필터 훅 사용
  );

  const handleColumnChange = (e) => {
    const columnId = e.target.value;
    setSelectedColumn(columnId);

    // 열 선택 시 필터를 설정합니다.
    if (columnId) {
      setFilter(columnId, globalFilter);
    } else {
      setGlobalFilter(globalFilter); // 글로벌 필터를 다시 적용
    }
  };

  return (
    <div>
      {/* 컬럼 선택 및 글로벌 필터 */}
      <div>
        <label>
          Select column to filter:
          <select onChange={handleColumnChange} value={selectedColumn}>
            <option value="">Global Search</option>
            {columns.map(column => (
              <option key={column.accessor} value={column.accessor}>
                {column.Header}
              </option>
            ))}
          </select>
        </label>
        <GlobalFilter
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
        <ColumnFilter 
          columns={columns} 
          selectedColumn={selectedColumn} 
          setFilter={setFilter} 
        />
      </div>

      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MyTableComponent;