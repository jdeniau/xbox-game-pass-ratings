import { useEffect, useState } from 'react';
import { Table, Column, HeaderCell, Cell } from 'rsuite-table';
import 'rsuite-table/dist/css/rsuite-table.css'; // or 'rsuite-table/lib/less/index.less'
import { stripTags } from '../../src/utils/string.mjs';

const ImageCell = ({ rowData, dataKey, ...rest }) => (
  <Cell {...rest}>
    <img src={rowData[dataKey]} width="50" />
  </Cell>
);

function useGameList() {
  const [dataList, setDataList] = useState(null);

  useEffect(() => {
    import('../../db.json').then((gameList) => {
      const dataList = gameList.map((game) => ({
        title: game.title,
        releaseDate: new Date(game.releaseDate),
        jvcomGauge: game.jvcom?.gauge,
        jvcomSearchTitle: stripTags(game.jvcom?.searchTitle),
        jvcomUrl: game.jvcom?.url,
      }));

      setDataList(dataList);
    });
  }, []);

  return dataList;
}

export default function GameList() {
  const dataList = useGameList();

  if (!dataList) {
    return null;
  }

  const [sortColumn, setSortColumn] = useState('jvcomGauge');
  const [sortType, setSortType] = useState('desc');

  function handleSortColumn(sortColumn, sortType) {
    console.log(sortColumn, sortType);
    setSortColumn(sortColumn);
    setSortType(sortType);
  }

  const sortedDataList = dataList.sort((a, b) => {
    let x = a[sortColumn];
    let y = b[sortColumn];

    if (sortColumn === 'jvcomGauge') {
      x = parseInt(x, 10);
      y = parseInt(y, 10);

      if (Number.isNaN(x) && Number.isNaN(y)) {
        return 0;
      } else if (!Number.isNaN(x) && !Number.isNaN(y)) {
        // console.log(x, y);
        return sortType === 'asc' ? x - y : y - x;
      } else if (Number.isNaN(y)) {
        return sortType === 'asc' ? 1 : -1;
      } else {
        return sortType === 'asc' ? -1 : 1;
      }
    }

    if (typeof x === 'string') {
      return x.localeCompare(y) * (sortType === 'asc' ? 1 : -1);
    }

    if (sortType === 'asc') {
      return x - y;
    } else {
      return y - x;
    }
  });

  return (
    <Table
      data={sortedDataList}
      autoHeight
      defaultExpandAllRows
      sortColumn={sortColumn}
      sortType={sortType}
      onSortColumn={handleSortColumn}
    >
      <Column flexGrow={1} sortable>
        <HeaderCell>title</HeaderCell>
        <Cell dataKey="title" />
      </Column>

      <Column flexGrow={1} sortable>
        <HeaderCell>releaseDate</HeaderCell>
        <Cell dataKey="releaseDate">
          {(rowData, rowIndex) => {
            return rowData.releaseDate.toLocaleDateString();
          }}
        </Cell>
      </Column>

      <Column flexGrow={1}>
        <HeaderCell>jvcom searchTitle</HeaderCell>
        <Cell dataKey="jvcomSearchTitle" />
      </Column>

      <Column flexGrow={1} sortable>
        <HeaderCell>gauge</HeaderCell>
        <Cell dataKey="jvcomGauge">
          {(rowData, rowIndex) => {
            return (
              <a
                target="_blank"
                rel="noopener noreferer"
                href={rowData.jvcomUrl}
              >
                {rowData.jvcomGauge}
              </a>
            );
          }}
        </Cell>
      </Column>
    </Table>
  );
}
