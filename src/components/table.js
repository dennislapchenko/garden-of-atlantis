import React from 'react';

export const CheekyTable = ({ headers, data }) => {
  const columns = headers.length;
  const rows = [];
  for (let i = 0; i < data.length; i += columns) {
    const row = [];
    for (let j = 0; j < columns; j++) {
      const index = i + j;
      if (index < data.length) {
        row.push(data[index]);
      } else {
        row.push(null);
      }
    }
    rows.push(row);
  }
  return (
    <table>
      <thead>
      <tr>
        {headers.map((header, i) => (
          <th key={i}>{header}</th>
        ))}
      </tr>
      </thead>
      <tbody>
      {rows.map((row, i) => (
        <tr key={i}>
          {row.map((value, j) => (
            <td key={j}>{value !== null ? value : '-'}</td>
          ))}
        </tr>
      ))}
      </tbody>
    </table>
  );
};

export default CheekyTable

